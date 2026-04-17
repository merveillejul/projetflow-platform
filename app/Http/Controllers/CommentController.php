<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use App\Models\Task;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Task $task)
    {
        return $task->comments()->with('user')->latest()->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Task $task)
    {
        $request->validate(['content' => 'required|string']);

        $comment = \App\Models\Comment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        // Notifier le chef du projet
        $project = $task->project;
        if ($project->user_id !== $request->user()->id) {
            \App\Models\Notification::create([
                'user_id' => $project->user_id,
                'message' => $request->user()->nom . ' a commenté la tâche : ' . $task->titre,
                'type'    => 'comment_added',
            ]);
        }

        // Notifier le membre assigné si différent du commentateur
        if ($task->assigne_a && $task->assigne_a !== $request->user()->id) {
            \App\Models\Notification::create([
                'user_id' => $task->assigne_a,
                'message' => $request->user()->nom . ' a commenté la tâche : ' . $task->titre,
                'type'    => 'comment_added',
            ]);
        }

        return response()->json($comment->load('user'), 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Comment $comment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comment $comment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== auth()->id()) {
            abort(403);
        }

        $comment->delete();

        return response()->json(['message'=>'Commentaire supprimé']);
    }
}
