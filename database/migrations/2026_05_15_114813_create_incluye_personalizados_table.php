<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incluye_personalizados', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('reserva_id');
            $table->text('descripcion');

            $table->timestamps();

            // FK opcional (recomendado)
            $table->foreign('reserva_id')
                ->references('id')
                ->on('reservas')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incluye_personalizados');
    }
};