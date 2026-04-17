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

    public function show(Project $project)
    {
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
        $project->update($request->only([
            'titre', 'description', 'technologies',
            'date_debut', 'date_fin', 'budget', 'statut'
        ]));

        return response()->json($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json(['message' => 'Projet supprimé.']);
    }
}