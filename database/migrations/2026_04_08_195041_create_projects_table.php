<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {

            $table->id();

            $table->string('titre');
            $table->text('description')->nullable();

            $table->json('technologies')->nullable();
            
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();

            $table->string('statut')->default('en_cours');

            $table->decimal('budget',10,2)->nullable();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
