<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function manage(User $user, Project $project)
    {
        return $project->users()
            ->where('user_id', $user->id)
            ->whereIn('role_equipe', ['admin', 'chef_equipe'])
            ->exists();
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return $project->users()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Project $project): bool
    {
        return $this->manage($user, $project);
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->manage($user, $project);
    }
}