<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Task extends Model
{
     use HasFactory;
    protected $fillable = [
        'titre',
        'description',
        'priorite',
        'statut',
        'date_echeance',
        'project_id',
        'assigne_a',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class,'assigned_to');
    }
}
