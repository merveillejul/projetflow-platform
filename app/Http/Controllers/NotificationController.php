<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    // Liste notifications utilisateur
    public function index(Request $request)
    {
        return Notification::where('user_id',$request->user()->id)
            ->latest()
            ->get();
    }

    // Compteur non lues
    public function unreadCount(Request $request)
    {
        return [
            'count' => Notification::where('user_id',$request->user()->id)
                ->where('is_read',false)
                ->count()
        ];
    }

    // Marquer UNE notification lue
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);

        $notification->update([
            'is_read'=>true
        ]);

        return response()->json(['message'=>'Lu']);
    }

    // Tout marquer lu
    public function markAllRead(Request $request)
    {
        Notification::where('user_id',$request->user()->id)
            ->update(['is_read'=>true]);

        return response()->json(['message'=>'Tout lu']);
    }
}