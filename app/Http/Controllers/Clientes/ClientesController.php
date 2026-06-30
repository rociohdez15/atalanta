<?php

namespace App\Http\Controllers\Clientes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Clientes;
use Illuminate\Support\Facades\Log;
use App\Models\MapaPunto;
use App\Models\Itinerario;
use App\Models\GaleriaProyecto;
use App\Models\NoIncluye;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\File;


class ClientesController extends Controller
{
    public function reservasPorCliente($clienteId): JsonResponse
{
    try {
        $reservas = Reserva::with(['cliente2', 'paquete'])
            ->where('cliente_id', $clienteId)
            ->get()
            ->map(function ($reserva) {
                return [
                    'id' => $reserva->id,
                    'reservation_token' => $reserva->reservation_token,
                    'cliente_nombre' => $reserva->cliente2->nombre ?? 'N/A',
                    'paquete_nombre' => $reserva->paquete->nombre ?? 'N/A',
                    'num_personas' => $reserva->num_personas,
                    'fecha_pago' => $reserva->fecha_pago,
                    'metodo_pago' => $reserva->metodo_pago,
                    'descuento' => $reserva->descuento,
                    'estado' => $reserva->estado,
                    'num_cuotas' => $reserva->num_cuotas,
                    'importe_cuotas' => $reserva->importe_cuotas,
                    'total_precio' => $reserva->total_precio,
                    'fecha_reserva' => $reserva->fecha_reserva,
                ];
            });

        return response()->json($reservas);

    } catch (\Exception $e) {
        Log::error($e->getMessage());

        return response()->json([
            'message' => 'Error al obtener reservas'
        ], 500);
    }
}
}
