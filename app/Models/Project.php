<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'technologies',
        'date_debut',
        'date_fin',
        'statut',
        'budget',
        'user_id',
    ];

    protected $casts = [
        'technologies' => 'array',
    ];

    // Chef propriétaire du projet
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Membres de l'équipe via table pivot project_user
    public function members()
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot('role_equipe')
            ->withTimestamps();
    }

    // Tâches du projet
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    // Fichiers du projet
    public function files()
    {
        return $this->hasMany(File::class);
    }
}