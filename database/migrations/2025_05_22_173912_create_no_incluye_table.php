<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('no_incluye', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('paquete_id'); // relación con el paquete
            $table->string('descripcion');
            $table->timestamps();

            $table->foreign('paquete_id')->references('id')->on('paquetes')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('no_incluye');
    }
};
