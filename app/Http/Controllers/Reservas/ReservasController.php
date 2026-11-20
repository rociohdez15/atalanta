<?php

namespace App\Http\Controllers\Reservas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Ssheduardo\Redsys\Facades\Redsys;
use Exception;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Reserva;
use App\Models\User;
use App\Models\Cliente;
use App\Models\Participante;
use App\Models\PaqueteTuristico;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReservaConfirmacionMail;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Cuota;
use App\Models\Evento;



class ReservasController extends Controller
{
    public function pendientes()
    {
        $reservasPendientes = Reserva::with(['cliente2', 'paquete'])
            ->where('estado', 'Pendiente')
            ->get()
            ->map(function ($reserva) {

                $paqueteNombre = $reserva->paquete_id == 0
                    ? 'Personalizada'
                    : ($reserva->paquete->nombre ?? 'Personalizada');

                return [
                    'id' => $reserva->id,
                    'reservation_token' => $reserva->reservation_token,
                    'cliente_nombre' => $reserva->cliente2->nombre ?? 'N/A',
                    'paquete_nombre' => $paqueteNombre,
                    'num_personas' => $reserva->num_personas,
                    'fecha_pago' => $reserva->fecha_pago,
                    'fecha_inicio' => $reserva->fecha_inicio,
                    'fecha_fin' => $reserva->fecha_fin,
                    'metodo_pago' => $reserva->metodo_pago,
                    'descuento' => $reserva->descuento,
                    'estado' => $reserva->estado,
                    'num_cuotas' => $reserva->num_cuotas,
                    'importe_cuotas' => $reserva->importe_cuotas,
                    'total_precio' => $reserva->total_precio,
                    'fecha_reserva' => $reserva->fecha_reserva,
                ];
            });

        return response()->json($reservasPendientes);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::with(['cliente2', 'paquete'])->find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $validated = $request->validate([
            'total_precio' => 'required|numeric|min:0',
            'estado' => 'required|string|in:Pendiente,Confirmada,Cancelada',
        ]);

        $reserva->update($validated);

        // Mapeamos como en buscar() para que incluya los nombres del cliente y paquete
        $reservaMapeada = [
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

        return response()->json($reservaMapeada, 200);
    }


    public function destroy($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $reserva->delete();

        return response()->json(['message' => 'Reserva eliminada correctamente'], 200);
    }

    public function buscar(Request $request)
    {
        $input = $request->query('input');

        if (is_numeric($input)) {
            $reserva = Reserva::with(['cliente2', 'paquete'])->find($input);
            if (!$reserva) {
                return response()->json(['message' => 'No se encontraron resultados.'], 404);
            }
            $reservaMapeada = [
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
            return response()->json([$reservaMapeada]);
        }

        $resultados = Reserva::with(['cliente2', 'paquete'])
            ->whereHas('cliente2', function ($query) use ($input) {
                $query->where('nombre', 'LIKE', "%$input%");
            })
            ->orWhereHas('paquete', function ($query) use ($input) {
                $query->where('nombre', 'LIKE', "%$input%");
            })
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

        if ($resultados->isEmpty()) {
            return response()->json(['message' => 'No se encontraron resultados.'], 404);
        }

        return response()->json($resultados);
    }

    public function confirmadas()
    {
        $reservasPendientes = Reserva::with(['cliente2', 'paquete'])
            ->where('estado', 'Confirmada')
            ->get()
            ->map(function ($reserva) {

                $paqueteNombre = $reserva->paquete_id == 0
                    ? 'Personalizada'
                    : ($reserva->paquete->nombre ?? 'Personalizada');

                return [
                    'id' => $reserva->id,
                    'reservation_token' => $reserva->reservation_token,
                    'cliente_nombre' => $reserva->cliente2->nombre ?? 'N/A',
                    'paquete_nombre' => $paqueteNombre,
                    'num_personas' => $reserva->num_personas,
                    'fecha_pago' => $reserva->fecha_pago,
                    'metodo_pago' => $reserva->metodo_pago,
                    'fecha_inicio' => $reserva->fecha_inicio,
                    'fecha_fin' => $reserva->fecha_fin,
                    'descuento' => $reserva->descuento,
                    'estado' => $reserva->estado,
                    'num_cuotas' => $reserva->num_cuotas,
                    'importe_cuotas' => $reserva->importe_cuotas,
                    'total_precio' => $reserva->total_precio,
                    'fecha_reserva' => $reserva->fecha_reserva,
                ];
            });

        return response()->json($reservasPendientes);
    }

    public function canceladas()
    {
        $reservasPendientes = Reserva::with(['cliente2', 'paquete'])
            ->where('estado', 'Cancelada')
            ->get()
            ->map(function ($reserva) {

                $paqueteNombre = $reserva->paquete_id == 0
                    ? 'Personalizada'
                    : ($reserva->paquete->nombre ?? 'Personalizada');

                return [
                    'id' => $reserva->id,
                    'reservation_token' => $reserva->reservation_token,
                    'cliente_nombre' => $reserva->cliente2->nombre ?? 'N/A',
                    'paquete_nombre' => $paqueteNombre,
                    'num_personas' => $reserva->num_personas,
                    'fecha_pago' => $reserva->fecha_pago,
                    'metodo_pago' => $reserva->metodo_pago,
                    'fecha_inicio' => $reserva->fecha_inicio,
                    'fecha_fin' => $reserva->fecha_fin,
                    'descuento' => $reserva->descuento,
                    'estado' => $reserva->estado,
                    'num_cuotas' => $reserva->num_cuotas,
                    'importe_cuotas' => $reserva->importe_cuotas,
                    'total_precio' => $reserva->total_precio,
                    'fecha_reserva' => $reserva->fecha_reserva,
                ];
            });

        return response()->json($reservasPendientes);
    }

    public function getPorReserva($id)
    {
        try {
            $participantes = Participante::where('reserva_id', $id)->get();

            if ($participantes->isEmpty()) {
                return response()->json([], 200); // Devuelve un array vacío si no hay participantes
            }

            return response()->json($participantes, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener los participantes.',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }

    public function updateParticipantes(Request $request, $id)
    {
        $participante = Participante::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'dni' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'ciudad' => 'nullable|string|max:255',
            'provincia' => 'nullable|string|max:255',
            'fecha_nacimiento' => 'nullable|date',
            'experiencia' => 'nullable|string',
            'motivacion' => 'nullable|string',
            'info_relevante' => 'nullable|string',
        ]);

        $participante->update($validated);

        return response()->json($participante);
    }

    public function destroyParticipantes($id)
    {
        $participante = Participante::find($id);

        if (!$participante) {
            return response()->json(['message' => 'Participante no encontrado.'], 404);
        }

        $participante->delete();

        return response()->json(['message' => 'Participante eliminado correctamente.']);
    }

   public function crearPersonalizada(Request $request)
    {
        $request->validate([
            'cliente_id'     => 'required|exists:clientes,id',
            'paquete_id'     => 'nullable',
            'num_personas'   => 'required|integer|min:1',
            'fecha_pago'     => 'required|date',
            'metodo_pago'    => 'required|in:total,parcial',
            'descuento'      => 'nullable|numeric|min:0',
            'estado'         => 'required|in:Pendiente,Confirmada,Cancelada',
            'fecha_reserva'  => 'required|date',
            'fecha_inicio'   => 'nullable|date',
            'fecha_fin'      => 'nullable|date|after_or_equal:fecha_inicio',
            'num_cuotas'     => 'nullable|integer|min:1',
            'importe_cuotas' => 'nullable|numeric|min:0',
            'personalizado'  => 'nullable',
            'destino'        => 'nullable|string|max:255',

            'vouchers.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // BLACK FRIDAY
            'acepta_condiciones_black_friday' => 'nullable|boolean',

            // NOTAS
            'notas' => 'nullable|string|max:5000',
        ]);

        // PARSEO JSON
        $itinerarioInput = json_decode($request->input('itinerario', '[]'), true) ?? [];
        $serviciosInput = json_decode($request->input('servicios_incluidos', '[]'), true) ?? [];

        // PERSONALIZADO
        $esPersonalizado =
            $request->input('personalizado') == true ||
            $request->input('personalizado') === '1' ||
            $request->input('paquete_id') === 'personalizado';

        $paquete    = null;
        $precioBase = 0;

        // PAQUETE NORMAL
        if (!$esPersonalizado) {

            $paquete = PaqueteTuristico::find($request->input('paquete_id'));

            if (!$paquete) {
                return response()->json([
                    'message' => 'Paquete no encontrado'
                ], 404);
            }

            if ($paquete->plazas < $request->input('num_personas')) {
                return response()->json([
                    'message' => 'No hay plazas suficientes'
                ], 422);
            }

            $precioBase = $paquete->precio;
        }

        // BLACK FRIDAY
        $esBlackFriday = $paquete && $paquete->oferta === 'black_friday';
        $aceptaBlackFriday = $request->boolean('acepta_condiciones_black_friday');

        if ($esBlackFriday && !$aceptaBlackFriday) {
            return response()->json([
                'message' => 'Debes aceptar las condiciones de Black Friday para realizar esta reserva.'
            ], 422);
        }

        // VOUCHERS
        $vouchersAdjuntos = [];

        if ($request->hasFile('vouchers')) {

            foreach ($request->file('vouchers') as $file) {

                $path = $file->store('vouchers', 'public');

                $vouchersAdjuntos[] = [
                    'path' => storage_path('app/public/' . $path),
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                ];
            }
        }

        // RESERVA
        $reserva = new Reserva();

        $reserva->reservation_token = Str::uuid();
        $reserva->cliente_id = $request->input('cliente_id');
        $reserva->paquete_id = $paquete ? $paquete->id : 0;
        $reserva->num_personas = $request->input('num_personas');
        $reserva->fecha_inicio = $request->input('fecha_inicio');
        $reserva->fecha_fin = $request->input('fecha_fin');
        $reserva->destino = $request->input('destino');
        $reserva->fecha_pago = $request->input('fecha_pago');
        $reserva->metodo_pago = $request->input('metodo_pago');
        $reserva->descuento = $request->input('descuento') ?? 0;

        // BLACK FRIDAY
        $reserva->acepta_condiciones_black_friday =
            $esBlackFriday ? $aceptaBlackFriday : false;

        $reserva->condiciones_black_friday_aceptadas_at =
            ($esBlackFriday && $aceptaBlackFriday) ? now() : null;

        // RESTO DE DATOS
        $reserva->estado = $request->input('estado');
        $reserva->fecha_reserva = $request->input('fecha_reserva');
        $reserva->num_cuotas = $request->input('num_cuotas') ?? null;
        $reserva->importe_cuotas = $request->input('importe_cuotas') ?? null;

        // NOTAS
        $reserva->notas = $request->input('notas') ?? null;

        // CALCULAR TOTAL
        $total = $paquete
            ? $precioBase * $request->input('num_personas')
            : $request->input('total_precio');

        if ($reserva->descuento > 0) {
            $total -= ($total * $reserva->descuento) / 100;
        }

        $reserva->total_precio = $total;
        $reserva->save();

        // GUARDAR VOUCHERS EN BD
        if (!empty($vouchersAdjuntos)) {

            $rutasRelativas = array_map(
                fn($v) => str_replace(storage_path('app/public/'), '', $v['path']),
                $vouchersAdjuntos
            );

            $reserva->vouchers_hotel = json_encode($rutasRelativas);
            $reserva->save();
        }

        // SERVICIOS PERSONALIZADOS
        if ($esPersonalizado && !empty($serviciosInput)) {

            foreach ($serviciosInput as $servicio) {

                DB::table('incluye_personalizados')->insert([
                    'reserva_id'  => $reserva->id,
                    'descripcion' => $servicio['descripcion'],
                    'precio'      => $servicio['precio'] ?? 0,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }

        // CLIENTE
        $cliente = Cliente::find($request->input('cliente_id'));
        $user = User::find($cliente->usuario_id);
        $emailCliente = $user?->email;

        // FACTURA
        DB::table('facturas')->insert([
            'cliente_id'        => $cliente->id,
            'reserva_id'        => $reserva->id,
            'nombre_cliente'    => $cliente->nombre ?? 'Cliente',
            'apellidos_cliente' => $cliente->apellidos ?? '',
            'email_cliente'     => $emailCliente,
            'fecha_compra'      => now(),
            'metodo_pago'       => $request->input('metodo_pago'),
            'precio_total'      => $reserva->total_precio,
            'iva'               => 21,
            'telefono_empresa'  => '659633676',
            'email_empresa'     => 'info@viajesatalanta.com',
            'detalles'          => 'Reserva de paquete turístico ID: ' . ($paquete ? $paquete->id : 'personalizado'),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        // SERVICIOS INCLUIDOS
        $serviciosIncluidos   = [];
        $serviciosNoIncluidos = [];

        if ($paquete) {

            $serviciosIncluidos = DB::table('incluye')
                ->where('paquete_id', $paquete->id)
                ->pluck('descripcion')
                ->toArray();
        } else {

            $serviciosIncluidos = DB::table('incluye_personalizados')
                ->where('reserva_id', $reserva->id)
                ->select('descripcion', 'precio')
                ->get()
                ->map(fn($s) => [
                    'descripcion' => $s->descripcion,
                    'precio'      => $s->precio
                ])
                ->toArray();
        }

        // SERVICIOS NO INCLUIDOS
        if ($paquete) {

            $serviciosNoIncluidos = DB::table('no_incluye')
                ->where('paquete_id', $paquete->id)
                ->pluck('descripcion')
                ->toArray();
        }

        // DESCUENTOS
        $descuentos = DB::table('descuentos')
            ->select('titulo', 'codigo', 'descripcion', 'enlace')
            ->get()
            ->map(fn($d) => [
                'titulo'      => $d->titulo,
                'codigo'      => $d->codigo,
                'descripcion' => $d->descripcion,
                'enlace'      => $d->enlace,
            ])
            ->toArray();

        // PLAZAS
        if ($paquete) {

            $paquete->plazas = max(0, $paquete->plazas - $request->input('num_personas'));
            $paquete->save();
        }

        // ITINERARIO
        if (!empty($itinerarioInput)) {

            foreach ($itinerarioInput as $item) {

                DB::table('itinerarios')->insert([
                    'reserva_id' => $reserva->id,
                    'paquete_turistico_id' => $paquete ? $paquete->id : 0,
                    'dia' => $item['dia'] ?? '',
                    'fecha' => $item['fecha'] ?? null,
                    'descripcion' => $item['descripcion'] ?? '',
                ]);
            }
        }

        // CUOTAS
        if (
            $request->input('metodo_pago') === 'parcial' &&
            (int)$request->input('num_cuotas') > 0
        ) {

            $numCuotas = (int)$request->input('num_cuotas');
            $importe = $request->input('importe_cuotas')
                ?: ($reserva->total_precio / $numCuotas);

            $fecha = Carbon::now();

            for ($i = 1; $i <= $numCuotas; $i++) {

                Cuota::create([
                    'reserva_id' => $reserva->id,
                    'numero'     => $i,
                    'importe'    => $importe,
                    'pagada'     => $i === 1,
                    'fecha_pago' => $i === 1 ? $fecha : null,
                ]);

                if ($i > 1) {

                    $fecha = $fecha->copy()->addMonthNoOverflow();

                    Evento::create([
                        'nombre' => "Pago cuota {$i}",
                        'fecha'  => $fecha->format('Y-m-d'),
                        'hora'   => '10:00',
                    ]);
                }
            }
        }

        // EMAIL
        $clienteArray = [
            'nombre'    => $cliente->nombre ?? '',
            'apellidos' => $cliente->apellidos ?? '',
            'dni'       => $cliente->dni ?? '',
            'direccion' => $cliente->direccion ?? '',
            'telefono'  => $cliente->telefono ?? '',
            'email'     => $emailCliente ?? $cliente->email ?? '',
        ];

        $clienteNombreCompleto = trim($cliente->nombre ?? '');

        $linkPagoCuotas =
            ($request->input('metodo_pago') === 'parcial')
            ? url("/pagos/pendientes/{$reserva->id}")
            : null;

        $itinerario = DB::table('itinerarios')
            ->where('reserva_id', $reserva->id)
            ->get()
            ->toArray();

        $fechaInicioFormatted = $paquete
            ? ($paquete->fecha_inicio
                ? Carbon::parse($paquete->fecha_inicio)->format('d/m/Y')
                : 'No disponible')
            : ($reserva->fecha_inicio
                ? Carbon::parse($reserva->fecha_inicio)->format('d/m/Y')
                : 'No disponible');

        $fechaFinFormatted = $paquete
            ? ($paquete->fecha_fin
                ? Carbon::parse($paquete->fecha_fin)->format('d/m/Y')
                : 'No disponible')
            : ($reserva->fecha_fin
                ? Carbon::parse($reserva->fecha_fin)->format('d/m/Y')
                : 'No disponible');

        // ENVIAR EMAIL
        if ($emailCliente) {

            Mail::to($emailCliente)->send(
                new ReservaConfirmacionMail(
                    $clienteArray,                // 1
                    date('d/m/Y'),                // 2
                    $precioBase,                  // 3
                    $reserva->total_precio,       // 4
                    $clienteNombreCompleto,       // 5
                    $request->input('metodo_pago'), // 6
                    $request->input('num_cuotas') ?? 0, // 7
                    $request->input('importe_cuotas') ?? 0, // 8
                    $request->input('num_personas'), // 9
                    $reserva->total_precio,       // 10
                    $request->input('destino') ?? '', // 11
                    $linkPagoCuotas,              // 12
                    $reserva,                     // 13
                    [],                           // 14 (viajeros: ya no se recogen)
                    $paquete
                        ? $paquete->nombre
                        : ($request->input('destino') ?? 'Destino personalizado'), // 15
                    $reserva->id,                 // 16
                    $clienteNombreCompleto,       // 17
                    $paquete ? $paquete->fecha_inicio : $reserva->fecha_inicio, // 18
                    $paquete ? $paquete->fecha_fin : $reserva->fecha_fin,       // 19
                    $serviciosIncluidos,          // 20
                    $serviciosNoIncluidos,        // 21
                    $descuentos,                  // 22
                    $itinerario,                  // 23
                    $vouchersAdjuntos,            // 24
                    $request->input('notas') ?? '' // 25
                )
            );
        }

        // RESPUESTA
        return response()->json([
            'message' => 'Reserva creada correctamente',
            'reserva' => $reserva,
        ], 201);
    }


    public function reenviarConfirmacion($id)
    {
        $reserva = Reserva::findOrFail($id);

        $cliente = Cliente::find($reserva->cliente_id);

        if (!$cliente) {
            return response()->json([
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        $user = User::find($cliente->usuario_id);
        $emailCliente = $user?->email;

        // =========================
        // VOUCHERS
        // =========================
        $vouchers = [];

        if (!empty($reserva->vouchers_hotel)) {

            $rutas = json_decode($reserva->vouchers_hotel, true);

            if (is_array($rutas)) {
                foreach ($rutas as $rutaRelativa) {

                    $path = storage_path('app/public/' . $rutaRelativa);

                    if (file_exists($path)) {
                        $vouchers[] = [
                            'path' => $path,
                            'name' => basename($path),
                            'mime' => 'application/pdf'
                        ];
                    }
                }
            }
        }


        if (!$emailCliente) {
            return response()->json([
                'message' => 'El cliente no tiene email'
            ], 422);
        }

        $paquete = null;

        if ($reserva->paquete_id > 0) {
            $paquete = PaqueteTuristico::find($reserva->paquete_id);
        }

        // =========================
        // SERVICIOS INCLUIDOS
        // =========================
        if ($paquete) {

            $serviciosIncluidos = DB::table('incluye')
                ->where('paquete_id', $paquete->id)
                ->pluck('descripcion')
                ->toArray();

            $serviciosNoIncluidos = DB::table('no_incluye')
                ->where('paquete_id', $paquete->id)
                ->pluck('descripcion')
                ->toArray();
        } else {

            $serviciosIncluidos = DB::table('incluye_personalizados')
                ->where('reserva_id', $reserva->id)
                ->select('descripcion', 'precio')
                ->get()
                ->map(fn($s) => [
                    'descripcion' => $s->descripcion,
                    'precio' => $s->precio
                ])
                ->toArray();

            $serviciosNoIncluidos = [];
        }

        // =========================
        // VIAJEROS
        // =========================
        $viajeros = DB::table('participantes')
            ->where('reserva_id', $reserva->id)
            ->get()
            ->map(fn($p) => [
                'nombre' => $p->nombre,
                'apellidos' => $p->apellidos,
                'email' => $p->email,
                'dni' => $p->dni,
                'telefono' => $p->telefono,
                'direccion' => $p->direccion,
                'ciudad' => $p->ciudad,
                'provincia' => $p->provincia,
                'fecha_nacimiento' => $p->fecha_nacimiento,
                'experiencia' => $p->experiencia,
                'motivacion' => $p->motivacion,
                'info_relevante' => $p->info_relevante,
            ])
            ->toArray();

        // =========================
        // DESCUENTOS
        // =========================
        $descuentos = DB::table('descuentos')
            ->select('titulo', 'codigo', 'descripcion', 'enlace')
            ->get()
            ->map(fn($d) => [
                'titulo' => $d->titulo,
                'codigo' => $d->codigo,
                'descripcion' => $d->descripcion,
                'enlace' => $d->enlace,
            ])
            ->toArray();

        // =========================
        // ITINERARIO
        // =========================
        if ($reserva->paquete_id == 0) {
            $itinerario = DB::table('itinerarios')
                ->where('reserva_id', $reserva->id)
                ->get()
                ->toArray();
        } else {
            $itinerario = DB::table('itinerarios')
                ->where('paquete_turistico_id', $reserva->paquete_id)
                ->get()
                ->toArray();
        }

        $clienteArray = [
            'nombre' => $cliente->nombre ?? '',
            'apellidos' => $cliente->apellidos ?? '',
            'dni' => $cliente->dni ?? '',
            'direccion' => $cliente->direccion ?? '',
            'telefono' => $cliente->telefono ?? '',
            'email' => $emailCliente,
        ];

        $clienteNombreCompleto = trim($cliente->nombre ?? '');

        $linkPagoCuotas = $reserva->metodo_pago === 'parcial'
            ? url("/pagos/pendientes/{$reserva->id}")
            : null;

        // =========================
        // NUEVOS CAMPOS (IMPORTES)
        // =========================
        $importeAlojamiento = $reserva->importe_alojamiento ?? 0;
        $impuestoMunicipal  = $reserva->impuesto_municipal ?? 0;

        Mail::to($emailCliente)->send(
            new ReservaConfirmacionMail(
                $clienteArray,                              // 1
                $reserva->fecha_reserva->format('d/m/Y'),  // 2
                0,                                          // 3
                $reserva->total_precio,                     // 4
                $clienteNombreCompleto,                      // 5
                $reserva->metodo_pago,                      // 6
                $reserva->num_cuotas,                       // 7
                $reserva->importe_cuotas,                   // 8
                $reserva->num_personas,                     // 9
                $reserva->total_precio,                     // 10
                $reserva->destino ?? '',                    // 11
                $linkPagoCuotas,                            // 12
                $reserva,                                   // 13
                $viajeros,                                  // 14
                $paquete->nombre ?? '',                     // 15
                $reserva->id,                               // 16
                $clienteNombreCompleto,                     // 17
                $reserva->fecha_inicio,                     // 18
                $reserva->fecha_fin,                        // 19
                $serviciosIncluidos,                        // 20
                $serviciosNoIncluidos,                      // 21
                $descuentos,                                // 22
                $itinerario,                                // 23
                $vouchers,                                  // 24
                $importeAlojamiento,                        // 25
                $impuestoMunicipal                          // 26
            )
        );


        return response()->json([
            'message' => 'Correo enviado correctamente'
        ]);
    }

    public function clientesObtener()
    {
        $clientes = Cliente::select('id', 'nombre')->get();

        return response()->json($clientes);
    }

    public function paquetesObtener()
    {
        $paquetes = PaqueteTuristico::with(['itinerario', 'incluye', 'noIncluye'])
            ->select(
                'id',
                'nombre',
                'precio',
                'plazas',
                'fecha_inicio',
                'viajerosFijos',
                'fecha_fin',
                'oferta'
            )
            ->where('plazas', '>', 0)
            ->get()
            ->map(function ($paquete) {

                // =========================
                // SERVICIOS INCLUIDOS
                // =========================
                $paquete->servicios_incluidos = $paquete->incluye
                    ? $paquete->incluye->map(function ($item) {
                        $decoded = json_decode($item->descripcion, true);
                        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                            return $decoded; // { descripcion: "...", precio: 75 }
                        }
                        return ['descripcion' => $item->descripcion, 'precio' => 0];
                    })->values()
                    : [];

                // =========================
                // SERVICIOS NO INCLUIDOS
                // =========================
                $paquete->servicios_no_incluidos = $paquete->noIncluye
                    ? $paquete->noIncluye->map(fn($item) => $item->descripcion)->values()
                    : [];

                unset($paquete->incluye);
                unset($paquete->noIncluye);

                return $paquete;
            });

        return response()->json($paquetes);
    }
}
