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

        $projects = Project::where('user_id',$user->id)->count();

        $tasks = Task::whereHas('project',function($q) use ($user){
            $q->where('user_id',$user->id);
        });

        return response()->json([
            'projects' => $projects,
            'total_tasks' => $tasks->count(),
            'todo' => (clone $tasks)->where('statut','a_faire')->count(),
            'progress' => (clone $tasks)->where('statut','en_cours')->count(),
            'done' => (clone $tasks)->where('statut','termine')->count(),
        ]);
    }
}