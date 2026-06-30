<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('resenas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cliente_id');
            $table->unsignedBigInteger('paquete_id');
            $table->integer('num_estrellas'); // número de estrellas, por ejemplo 1 a 5
            $table->date('fecha');
            $table->string('foto_cliente')->nullable();
            $table->text('texto')->nullable();
            $table->timestamps();

            $table->foreign('cliente_id')->references('id')->on('clientes')->onDelete('cascade');
            $table->foreign('paquete_id')->references('id')->on('paquetes_turisticos')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('resenas');
    }
};
