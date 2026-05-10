<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Notification;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Models\Task;
use Illuminate\Http\Request as HttpRequest;

class CommentController extends Controller
{
    public function index(Task $task)
    {
        return $task->comments()->with('user')->latest()->get();
    }

    public function store(Request $request, Task $task)
    {
        $request->validate(['content' => 'required|string']);

        $comment = Comment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        // Charger le projet via find() — évite le problème de visibilité
        $project = Project::find($task->project_id);

        if ($project) {
            // Notifier le chef si c'est un membre qui commente
            if (intval($project->user_id) !== intval($request->user()->id)) {
                Notification::create([
                    'user_id' => $project->user_id,
                    'message' => $request->user()->nom . ' a commenté la tâche : ' . $task->titre,
                    'type'    => 'comment_added',
                    'is_read' => false,
                ]);
            }

            // Notifier le membre assigné si c'est le chef qui commente
            if ($task->assigne_a && intval($task->assigne_a) !== intval($request->user()->id)) {
                Notification::create([
                    'user_id' => $task->assigne_a,
                    'message' => $request->user()->nom . ' a commenté la tâche : ' . $task->titre,
                    'type'    => 'comment_added',
                    'is_read' => false,
                ]);
            }
        }

        return response()->json($comment->load('user'), 201);
    }

    public function destroy(Comment $comment, HttpRequest $request)
    {
        $user = $request->user();

        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Interdit — vous ne pouvez supprimer que vos propres commentaires.'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Commentaire supprimé.']);
    }
}