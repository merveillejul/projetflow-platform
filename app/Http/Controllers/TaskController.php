<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Models\Notification;

class TaskController extends Controller
{
    public function index(Request $request, $projectId)
    {
        $user    = $request->user();
        $project = Project::findOrFail($projectId);

        if ($user->role === 'admin') {
            return Task::with('assignedUser')->where('project_id', $projectId)->get();
        }

        if ($user->role === 'chef' && intval($project->user_id) === intval($user->id)) {
            return Task::with('assignedUser')->where('project_id', $projectId)->get();
        }

        $isMember = \DB::table('project_user')
            ->where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->exists();

        if ($isMember) {
            return Task::with('assignedUser')->where('project_id', $projectId)->get();
        }

        return response()->json([]);
    }

    public function show(Request $request, Task $task)
    {
        $user    = $request->user();
        $project = $task->project;

        if ($user->role === 'admin') {
            return response()->json($task);
        }

        $isOwner  = $project && intval($project->user_id) === intval($user->id);
        $isMember = $project && \DB::table('project_user')
            ->where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->exists();

        if (!$isOwner && !$isMember) {
            return response()->json(['message' => 'Accès interdit à cette tâche.'], 403);
        }

        return response()->json($task);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre'      => 'required',
            'project_id' => 'required|exists:projects,id',
        ]);

        $project = Project::findOrFail($request->project_id);
        $user    = $request->user();

        if ($user->role === 'chef' && intval($project->user_id) !== intval($user->id)) {
            return response()->json(['message' => 'Vous ne pouvez créer des tâches que dans vos propres projets.'], 403);
        }

        $exists = Task::where('project_id', $request->project_id)
            ->where('titre', $request->titre)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Une tâche avec ce titre existe déjà dans ce projet.'
            ], 422);
        }

        $task = Task::create([
            'titre'         => $request->titre,
            'description'   => $request->description,
            'project_id'    => $request->project_id,
            'date_echeance' => $request->date_echeance,
            'statut'        => $request->statut ?? 'a_faire',
            'priorite'      => $request->priorite ?? 'normale',
            'assigne_a'     => $request->assigne_a,
        ]);

        if ($request->assigne_a) {
            Notification::create([
                'user_id' => $request->assigne_a,
                'message' => 'Une tâche vous a été assignée : ' . $task->titre,
                'type'    => 'task_assigned',
                'is_read' => false,
            ]);
        }

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $user = $request->user();

        if ($user->role === 'membre') {
            if (intval($task->assigne_a) !== intval($user->id)) {
                return response()->json(['message' => 'Non autorisé.'], 403);
            }
            $task->update(['statut' => $request->statut]);

            $project = \App\Models\Project::find($task->project_id);
            if ($project) {
                Notification::create([
                    'user_id' => $project->user_id,
                    'message' => $user->nom . ' a mis à jour la tâche "' . $task->titre . '" : ' . $request->statut,
                    'type'    => 'task_updated',
                    'is_read' => false,
                ]);
            }

            return response()->json($task);
        }

        $task->update($request->only([
            'titre', 'description', 'statut', 'priorite',
            'date_echeance', 'assigne_a'
        ]));

        if ($request->has('statut') && $task->assigne_a) {
            Notification::create([
                'user_id' => $task->assigne_a,
                'message' => 'La tâche "' . $task->titre . '" a été mise à jour par ' . $user->nom,
                'type'    => 'task_updated',
                'is_read' => false,
            ]);
        }

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Tâche supprimée.']);
    }
}