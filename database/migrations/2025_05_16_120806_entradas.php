<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('entradas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('autor_id');
            $table->string('titulo');
            $table->text('contenido');
            $table->text('imagen_destacada')->nullable();
            $table->timestamp('fecha_publicacion')->nullable()->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('entradas');
    }
};
