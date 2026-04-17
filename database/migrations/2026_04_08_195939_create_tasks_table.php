<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            $table->string('titre');

            $table->text('description')->nullable();

            $table->enum('priorite', ['basse', 'normale', 'haute'])->default('normale');

            $table->enum('statut', ['a_faire', 'en_cours', 'termine'])->default('a_faire');

            $table->date('date_echeance')->nullable();

            $table->foreignId('project_id')->constrained()->cascadeOnDelete();

            $table->foreignId('assigne_a')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
