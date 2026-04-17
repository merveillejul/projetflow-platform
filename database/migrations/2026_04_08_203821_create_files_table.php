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
        Schema::create('files', function (Blueprint $table) {

            $table->id();

            $table->string('nom');
            $table->string('chemin');

            $table->string('type')->nullable();
            $table->integer('taille')->nullable();

            $table->foreignId('upload_by')->constrained('users');

            $table->foreignId('project_id')->constrained()->cascadeOnDelete();

            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
