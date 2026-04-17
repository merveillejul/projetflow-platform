<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // REGISTER — compte en attente de validation admin
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users',
            'nom'      => 'required',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8'
        ]);

        $user = User::create([
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

    // LOGIN
    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        if ($user->statut === 'en_attente') {
            return response()->json(['message' => 'Votre compte est en attente de validation.'], 403);
        }

        if ($user->statut === 'suspendu') {
            return response()->json(['message' => 'Votre compte a été suspendu.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'     => 'Connexion réussie',
            'token'       => $token,
            'user'        => $user,
            'first_login' => $user->first_login,
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    // PROFIL — voir et modifier son propre profil
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nom'   => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        $user->update($request->only(['nom', 'email']));

        return response()->json($user);
    }

    // LISTE utilisateurs — chef et admin
    public function listUsers(Request $request)
    {
        return response()->json(
            User::select('id', 'username', 'nom', 'email', 'role', 'statut')->get()
        );
    }

    // VALIDER un compte — admin uniquement
    public function validateAccount(Request $request, User $user)
    {
        $request->validate([
            'statut' => 'required|in:actif,suspendu,en_attente'
        ]);

        $user->update(['statut' => $request->statut]);

        return response()->json([
            'message' => 'Statut mis à jour.',
            'user'    => $user
        ]);
    }

    // MODIFIER le rôle — admin uniquement
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,chef,membre'
        ]);

        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => 'Rôle mis à jour.',
            'user'    => $user
        ]);
    }

    // SUPPRIMER un compte — admin uniquement
    public function deleteUser(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}