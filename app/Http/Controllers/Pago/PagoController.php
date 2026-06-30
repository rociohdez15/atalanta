<?php

namespace App\Http\Controllers\Pago;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;
use App\Models\Reserva;
use App\Models\Participante;
use App\Models\PaqueteTuristico;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReservaConfirmacionMail;
use App\Mail\NotificacionNuevaReserva;

class PagoController extends Controller
{
    /* =========================
        CREAR PAGO (STRIPE)
    ========================== */
    public function crearPago(Request $request)
    {
        try {
            $token = $request->cookie('access_token');
            if (!$token) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $reservaTemp = DB::table('reservas_temporales')
                ->where('usuario_id', $user->id)
                ->latest()
                ->first();

            if (!$reservaTemp) {
                return response()->json(['error' => 'No existe reserva temporal'], 400);
            }

            $datos = json_decode($reservaTemp->datos, true);

            if (empty($datos['paqueteId']) || empty($datos['participantes'])) {
                return response()->json(['error' => 'Datos inválidos'], 400);
            }

            $paquete     = PaqueteTuristico::findOrFail($datos['paqueteId']);
            $numPersonas = count($datos['participantes']);

            if ($paquete->plazas < $numPersonas) {
                return response()->json(['error' => 'No hay plazas suficientes'], 400);
            }

            $totalPrecio = $paquete->precio * $numPersonas;

            Stripe::setApiKey(config('services.stripe.secret'));

            $session = Session::create([
                'payment_method_types' => ['card'],
                'expires_at'           => now()->addMinutes(30)->timestamp,
                'line_items'           => [[
                    'price_data' => [
                        'currency'     => 'eur',
                        'product_data' => ['name' => $paquete->nombre],
                        'unit_amount'  => (int) round($totalPrecio * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode'        => 'payment',
                'success_url' => url('/pago/exito?session_id={CHECKOUT_SESSION_ID}'),
                'cancel_url'  => url('/pago/cancelado'),
                'metadata'    => [
                    'user_id'         => $user->id,
                    'paquete_id'      => $paquete->id,
                    'reserva_temp_id' => $reservaTemp->id,
                ],
            ]);

            DB::table('reservas_temporales')
                ->where('id', $reservaTemp->id)
                ->update(['stripe_session_id' => $session->id]);

            return response()->json(['url' => $session->url]);
        } catch (\Exception $e) {
            Log::error('Stripe crearPago error: ' . $e->getMessage());
            return response()->json(['error' => 'Error al crear el pago'], 500);
        }
    }

    /* =========================
        GUARDAR RESERVA TEMP
    ========================== */
    public function guardarReservaTemp(Request $request)
    {
        try {
            $token = $request->cookie('access_token');

            if (!$token) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $validated = $request->validate([
                'paqueteId'                       => 'required|integer|exists:paquetes_turisticos,id',
                'participantes'                   => 'required|array|min:1|max:20',
                'participantes.*.nombre'          => 'required|string|max:100',
                'participantes.*.apellidos'       => 'required|string|max:150',
                'participantes.*.email'           => 'required|email|max:200',
                'participantes.*.dni'             => 'nullable|string|max:20',
                'participantes.*.telefono'        => 'nullable|string|max:20',
                'participantes.*.direccion'       => 'nullable|string|max:255',
                'participantes.*.ciudad'          => 'nullable|string|max:100',
                'participantes.*.provincia'       => 'nullable|string|max:100',
                'participantes.*.fechaNacimiento' => 'nullable|date',
                'participantes.*.experiencia'     => 'nullable|string|max:500',
                'participantes.*.motivacion'      => 'nullable|string|max:500',
                'participantes.*.infoRelevante'   => 'nullable|string|max:500',
            ]);

            if (strlen(json_encode($validated)) > 50000) {
                return response()->json(['error' => 'Datos demasiado grandes'], 413);
            }

            $errorPlazas = false;

            DB::transaction(function () use ($validated, $user, &$errorPlazas) {

                $numPersonas = count($validated['participantes']);

                $paquete = PaqueteTuristico::lockForUpdate()
                    ->findOrFail($validated['paqueteId']);

                /*
            |--------------------------------------------------------------------------
            | SOLO validamos disponibilidad.
            | NO descontamos plazas todavía.
            |--------------------------------------------------------------------------
            */
                if ($paquete->plazas < $numPersonas) {
                    $errorPlazas = true;
                    return;
                }

                /*
            |--------------------------------------------------------------------------
            | Eliminamos temporal anterior del usuario
            |--------------------------------------------------------------------------
            */
                DB::table('reservas_temporales')
                    ->where('usuario_id', $user->id)
                    ->delete();

                DB::table('reservas_temporales')->insert([
                    'usuario_id' => $user->id,
                    'datos'      => json_encode($validated),
                    'resultado'  => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

            if ($errorPlazas) {
                return response()->json([
                    'error' => 'No hay plazas suficientes'
                ], 400);
            }

            return response()->json(['ok' => true]);
        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([
                'error' => $e->errors()
            ], 422);
        } catch (\Exception $e) {

            Log::error('guardarReservaTemp error: ' . $e->getMessage());

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /* =========================
        OBTENER RESERVA TEMP
    ========================== */
    public function obtenerReservaTemp(Request $request)
    {
        try {
            $token = $request->cookie('access_token');
            if (!$token) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $reservaTemp = DB::table('reservas_temporales')
                ->where('usuario_id', $user->id)
                ->latest()
                ->first();

            if (!$reservaTemp) {
                return response()->json(null);
            }

            $datos = json_decode($reservaTemp->datos, true);

            return response()->json([
                'datos'             => $datos,
                'stripe_session_id' => $reservaTemp->stripe_session_id ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('obtenerReservaTemp error: ' . $e->getMessage());
            return response()->json(['error' => 'Error interno'], 500);
        }
    }

    /* =========================
        CLIENTE USUARIO
    ========================== */
    public function obtenerClienteUsuario(Request $request)
    {
        $token = $request->cookie('access_token');
        if (!$token) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $user = JWTAuth::setToken($token)->authenticate();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $cliente = Cliente::where('usuario_id', $user->id)->first();
        if (!$cliente) {
            return response()->json(['error' => 'Cliente no encontrado'], 404);
        }

        return response()->json($cliente);
    }

    /* =========================
        VALIDAR DNI
    ========================== */
    public function validarDniReserva(Request $request)
    {
        $request->validate([
            'dni'       => 'required|string|max:20',
            'paqueteId' => 'required|integer|exists:paquetes_turisticos,id',
        ]);

        $exists = DB::table('participantes')
            ->join('reservas', 'participantes.reserva_id', '=', 'reservas.id')
            ->where('participantes.dni', $request->dni)
            ->where('reservas.paquete_id', $request->paqueteId)
            ->whereIn('reservas.estado', ['Confirmada', 'Pendiente'])
            ->exists();

        return response()->json(['existe' => $exists]);
    }

    /* =========================
        WEBHOOK STRIPE
    ========================== */
    public function stripeWebhook(Request $request)
    {
        $payload        = $request->getContent();
        $sigHeader      = $request->server('HTTP_STRIPE_SIGNATURE');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            Log::error('Webhook firma inválida: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook inválido'], 400);
        }

        $session = $event->data->object;

        /*
    |--------------------------------------------------------------------------
    | EXPIRADO / FALLIDO
    |--------------------------------------------------------------------------
    */
        if (
            $event->type === 'checkout.session.expired' ||
            $event->type === 'checkout.session.async_payment_failed'
        ) {
            $temp = DB::table('reservas_temporales')
                ->where('stripe_session_id', $session->id)
                ->first();

            if ($temp) {
                $datos = json_decode($temp->datos, true);

                if (!empty($datos['paqueteId']) && !empty($datos['participantes'])) {
                    $cantidad = count($datos['participantes']);

                    PaqueteTuristico::where('id', $datos['paqueteId'])
                        ->increment('plazas', $cantidad);
                }

                DB::table('reservas_temporales')
                    ->where('id', $temp->id)
                    ->update([
                        'resultado'  => 'sin_plazas',
                        'updated_at' => now(),
                    ]);
            }

            return response()->json(['ok' => true]);
        }

        /*
    |--------------------------------------------------------------------------
    | SOLO PAGADOS
    |--------------------------------------------------------------------------
    */
        if ($session->payment_status !== 'paid') {
            Log::warning('Pago no completado', ['session' => $session->id]);
            return response()->json(['ok' => true]);
        }

        try {

            DB::transaction(function () use ($session) {

                /*
            |--------------------------------------------------------------------------
            | IDEMPOTENCIA
            |--------------------------------------------------------------------------
            */
                $existing = Reserva::where('stripe_session_id', $session->id)
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    Log::info('Webhook duplicado ignorado', ['session' => $session->id]);
                    return;
                }

                $metadata = json_decode(json_encode($session->metadata), true);

                if (
                    empty($metadata['user_id']) ||
                    empty($metadata['paquete_id']) ||
                    empty($metadata['reserva_temp_id'])
                ) {
                    throw new \Exception('PERMANENTE: Metadata incompleta');
                }

                /*
            |--------------------------------------------------------------------------
            | TEMPORAL
            |--------------------------------------------------------------------------
            */
                $temp = DB::table('reservas_temporales')
                    ->where('id', $metadata['reserva_temp_id'])
                    ->where('stripe_session_id', $session->id)
                    ->lockForUpdate()
                    ->first();

                if (!$temp) {
                    DB::table('stripe_session_resultados')->updateOrInsert(
                        ['stripe_session_id' => $session->id],
                        [
                            'usuario_id' => $metadata['user_id'],
                            'resultado'  => 'sin_plazas',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );

                    throw new \Exception('PERMANENTE: Reserva temporal no encontrada');
                }

                $datos = json_decode($temp->datos, true);

                if (empty($datos['participantes']) || !is_array($datos['participantes'])) {
                    throw new \Exception('PERMANENTE: Participantes inválidos');
                }

                $numPersonas = count($datos['participantes']);

                /*
            |--------------------------------------------------------------------------
            | USUARIO
            |--------------------------------------------------------------------------
            */
                $user = User::find($metadata['user_id']);

                if (!$user) {
                    throw new \Exception('PERMANENTE: Usuario no encontrado');
                }

                $cliente = Cliente::where('usuario_id', $user->id)->first();

                if (!$cliente) {
                    throw new \Exception('PERMANENTE: Cliente no encontrado');
                }

                $paquete = PaqueteTuristico::lockForUpdate()
                    ->find($metadata['paquete_id']);

                if (!$paquete) {
                    throw new \Exception('PERMANENTE: Paquete no encontrado');
                }

                /*
            |--------------------------------------------------------------------------
            | PLAZAS
            |--------------------------------------------------------------------------
            */
                if ($paquete->plazas < $numPersonas) {

                    DB::table('stripe_session_resultados')->updateOrInsert(
                        ['stripe_session_id' => $session->id],
                        [
                            'usuario_id' => $metadata['user_id'],
                            'resultado'  => 'sin_plazas',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );

                    throw new \Exception('PERMANENTE: No hay plazas suficientes');
                }

                /*
            |--------------------------------------------------------------------------
            | DESCONTAR PLAZAS
            |--------------------------------------------------------------------------
            */
                $paquete->decrement('plazas', $numPersonas);

                $totalPrecio = $paquete->precio * $numPersonas;

                /*
            |--------------------------------------------------------------------------
            | RESERVA
            |--------------------------------------------------------------------------
            */
                $reserva = Reserva::create([
                    'reservation_token' => Str::uuid(),
                    'cliente_id'        => $cliente->id,
                    'paquete_id'        => $paquete->id,
                    'num_personas'      => $numPersonas,
                    'fecha_inicio'      => $paquete->fecha_inicio,
                    'fecha_fin'         => $paquete->fecha_fin,
                    'fecha_pago'        => now(),
                    'metodo_pago'       => 'stripe',
                    'estado'            => 'Confirmada',
                    'num_cuotas'        => 1,
                    'importe_cuotas'    => $totalPrecio,
                    'total_precio'      => $totalPrecio,
                    'stripe_session_id' => $session->id,
                    'fecha_reserva'     => now(),
                ]);

                /*
            |--------------------------------------------------------------------------
            | PARTICIPANTES
            |--------------------------------------------------------------------------
            */
                foreach ($datos['participantes'] as $p) {
                    Participante::create([
                        'reserva_id'       => $reserva->id,
                        'nombre'           => $p['nombre'] ?? '',
                        'apellidos'        => $p['apellidos'] ?? '',
                        'email'            => $p['email'] ?? '',
                        'dni'              => $p['dni'] ?? null,
                        'telefono'         => $p['telefono'] ?? null,
                        'direccion'        => $p['direccion'] ?? null,
                        'ciudad'           => $p['ciudad'] ?? null,
                        'provincia'        => $p['provincia'] ?? null,
                        'fecha_nacimiento' => $p['fechaNacimiento'] ?? null,
                        'experiencia'      => $p['experiencia'] ?? null,
                        'motivacion'       => $p['motivacion'] ?? null,
                        'info_relevante'   => $p['infoRelevante'] ?? null,
                    ]);
                }

                /*
            |--------------------------------------------------------------------------
            | FACTURA
            |--------------------------------------------------------------------------
            */
                DB::table('facturas')->insert([
                    'cliente_id'        => $cliente->id,
                    'reserva_id'        => $reserva->id,
                    'nombre_cliente'    => $user->name ?? 'Cliente',
                    'apellidos_cliente' => $user->apellidos ?? '',
                    'email_cliente'     => $user->email,
                    'fecha_compra'      => now(),
                    'metodo_pago'       => 'stripe',
                    'precio_total'      => $totalPrecio,
                    'iva'               => 21,
                    'telefono_empresa'  => '659633676',
                    'email_empresa'     => 'info@viajesatalanta.com',
                    'detalles'          => "Reserva de paquete turístico ID: {$paquete->id}",
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]);

                /*
            |--------------------------------------------------------------------------
            | EMAILS
            |--------------------------------------------------------------------------
            */
                try {

                    $clienteArray = [
                        'nombre'    => $cliente->nombre ?? $user->name ?? '',
                        'apellidos' => $cliente->apellidos ?? $user->apellidos ?? '',
                        'dni'       => $cliente->dni ?? '',
                        'direccion' => $cliente->direccion ?? '',
                        'telefono'  => $cliente->telefono ?? '',
                        'email'     => $user->email ?? '',
                    ];

                    $nombreCompleto = trim(($user->name ?? 'Cliente') . ' ' . ($user->apellidos ?? ''));

                    /*
                    |--------------------------------------------------------------------------
                    | SERVICIOS INCLUIDOS
                    |--------------------------------------------------------------------------
                    */
                    $serviciosIncluidos = DB::table('incluye')
                        ->where('paquete_id', $paquete->id)
                        ->pluck('descripcion')
                        ->toArray();

                    /*
                    |--------------------------------------------------------------------------
                    | SERVICIOS NO INCLUIDOS
                    |--------------------------------------------------------------------------
                    */
                    $serviciosNoIncluidos = DB::table('no_incluye')
                        ->where('paquete_id', $paquete->id)
                        ->pluck('descripcion')
                        ->toArray();

                    /*
                    |--------------------------------------------------------------------------
                    | DESCUENTOS
                    |--------------------------------------------------------------------------
                    */
                    $descuentos = DB::table('descuentos')
                        ->select('titulo', 'codigo', 'descripcion', 'enlace')
                        ->get()
                        ->map(function ($d) {
                            return [
                                'titulo' => $d->titulo,
                                'codigo' => $d->codigo,
                                'descripcion' => $d->descripcion,
                                'enlace' => $d->enlace,
                            ];
                        })
                        ->toArray();
                    /*
                    |--------------------------------------------------------------------------
                    | ITINERARIO
                    |--------------------------------------------------------------------------
                    */
                    $itinerario = DB::table('itinerarios')
                        ->where('paquete_turistico_id', $paquete->id)
                        ->orderBy('fecha')
                        ->get()
                        ->map(function ($i) {
                            return [
                                'dia' => $i->dia,
                                'fecha' => $i->fecha,
                                'descripcion' => $i->descripcion,
                            ];
                        })
                        ->toArray();

                    Mail::to($user->email)->send(
                        new \App\Mail\ReservaConfirmacionMail(
                            $clienteArray,
                            date('d/m/Y'),
                            $paquete->precio,
                            $totalPrecio,
                            $nombreCompleto,
                            'total',
                            1,
                            $totalPrecio,
                            $numPersonas,
                            $totalPrecio,

                            $paquete->nombre, // destino

                            null,             // linkPagoCuotas

                            $reserva,
                            $datos['participantes'],
                            $paquete->nombre,
                            $reserva->id,
                            $nombreCompleto,
                            $paquete->fecha_inicio,
                            $paquete->fecha_fin,
                            $serviciosIncluidos,
                            $serviciosNoIncluidos,
                            $descuentos,
                            $itinerario
                        )
                    );

                    Mail::to('lourdes.hernandezsilva@viajesatalanta.com')
                        ->send(new \App\Mail\NotificacionNuevaReserva($reserva, $datos['participantes']));
                } catch (\Exception $mailError) {
                    Log::error('Error mails webhook: ' . $mailError->getMessage());
                }

                /*
            |--------------------------------------------------------------------------
            | LIMPIEZA
            |--------------------------------------------------------------------------
            */
                DB::table('reservas_temporales')
                    ->where('id', $temp->id)
                    ->delete();

                Log::info('Reserva creada OK', ['reserva_id' => $reserva->id]);
            });
        } catch (\Exception $e) {

            Log::error('Webhook error: ' . $e->getMessage());

            $metadata = json_decode(json_encode($session->metadata), true);

            if (!empty($metadata['user_id'])) {
                DB::table('stripe_session_resultados')->updateOrInsert(
                    ['stripe_session_id' => $session->id],
                    [
                        'usuario_id' => $metadata['user_id'],
                        'resultado'  => 'sin_plazas',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            if (str_starts_with($e->getMessage(), 'PERMANENTE:')) {
                return response()->json(['error' => 'no reintentar'], 200);
            }

            return response()->json(['error' => 'error interno'], 500);
        }

        return response()->json(['success' => true]);
    }

    /* =========================
        VERIFICAR PAGO EXITOSO
    ========================== */
    public function verificarPagoExito(Request $request)
    {
        try {

            $token = $request->cookie('access_token');

            if (!$token) {
                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            if (!$user) {
                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }

            $sessionId = $request->query('session_id');

            if (!$sessionId) {
                return response()->json([
                    'error' => 'session_id requerido'
                ], 400);
            }

            Stripe::setApiKey(config('services.stripe.secret'));

            /*
        |--------------------------------------------------------------------------
        | CASO 1
        | RESERVA DEFINITIVA EXISTE
        |--------------------------------------------------------------------------
        */
            $reserva = Reserva::where('stripe_session_id', $sessionId)
                ->first();

            if ($reserva) {

                $cliente = Cliente::where('usuario_id', $user->id)
                    ->first();

                return response()->json([
                    'estado'       => 'confirmada',
                    'reserva_id'   => $reserva->id,
                    'paquete_id'   => $reserva->paquete_id,
                    'num_personas' => $reserva->num_personas,
                    'total_precio' => $reserva->total_precio,
                    'email'        => $cliente?->email ?? $user->email,
                ]);
            }

            /*
        |--------------------------------------------------------------------------
        | CASO 2
        | EL WEBHOOK YA ESCRIBIÓ RESULTADO FINAL
        |--------------------------------------------------------------------------
        */
            $resultadoWebhook = DB::table('stripe_session_resultados')
                ->where('stripe_session_id', $sessionId)
                ->first();

            if ($resultadoWebhook) {

                if ($resultadoWebhook->resultado === 'sin_plazas') {

                    return response()->json([
                        'estado' => 'sin_plazas',
                        'error'  =>
                        'No fue posible completar tu reserva porque las plazas se agotaron justo antes de procesar tu pago.',
                    ]);
                }
            }

            /*
        |--------------------------------------------------------------------------
        | CASO 3
        | TEMPORAL TODAVÍA EXISTE
        |--------------------------------------------------------------------------
        */
            $temp = DB::table('reservas_temporales')
                ->where('stripe_session_id', $sessionId)
                ->first();

            if ($temp) {

                if ($temp->resultado === 'sin_plazas') {

                    return response()->json([
                        'estado' => 'sin_plazas',
                        'error'  =>
                        'No fue posible completar tu reserva porque las plazas se agotaron justo antes de procesar tu pago.',
                    ]);
                }

                return response()->json([
                    'estado' => 'pendiente'
                ]);
            }

            /*
        |--------------------------------------------------------------------------
        | CASO 4
        | CONSULTAMOS STRIPE
        |--------------------------------------------------------------------------
        */
            try {

                $stripeSession = Session::retrieve($sessionId);

                /*
            |--------------------------------------------------------------------------
            | Stripe ya cobró pero webhook aún no terminó
            |--------------------------------------------------------------------------
            */
                if ($stripeSession->payment_status === 'paid') {

                    return response()->json([
                        'estado' => 'pendiente'
                    ]);
                }

                /*
            |--------------------------------------------------------------------------
            | Stripe no pagado
            |--------------------------------------------------------------------------
            */
                return response()->json([
                    'estado' => 'sin_plazas',
                    'error'  =>
                    'No fue posible completar tu reserva porque las plazas se agotaron justo antes de procesar tu pago.',
                ]);
            } catch (\Exception $stripeEx) {

                Log::warning('verificarPagoExito: error consultando Stripe', [
                    'session_id' => $sessionId,
                    'error'      => $stripeEx->getMessage(),
                ]);

                return response()->json([
                    'estado' => 'pendiente'
                ]);
            }
        } catch (\Exception $e) {

            Log::error('verificarPagoExito error: ' . $e->getMessage());

            return response()->json([
                'error' => 'Error interno'
            ], 500);
        }
    }
}
