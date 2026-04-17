<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('nom');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'chef', 'membre'])->default('membre');
            $table->enum('statut', ['actif', 'en_attente', 'suspendu'])->default('en_attente');
            $table->boolean('first_login')->default(true);
            $table->string('photo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};