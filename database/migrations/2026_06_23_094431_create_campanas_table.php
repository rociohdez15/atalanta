<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campanas', function (Blueprint $table) {

            $table->id();

            // Nombre interno campaña
            $table->string('nombre');

            // Texto principal mostrado
            $table->string('titulo');

            // Texto secundario
            $table->text('subtitulo')->nullable();

            // Imagen fondo del carrusel
            $table->string('imagen');

            // Texto del botón
            $table->string('boton')->nullable();

            // Ruta donde manda el botón
            $table->string('link')->nullable();

            // Activar/desactivar desde CRM
            $table->boolean('activo')->default(false);

            // Programación de campaña
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();

            // Orden del carrusel
            $table->integer('orden')->default(0);

            $table->timestamps();

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('campanas');
    }
};