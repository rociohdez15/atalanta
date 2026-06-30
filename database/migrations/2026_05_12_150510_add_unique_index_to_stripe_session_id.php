<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | LIMPIAR DATOS INVÁLIDOS
        |--------------------------------------------------------------------------
        */

        DB::table('reservas')
            ->whereNull('stripe_session_id')
            ->orWhere('stripe_session_id', '')
            ->delete();

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR DUPLICADOS SI EXISTEN
        |--------------------------------------------------------------------------
        */

        $duplicados = DB::table('reservas')
            ->select('stripe_session_id')
            ->groupBy('stripe_session_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('stripe_session_id');

        foreach ($duplicados as $sessionId) {

            $ids = DB::table('reservas')
                ->where('stripe_session_id', $sessionId)
                ->orderBy('id')
                ->pluck('id');

            $mantener = $ids->shift();

            DB::table('reservas')
                ->whereIn('id', $ids)
                ->delete();
        }

        /*
        |--------------------------------------------------------------------------
        | AÑADIR UNIQUE INDEX
        |--------------------------------------------------------------------------
        */

        Schema::table('reservas', function (Blueprint $table) {

            $table->unique('stripe_session_id');
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {

            $table->dropUnique(['stripe_session_id']);
        });
    }
};