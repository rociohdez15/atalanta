<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migración
return new class extends Migration {
    public function up(): void {
        Schema::create('historial_compras', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cliente_id');
            $table->unsignedBigInteger('paquete_id');
            $table->timestamp('fecha_compra')->nullable()->useCurrent();
            $table->timestamps();

            $table->foreign('cliente_id')->references('id')->on('clientes')->onDelete('cascade');
            $table->foreign('paquete_id')->references('id')->on('paquetes_turisticos')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('historial_compras');
    }
};
