<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    // LISTE les membres d'un projet
    public function index(Project $project)
    {
        return response()->json($project->members()->get());
    }

    // AJOUTER un membre
    public function store(Request $request, Project $project)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Évite les doublons
        if (!$project->members()->where('user_id', $request->user_id)->exists()) {
            $project->members()->attach($request->user_id, [
                'role_equipe' => 'membre',
                'date_ajout'  => now(),
            ]);
        }

        return response()->json(['message' => 'Membre ajouté']);
    }

    // RETIRER un membre
    public function destroy(Project $project, User $user)
    {
        $project->members()->detach($user->id);

        return response()->json(['message' => 'Membre retiré']);
    }
}