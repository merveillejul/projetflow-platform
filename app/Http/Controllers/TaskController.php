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
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Chef voit toutes les tâches de son projet
        if ($user->role === 'chef' && intval($project->user_id) === intval($user->id)) {
            return Task::with('assignedUser')
                ->where('project_id', $projectId)
                ->get();
        }

        // Vérifier si membre via la table project_user directement
        $isMember = \DB::table('project_user')
            ->where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->exists();

        if ($isMember) {
            return Task::with('assignedUser')
                ->where('project_id', $projectId)
                ->get();
        }

        return response()->json([]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre'      => 'required',
            'project_id' => 'required|exists:projects,id'
        ]);

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

    public function show(Task $task)
    {
        return $task;
    }

    public function update(Request $request, Task $task)
    {
        $user = $request->user();

        if ($user->role === 'membre') {
            if (intval($task->assigne_a) !== intval($user->id)) {
                return response()->json(['message' => 'Non autorisé.'], 403);
            }
            $task->update(['statut' => $request->statut]);

            // Notifier le chef que le statut a changé
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

        // Chef modifie la tâche
        $task->update($request->only([
            'titre', 'description', 'statut', 'priorite',
            'date_echeance', 'assigne_a'
        ]));

        // Notifier le membre assigné si le statut change
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