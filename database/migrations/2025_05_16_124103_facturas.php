<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migración
return new class extends Migration {
    public function up(): void {
        Schema::create('facturas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cliente_id');
            $table->unsignedBigInteger('reserva_id');
            $table->string('nombre_cliente');
            $table->string('apellidos_cliente');
            $table->string('email_cliente', 150);
            $table->timestamp('fecha_compra')->nullable()->useCurrent();
            $table->string('metodo_pago', 50);
            $table->decimal('precio_total', 10, 2);
            $table->decimal('iva', 5, 2);
            $table->string('telefono_empresa', 20);
            $table->string('email_empresa', 150);
            $table->text('detalles');
            $table->timestamps();

            $table->foreign('cliente_id')->references('id')->on('clientes')->onDelete('cascade');
            $table->foreign('reserva_id')->references('id')->on('reservas')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('facturas');
    }
};

