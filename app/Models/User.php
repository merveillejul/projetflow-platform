<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'username',
        'nom',
        'email',
        'password',
        'role',
        'first_login',
        'photo'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    
        public function tasks()
        {
            return $this->hasMany(Task::class);
        }

        public function comments()
        {
            return $this->hasMany(Comment::class);
        }

        public function uploadedFiles()
        {
            return $this->hasMany(File::class,'upload_by');
        }

        public function projects()
        {
            return $this->belongsToMany(Project::class, 'project_users')
                ->withPivot('role_equipe')
                ->withTimestamps();
        }

        public function notifications()
        {
            return $this->hasMany(Notification::class);
        }

        

}
