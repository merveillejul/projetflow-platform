<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
     use HasFactory;
    protected $fillable = [
        'nom',
        'chemin',
        'type',
        'taille',
        'upload_by',
        'project_id'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class,'upload_by');
    }
}