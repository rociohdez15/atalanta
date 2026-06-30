<?php

namespace App\Http\Controllers\Cuotas;

use App\Models\Reserva;
use App\Models\Cuota;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Carbon\Carbon;

class CuotasController extends Controller
{
    public function obtener()
    {
        $cuotas = Cuota::with('reserva.cliente2')->get();

        if ($cuotas->isEmpty()) {
            return response()->json([]);
        }

        $data = $cuotas->groupBy('reserva_id')->map(function ($cuotasGrupo) {

            $reserva = $cuotasGrupo->first()->reserva;
            $cliente = $reserva->cliente2;

            $cuotasArray = [];
            $cuotasExistentes = $cuotasGrupo->keyBy('numero');

            // 🔹 Obtenemos la fecha de la primera cuota existente (numero = 1)
            $primeraCuota = $cuotasExistentes[1] ?? null;
            $fechaBase = null;

            if ($primeraCuota && $primeraCuota->fecha_pago) {
                try {
                    $fechaBase = Carbon::parse($primeraCuota->fecha_pago);
                } catch (\Exception $e) {
                    $fechaBase = Carbon::now();
                }
            } else {
                $fechaBase = Carbon::now(); // fallback
            }

            for ($i = 1; $i <= 6; $i++) {
                if ($i <= $reserva->num_cuotas) {
                    if (isset($cuotasExistentes[$i])) {
                        $cuota = $cuotasExistentes[$i];

                        $fechaPago = ($cuota->fecha_pago && $cuota->fecha_pago != '0000-00-00 00:00:00')
                            ? Carbon::parse($cuota->fecha_pago)
                            : $fechaBase;

                        $cuotasArray[] = [
                            'numero' => $cuota->numero,
                            'importe' => $cuota->importe,
                            'pagada' => $cuota->pagada,
                            'fecha_pago_calculada' => $fechaPago->format('d-m-Y'),
                        ];

                        $fechaBase = $fechaPago->copy()->addMonthNoOverflow();
                    } else {
                        // Cuota pendiente: sumamos 1 mes a la última fechaBase válida
                        $importe = $reserva->importe_cuotas ?? ($reserva->total_precio / $reserva->num_cuotas);

                        $fechaPago = $fechaBase ? $fechaBase->copy()->addMonthNoOverflow() : Carbon::now();

                        $cuotasArray[] = [
                            'numero' => $i,
                            'importe' => round($importe, 2),
                            'pagada' => false,
                            'fecha_pago_calculada' => $fechaPago->format('d-m-Y'),
                        ];

                        $fechaBase = $fechaPago;
                    }
                } else {
                    $cuotasArray[] = null;
                }
            }

            return [
                'reserva_id' => $reserva->id,
                'cliente_nombre' => $cliente->nombre ?? '',
                'cliente_apellidos' => $cliente->apellidos ?? '',
                'cliente_email' => $reserva->id,
                'num_cuotas' => $reserva->num_cuotas,
                'cuotas' => $cuotasArray,
            ];
        })->values();

        return response()->json($data);
    }


    public function marcarPagada(Request $request)
    {
        $data = $request->validate([
            'reserva_id' => 'required|exists:reservas,id',
            'numero' => 'required|integer|min:2|max:6', // 1 siempre pagada
        ]);

        $reserva = Reserva::findOrFail($data['reserva_id']);
        $importe = $reserva->importe_cuotas ?? ($reserva->total_precio / $reserva->num_cuotas);

        // ⚡ Aquí usamos updateOrCreate: si existe, actualiza; si no, crea
        $cuota = Cuota::updateOrCreate(
            [
                'reserva_id' => $reserva->id,
                'numero' => $data['numero'],
            ],
            [
                'importe' => round($importe, 2),
                'pagada' => true,
                'fecha_pago' => Carbon::now(),
            ]
        );

        return response()->json([
            'message' => "Cuota {$data['numero']} de la reserva {$reserva->id} marcada como pagada",
            'cuota' => $cuota,
        ]);
    }
}
