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
            $table->string('pdf_itinerario')->nullable()->after('precio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paquetes_turisticos', function (Blueprint $table) {
            $table->dropColumn('pdf_itinerario');
        });
    }
};