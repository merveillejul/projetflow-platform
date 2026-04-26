<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Mail\CompteValide;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    // ✅ REGISTER — validation renforcée du mot de passe
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users',
            'nom'      => 'required',
            'email'    => 'required|email|unique:users',
            'password' => [
                'required',
                'min:12',
                'regex:/[A-Z]/',               // Au moins 1 majuscule
                'regex:/[a-z]/',               // Au moins 1 minuscule
                'regex:/[0-9]/',               // Au moins 1 chiffre
                'regex:/[@$!%*#?&^_\-+=]/',   // Au moins 1 caractère spécial
            ],
        ], [
            'password.min'   => 'Le mot de passe doit contenir au moins 12 caractères.',
            'password.regex' => 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.',
        ]);

        User::create([
            'username'    => $request->username,
            'nom'         => $request->nom,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'role'        => 'membre',
            'statut'      => 'en_attente',
            'first_login' => true,
        ]);

        return response()->json([
            'message' => 'Compte créé, en attente de validation par un administrateur.'
        ], 201);
    }

    // ✅ LOGIN — rate limiting géré dans routes/api.php (voir ci-dessous)
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // ✅ Message volontairement identique pour ne pas révéler si l'email existe
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        if ($user->statut === 'en_attente') {
            return response()->json(['message' => 'Votre compte est en attente de validation.'], 403);
        }

        if ($user->statut === 'suspendu') {
            return response()->json(['message' => 'Votre compte a été suspendu.'], 403);
        }

        // ✅ Supprimer les anciens tokens avant d'en créer un nouveau
        // Évite l'accumulation de tokens orphelins en base de données
        $user->tokens()->delete();

        // ✅ Token avec expiration de 2h (définie dans sanctum.php)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'     => 'Connexion réussie',
            'token'       => $token,
            'user'        => $user,
            'first_login' => $user->first_login,
        ]);
    }

    // ✅ LOGOUT — supprime uniquement le token actuel, pas tous les tokens
    // Utile si l'utilisateur est connecté sur plusieurs appareils
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    // ✅ CHANGER LE MOT DE PASSE (first_login ou profil)
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'password'         => [
                'required',
                'min:12',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&^_\-+=]/',
                'confirmed', // ✅ Exige le champ password_confirmation
            ],
        ], [
            'password.min'      => 'Le mot de passe doit contenir au moins 12 caractères.',
            'password.regex'    => 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.',
            'password.confirmed'=> 'La confirmation ne correspond pas.',
        ]);

        // ✅ Vérifier que l'ancien mot de passe est correct
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        $user->update([
            'password'    => Hash::make($request->password),
            'first_login' => false, // ✅ Marque que le premier login est terminé
        ]);

        // ✅ Révoquer tous les tokens — force une reconnexion après changement de MDP
        $user->tokens()->delete();

        return response()->json(['message' => 'Mot de passe mis à jour. Veuillez vous reconnecter.']);
    }

    // ✅ UPLOAD PHOTO DE PROFIL
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        // ✅ Supprimer l'ancienne photo du stockage si elle existe
        if ($user->photo && \Storage::disk('public')->exists($user->photo)) {
            \Storage::disk('public')->delete($user->photo);
        }

        // ✅ Stocker la nouvelle photo dans storage/app/public/photos/
        $path = $request->file('photo')->store('photos', 'public');

        $user->update(['photo' => $path]);

        return response()->json([
            // ✅ URL complète retournée directement au frontend
            'photo' => \Storage::url($path),
        ]);
    }

    // PROFIL — mise à jour nom/email
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nom'   => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        // ✅ On retire 'photo' — la photo a sa propre route désormais
        $user->update($request->only(['nom', 'email']));

        return response()->json($user);
    }

    // LISTE utilisateurs (admin)
    public function listUsers(Request $request)
    {
        return response()->json(
            User::select('id', 'username', 'nom', 'email', 'role', 'statut')->get()
        );
    }

    // VALIDER compte (admin)
    public function validateAccount(Request $request, User $user)
    {
        $request->validate([
            'statut' => 'required|in:actif,suspendu,en_attente'
        ]);

        $user->statut = $request->statut;
        $user->save();
        $user->refresh();

        if ($request->statut === 'actif') {
            Mail::to($user->email)->send(new CompteValide($user));
        }

        return response()->json(['message' => 'Statut mis à jour.', 'user' => $user]);
    }

    // MODIFIER rôle (admin)
    public function updateRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|in:admin,chef,membre']);
        $user->update(['role' => $request->role]);
        return response()->json(['message' => 'Rôle mis à jour.', 'user' => $user]);
    }

    // SUPPRIMER utilisateur (admin)
    public function deleteUser(User $user)
    {
        // ✅ Supprimer aussi la photo avant de supprimer l'utilisateur
        if ($user->photo && \Storage::disk('public')->exists($user->photo)) {
            \Storage::disk('public')->delete($user->photo);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}