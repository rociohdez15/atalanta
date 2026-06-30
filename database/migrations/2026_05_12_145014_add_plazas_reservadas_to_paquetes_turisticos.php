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
        Schema::table('paquetes_turisticos', function (Blueprint $table) {

            $table->unsignedInteger('plazas_reservadas')
                ->default(0)
                ->after('plazas');
        });
    }

    public function down(): void
    {
        Schema::table('paquetes_turisticos', function (Blueprint $table) {

            $table->dropColumn('plazas_reservadas');
        });
    }
};
