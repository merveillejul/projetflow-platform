<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Models\Notification;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   
    public function index(Request $request, $projectId)
    {
        $user = $request->user();
        $project = \App\Models\Project::findOrFail($projectId);

        // Chef voit toutes les tâches de son projet
        if ($user->role === 'chef' && $project->user_id === $user->id) {
            return Task::with('assignedUser')
                ->where('project_id', $projectId)
                ->get();
        }

        // Membre voit toutes les tâches du projet s'il en fait partie
        $isMember = $project->members()->where('user_id', $user->id)->exists();
        if ($isMember) {
            return Task::with('assignedUser')
                ->where('project_id', $projectId)
                ->get();
        }

        return response()->json([]);
    }
    /**
     * Store a newly created resource in storage.
     */
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

        // Notification au membre assigné
        if ($request->assigne_a) {
            \App\Models\Notification::create([
                'user_id' => $request->assigne_a,
                'message' => 'Une tâche vous a été assignée : ' . $task->titre,
                'type'    => 'task_assigned'
            ]);
        }

        return response()->json($task, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        return $task;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $oldStatut = $task->statut;

        $task->update($request->only([
            'titre', 'description', 'statut',
            'date_echeance', 'assigne_a', 'priorite'
        ]));

        if ($request->statut && $oldStatut !== $request->statut && $task->assigne_a) {
            \App\Models\Notification::create([
                'user_id' => $task->assigne_a,
                'message' => 'Statut de la tâche mis à jour : ' . $task->titre,
                'type'    => 'task_updated'
            ]);
        }

        return response()->json($task);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json([
            'message'=>'Tâche supprimée'
        ]);
    }
}
