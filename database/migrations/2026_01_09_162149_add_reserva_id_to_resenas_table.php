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
        Schema::table('resenas', function (Blueprint $table) {
            $table->unsignedBigInteger('reserva_id')->after('cliente_id');

            $table->foreign('reserva_id')
                ->references('id')
                ->on('reservas')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('resenas', function (Blueprint $table) {
            $table->dropForeign(['reserva_id']);
            $table->dropColumn('reserva_id');
        });
    }
};
