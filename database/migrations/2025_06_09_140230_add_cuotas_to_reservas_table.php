<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCuotasToReservasTable extends Migration
{
    public function up()
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->integer('num_cuotas')->nullable()->after('estado');
            $table->decimal('importe_cuotas', 10, 2)->nullable()->after('num_cuotas');
        });
    }

    public function down()
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn('num_cuotas');
            $table->dropColumn('importe_cuotas');
        });
    }
}
