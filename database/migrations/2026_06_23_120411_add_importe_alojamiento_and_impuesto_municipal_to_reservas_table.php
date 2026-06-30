<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservas', function (Blueprint $table) {

            // 💰 Importe alojamiento (opcional)
            $table->decimal('importe_alojamiento', 10, 2)
                ->nullable()
                ->after('num_personas');

            // 🏛 Impuesto municipal (opcional)
            $table->decimal('impuesto_municipal', 10, 2)
                ->nullable()
                ->after('importe_alojamiento');
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn('importe_alojamiento');
            $table->dropColumn('impuesto_municipal');
        });
    }
};