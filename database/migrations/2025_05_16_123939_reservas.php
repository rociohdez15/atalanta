<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cliente_id');
            $table->unsignedBigInteger('paquete_id');
            $table->integer('num_personas');
            $table->date('fecha_pago');
            $table->string('metodo_pago');
            $table->decimal('descuento', 5, 2)->default(0);
            $table->string('estado');
            $table->decimal('total_precio', 10, 2);
            $table->date('fecha_reserva');
            $table->timestamps();

            $table->foreign('cliente_id')->references('id')->on('clientes')->onDelete('cascade');
            $table->foreign('paquete_id')->references('id')->on('paquetes_turisticos')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('reservas');
    }
};
