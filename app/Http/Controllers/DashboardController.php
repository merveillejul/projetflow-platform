<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        // Compter les projets selon le rôle
        if ($user->role === 'chef') {
            $projectCount = Project::where('user_id', $user->id)->count();
            $tasks = Task::whereHas('project', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role === 'membre') {
            $projectCount = Project::whereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->count();
            $tasks = Task::where('assigne_a', $user->id);
        } else {
            // admin
            $projectCount = Project::count();
            $tasks = Task::query();
        }

        return response()->json([
            'projects'    => $projectCount,
            'total_tasks' => $tasks->count(),
            'todo'        => (clone $tasks)->where('statut', 'a_faire')->count(),
            'progress'    => (clone $tasks)->where('statut', 'en_cours')->count(),
            'done'        => (clone $tasks)->where('statut', 'termine')->count(),
        ]);
    }
}