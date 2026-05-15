<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Mail\CompteValide;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    private const MAX_ATTEMPTS    = 5;
    private const LOCKOUT_MINUTES = 15;

    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users',
            'nom'      => 'required',
            'email'    => 'required|email|unique:users',
            'password' => [
                'required',
                'min:12',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&^_\-+=]/',
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

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        // BLOC 1 — compte déjà bloqué (remplace les lignes existantes)
        if ($user->isLocked()) {
            $secondsRemaining = (int) now()->diffInSeconds($user->locked_until, false);
            $minutes = ceil($secondsRemaining / 60);
            return response()->json([
                'message'          => "Compte temporairement bloqué. Réessayez dans {$minutes} minute(s).",
                'retry_after_seconds' => $secondsRemaining,
            ], 429);
        }

        if (!Hash::check($request->password, $user->password)) {
            $attempts = $user->login_attempts + 1;

            // BLOC 2 — blocage qui vient de se déclencher (remplace les lignes existantes)
            if ($attempts >= self::MAX_ATTEMPTS) {
                $lockedUntil = Carbon::now()->addMinutes(self::LOCKOUT_MINUTES);
                $user->update([
                    'login_attempts' => $attempts,
                    'locked_until'   => $lockedUntil,
                ]);
                $secondsRemaining = self::LOCKOUT_MINUTES * 60;
                return response()->json([
                    'message'          => 'Trop de tentatives échouées. Compte bloqué pendant ' . self::LOCKOUT_MINUTES . ' minutes.',
                    'retry_after_seconds' => $secondsRemaining,
                ], 429);
            }

            $remaining = self::MAX_ATTEMPTS - $attempts;
            $user->update(['login_attempts' => $attempts]);

            return response()->json([
                'message' => "Email ou mot de passe incorrect. Il vous reste {$remaining} tentative(s) avant blocage.",
            ], 401);
        }

        $user->update([
            'login_attempts' => 0,
            'locked_until'   => null,
        ]);

        if ($user->statut === 'en_attente') {
            return response()->json(['message' => 'Votre compte est en attente de validation.'], 403);
        }

        if ($user->statut === 'suspendu') {
            return response()->json(['message' => 'Votre compte a été suspendu.'], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'     => 'Connexion réussie',
            'token'       => $token,
            'user'        => $user,
            'first_login' => $user->first_login,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

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
                'confirmed',
            ],
        ], [
            'password.min'       => 'Le mot de passe doit contenir au moins 12 caractères.',
            'password.regex'     => 'Doit contenir majuscule, minuscule, chiffre et caractère spécial.',
            'password.confirmed' => 'La confirmation ne correspond pas.',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        if (Hash::check($request->password, $user->password)) {
            return response()->json(['message' => "Le nouveau mot de passe doit être différent de l'ancien."], 422);
        }

        $user->update([
            'password'    => Hash::make($request->password),
            'first_login' => false,
        ]);

        $user->tokens()->delete();

        return response()->json(['message' => 'Mot de passe mis à jour. Veuillez vous reconnecter.']);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        if ($user->photo && \Storage::disk('public')->exists($user->photo)) {
            \Storage::disk('public')->delete($user->photo);
        }

        $path = $request->file('photo')->store('photos', 'public');
        $user->update(['photo' => $path]);

        return response()->json(['photo' => \Storage::url($path)]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nom'   => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        $user->update($request->only(['nom', 'email']));

        return response()->json($user);
    }

    public function listUsers(Request $request)
    {
        return response()->json(
            User::select('id', 'username', 'nom', 'email', 'role', 'statut')->get()
        );
    }

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

    public function updateRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|in:admin,chef,membre']);
        $user->update(['role' => $request->role]);
        return response()->json(['message' => 'Rôle mis à jour.', 'user' => $user]);
    }

    public function deleteUser(User $user)
    {
        if ($user->photo && \Storage::disk('public')->exists($user->photo)) {
            \Storage::disk('public')->delete($user->photo);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}