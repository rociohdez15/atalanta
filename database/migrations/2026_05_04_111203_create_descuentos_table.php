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
        Schema::create('descuentos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('codigo');
            $table->text('descripcion')->nullable();
            $table->string('foto')->nullable();
            $table->string('enlace');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('descuentos');
    }
};
