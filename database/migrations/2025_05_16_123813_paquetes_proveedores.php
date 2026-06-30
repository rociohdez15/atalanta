<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('paquetes_proveedores', function (Blueprint $table) {
            $table->unsignedBigInteger('paquete_id');
            $table->unsignedBigInteger('proveedor_id');
            $table->primary(['paquete_id', 'proveedor_id']);
            $table->timestamps();

            $table->foreign('paquete_id')->references('id')->on('paquetes_turisticos')->onDelete('cascade');
            $table->foreign('proveedor_id')->references('id')->on('proveedores')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('paquetes_proveedores');
    }
};