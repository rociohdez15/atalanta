<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id')->unique()->nullable();
            $table->string('nombre')->nullable();
            $table->string('apellidos')->nullable();
            $table->string('dni')->unique()->nullable();
            $table->string('direccion')->nullable();
            $table->string('telefono')->nullable();
            $table->string('fecha_nacimiento')->nullable();
            $table->timestamps();

            // Clave foránea que referencia a la tabla users
            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('clientes');
    }
};
