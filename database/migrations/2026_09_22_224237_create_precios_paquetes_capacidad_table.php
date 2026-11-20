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
        Schema::table('precios_paquetes', function (Blueprint $table) {
            // Número de viajeros que ocupan este tipo de habitación
            // (individual = 1, doble = 2, triple = 3, cuádruple = 4, ...)
            $table->unsignedTinyInteger('capacidad')
                ->default(1)
                ->after('tipo_habitacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('precios_paquetes', function (Blueprint $table) {
            $table->dropColumn('capacidad');
        });
    }
};