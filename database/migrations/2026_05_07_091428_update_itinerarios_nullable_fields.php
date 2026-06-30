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
        Schema::table('itinerarios', function (Blueprint $table) {

            $table->foreign('paquete_turistico_id')
                ->references('id')
                ->on('paquete_turisticos')
                ->onDelete('cascade');

            $table->foreign('reserva_id')
                ->references('id')
                ->on('reservas')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
