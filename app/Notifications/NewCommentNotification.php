<?php

namespace App\Notifications;use Illuminate\Bus\Queueable;

use Illuminate\Notifications\Notification;

class NewCommentNotification extends Notification
{
    use Queueable;

    public $comment;

    public function __construct($comment)
    {
        $this->comment = $comment;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'Nouveau commentaire sur une tâche',
            'task_id' => $this->comment->task_id,
            'user' => $this->comment->user->username
        ];
    }
}