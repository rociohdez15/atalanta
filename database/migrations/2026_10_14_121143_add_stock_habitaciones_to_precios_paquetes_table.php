<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('precios_paquetes', function (Blueprint $table) {
            // Nº total de habitaciones de este tipo en el paquete.
            // NULL = sin límite (compatibilidad con paquetes ya creados).
            $table->unsignedSmallInteger('habitaciones_totales')
                ->nullable()
                ->after('capacidad');

            // Nº de habitaciones que quedan libres.
            // NULL = sin límite. Se decrementa al confirmar una reserva.
            $table->unsignedSmallInteger('habitaciones_disponibles')
                ->nullable()
                ->after('habitaciones_totales');
        });
    }

    public function down(): void
    {
        Schema::table('precios_paquetes', function (Blueprint $table) {
            $table->dropColumn(['habitaciones_totales', 'habitaciones_disponibles']);
        });
    }
};