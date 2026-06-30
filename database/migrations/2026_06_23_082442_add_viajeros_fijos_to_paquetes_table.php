<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paquetes_turisticos', function (Blueprint $table) {
            $table->unsignedTinyInteger('viajerosFijos')->nullable()->after('plazas');
        });
    }

    public function down(): void
    {
        Schema::table('paquetes_turisticos', function (Blueprint $table) {
            $table->dropColumn('viajerosFijos');
        });
    }
};