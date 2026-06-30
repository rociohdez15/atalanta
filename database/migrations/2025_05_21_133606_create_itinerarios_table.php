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
        Schema::create('itinerarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paquete_turistico_id')->constrained()->onDelete('cascade');
            $table->text('dia');
            $table->date('fecha');
            $table->text('descripcion');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itinerarios');
    }
};
