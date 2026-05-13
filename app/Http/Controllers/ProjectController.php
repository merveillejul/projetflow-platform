<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return response()->json(
                Project::with(['members', 'tasks', 'owner'])->get()
            );
        }

        if ($user->role === 'chef') {
            return response()->json(
                Project::with(['members', 'tasks'])
                    ->where('user_id', $user->id)
                    ->get()
            );
        }

        return response()->json(
            Project::with(['members', 'tasks'])
                ->whereHas('members', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->get()
        );
    }

    public function show(Project $project, Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            $isMember = $project->members()->where('user_id', $user->id)->exists();
            $isOwner  = $project->user_id === $user->id;

            if (!$isMember && !$isOwner) {
                return response()->json(['message' => 'Accès interdit à ce projet.'], 403);
            }
        }

        return response()->json($project->load('members', 'tasks', 'owner'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre'      => 'required|string|max:255',
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after:date_debut',
        ]);

        $project = Project::create([
            'titre'        => $request->titre,
            'description'  => $request->description,
            'technologies' => $request->technologies,
            'date_debut'   => $request->date_debut,
            'date_fin'     => $request->date_fin,
            'budget'       => $request->budget,
            'statut'       => 'en_attente',
            'user_id'      => $request->user()->id,
        ]);

        return response()->json($project, 201);
    }

    public function update(Request $request, Project $project)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && intval($project->user_id) !== intval($user->id)) {
            return response()->json(['message' => 'Vous ne pouvez modifier que vos propres projets.'], 403);
        }

        if ($request->statut === 'termine') {
            $totalTaches     = $project->tasks()->count();
            $tachesTerminees = $project->tasks()->where('statut', 'termine')->count();

            if ($totalTaches > 0 && $tachesTerminees < $totalTaches) {
                return response()->json([
                    'message' => "Impossible de terminer le projet — {$tachesTerminees}/{$totalTaches} tâches terminées."
                ], 422);
            }
        }

        $project->update($request->only([
            'titre', 'description', 'technologies',
            'date_debut', 'date_fin', 'budget', 'statut'
        ]));

        return response()->json($project);
    }

    public function destroy(Project $project, Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && intval($project->user_id) !== intval($user->id)) {
            return response()->json(['message' => 'Vous ne pouvez supprimer que vos propres projets.'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Projet supprimé.']);
    }
}