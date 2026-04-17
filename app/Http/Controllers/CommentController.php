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
        $validated = $request->validate([
            'content' => 'required|string'
        ]);

        $comment = Comment::create([
            'task_id' => $task->id,
            'user_id' => auth()->id(),
            'content' => $validated['content']
        ]);

        return $comment->load('user');
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
