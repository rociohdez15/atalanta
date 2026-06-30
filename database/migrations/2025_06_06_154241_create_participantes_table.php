<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('participantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->constrained()->onDelete('cascade'); // FK a reservas

            $table->string('nombre');
            $table->string('apellidos');
            $table->string('email');
            $table->string('dni');
            $table->string('telefono');
            $table->string('direccion');
            $table->string('ciudad');
            $table->string('provincia');
            $table->date('fecha_nacimiento');
            $table->text('experiencia');
            $table->text('motivacion');
            $table->text('info_relevante')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participantes');
    }
};
