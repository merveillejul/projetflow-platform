<?php

namespace App\Policies;

use App\Models\User;
use App\Models\File;

class FilePolicy
{
    public function view(User $user, File $file)
    {
        $project = $file->project;

        if ($project && intval($project->user_id) === intval($user->id)) {
            return true;
        }

        return $project && $project->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function create(User $user)
    {
        return true;
    }

    public function delete(User $user, File $file)
    {
        return $user->id === $file->upload_by
            || $user->role === 'admin';
    }
}