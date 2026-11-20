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
        Schema::create('precios_paquetes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('paquete_id')
                ->constrained('paquetes_turisticos')
                ->cascadeOnDelete();

            $table->string('tipo_habitacion', 50);

            $table->decimal('precio', 10, 2);

            $table->timestamps();

            // Evita tener dos precios para el mismo tipo
            // de habitación dentro del mismo paquete.
            $table->unique(['paquete_id', 'tipo_habitacion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('precios_paquetes');
    }
};