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
        Schema::create('galeria_paquetes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paquete_id')->constrained('paquetes')->onDelete('cascade');
            $table->string('ruta_imagen');
            $table->string('descripcion_imagen')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('galeria_paquetes');
    }
};
