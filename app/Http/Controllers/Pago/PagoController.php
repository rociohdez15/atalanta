<?php

namespace App\Http\Controllers\Pago;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Reserva;
use App\Models\Participante;
use App\Models\PaqueteTuristico;
use App\Models\PrecioPaquete;
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
    /* =========================================================
        CREAR PAGO
    ========================================================== */
    //
    // Recalcula el precio en el servidor a partir de
    // `precio_paquete_id`, en vez de fiarse de lo que mande el
    // cliente.
    //
    // ⭐ NUEVO ⭐ Antes de crear el checkout de Stripe comprueba
    // que todavía quedan habitaciones de ese tipo
    // (habitaciones_disponibles). NO resta nada aquí: la resta
    // se hace al confirmarse el pago, en procesarReservaPagada().
    //

    public function crearPago(Request $request)
    {
        try {

            Log::info('==============================');
            Log::info('CREAR PAGO INICIO');
            Log::info('==============================');

            // =====================================================
            // 1. AUTENTICACIÓN
            // =====================================================

            $token = $request->cookie('access_token');

            if (!$token) {

                Log::warning('crearPago: no existe access_token');

                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            if (!$user) {

                Log::warning('crearPago: usuario no autenticado');

                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }

            Log::info('crearPago: usuario autenticado', [
                'user_id' => $user->id,
                'email'   => $user->email,
            ]);

            // =====================================================
            // 2. OBTENER RESERVA TEMPORAL
            // =====================================================

            $reservaTemp = DB::table('reservas_temporales')
                ->where('usuario_id', $user->id)
                ->latest()
                ->first();

            if (!$reservaTemp) {

                Log::warning('crearPago: no existe reserva temporal', [
                    'user_id' => $user->id
                ]);

                return response()->json([
                    'error' => 'No existe reserva temporal'
                ], 400);
            }

            Log::info('crearPago: reserva temporal encontrada', [
                'temp_id' => $reservaTemp->id
            ]);

            // =====================================================
            // 3. DECODIFICAR DATOS
            // =====================================================

            $datos = json_decode($reservaTemp->datos, true);

            if (
                empty($datos['paqueteId']) ||
                empty($datos['participantes'])
            ) {

                Log::error('crearPago: datos inválidos', [
                    'temp_id' => $reservaTemp->id
                ]);

                return response()->json([
                    'error' => 'Datos inválidos'
                ], 400);
            }

            // =====================================================
            // 4. OBTENER PAQUETE
            // =====================================================

            $paquete = PaqueteTuristico::findOrFail(
                $datos['paqueteId']
            );

            $numPersonas = count($datos['participantes']);

            Log::info('crearPago: datos de paquete', [
                'paquete_id' => $paquete->id,
                'paquete'    => $paquete->nombre,
                'personas'   => $numPersonas,
                'plazas'     => $paquete->plazas,
            ]);

            // =====================================================
            // 5. COMPROBAR PLAZAS
            // =====================================================

            if ($paquete->plazas < $numPersonas) {

                Log::warning('crearPago: plazas insuficientes', [
                    'plazas_disponibles' => $paquete->plazas,
                    'personas' => $numPersonas,
                ]);

                return response()->json([
                    'error' => 'No hay plazas suficientes'
                ], 400);
            }

            // =====================================================
            // 6. OBTENER TARIFA DE HABITACIÓN
            // =====================================================

            $precioPaqueteId = $datos['precio_paquete_id'] ?? null;

            if (!$precioPaqueteId) {

                Log::warning('crearPago: no se recibió precio_paquete_id', [
                    'paquete_id' => $paquete->id,
                    'temp_id' => $reservaTemp->id,
                ]);

                return response()->json([
                    'error' => 'No se ha seleccionado un tipo de habitación'
                ], 400);
            }

            // =====================================================
            // 7. BUSCAR PRECIO DE LA HABITACIÓN
            // =====================================================

            $precioPaquete = DB::table('precios_paquetes')
                ->where('id', $precioPaqueteId)
                ->where('paquete_id', $paquete->id)
                ->first();

            if (!$precioPaquete) {

                Log::error('crearPago: tarifa de habitación no encontrada', [
                    'precio_paquete_id' => $precioPaqueteId,
                    'paquete_id' => $paquete->id,
                ]);

                return response()->json([
                    'error' => 'El precio de la habitación no es válido'
                ], 400);
            }

            // =====================================================
            // ⭐ NUEVO ⭐ 7b. COMPROBAR HABITACIONES DISPONIBLES
            // =====================================================
            //
            // null = sin límite. Si hay un número y es 0, el tipo de
            // habitación está agotado: avisamos antes de ir a Stripe.
            //

            if (
                $precioPaquete->habitaciones_disponibles !== null &&
                (int) $precioPaquete->habitaciones_disponibles <= 0
            ) {

                Log::warning('crearPago: habitación agotada', [
                    'precio_paquete_id' => $precioPaquete->id,
                    'tipo_habitacion'   => $precioPaquete->tipo_habitacion,
                ]);

                return response()->json([
                    'error' => 'Ya no quedan habitaciones de este tipo'
                ], 400);
            }

            // =====================================================
            // 8. PRECIO POR PERSONA
            // =====================================================

            $precioPorPersona = (float) $precioPaquete->precio;

            // =====================================================
            // 9. CALCULAR PRECIO TOTAL
            // =====================================================

            $totalPrecio = round(
                $precioPorPersona * $numPersonas,
                2
            );

            Log::info('crearPago: precio calculado', [
                'precio_paquete_id' => $precioPaquete->id,
                'tipo_habitacion'   => $precioPaquete->tipo_habitacion,
                'capacidad'         => $precioPaquete->capacidad,
                'precio_por_persona' => $precioPorPersona,
                'num_personas'      => $numPersonas,
                'total'             => $totalPrecio,
            ]);

            // =====================================================
            // 10. CONFIGURAR STRIPE
            // =====================================================

            Stripe::setApiKey(
                config('services.stripe.secret')
            );

            // =====================================================
            // 11. CREAR CHECKOUT DE STRIPE
            // =====================================================

            $session = Session::create([

                'payment_method_types' => ['card'],

                'expires_at' => now()
                    ->addMinutes(30)
                    ->timestamp,

                'line_items' => [
                    [
                        'price_data' => [

                            'currency' => 'eur',

                            'product_data' => [
                                'name' =>
                                $paquete->nombre .
                                    ' - Habitación ' .
                                    ucfirst(
                                        $precioPaquete->tipo_habitacion
                                    ),
                            ],

                            /*
                             * Stripe recibe aquí el precio TOTAL
                             * de la reserva.
                             *
                             * Ejemplo:
                             *   Individual: 500 € x 1 viajero = 500 €
                             *   Doble:      350 € x 2 viajeros = 700 €
                             *   Triple:     300 € x 3 viajeros = 900 €
                             */
                            'unit_amount' => (int) round(
                                $totalPrecio * 100
                            ),
                        ],

                        'quantity' => 1,
                    ]
                ],

                'mode' => 'payment',

                'success_url' =>
                url(
                    '/pago/exito?session_id={CHECKOUT_SESSION_ID}'
                ),

                'cancel_url' =>
                url('/pago/cancelado'),

                // =================================================
                // METADATA
                // =================================================

                'metadata' => [

                    'user_id' =>
                    $user->id,

                    'paquete_id' =>
                    $paquete->id,

                    'reserva_temp_id' =>
                    $reservaTemp->id,

                    'precio_paquete_id' =>
                    $precioPaquete->id,

                    'tipo_habitacion' =>
                    $precioPaquete->tipo_habitacion,

                    'capacidad_habitacion' =>
                    $precioPaquete->capacidad,

                    'precio_por_persona' =>
                    $precioPorPersona,

                    'num_personas' =>
                    $numPersonas,

                    'total_precio' =>
                    $totalPrecio,
                ],
            ]);

            // =====================================================
            // 12. GUARDAR SESSION DE STRIPE
            // =====================================================

            DB::table('reservas_temporales')
                ->where('id', $reservaTemp->id)
                ->update([
                    'stripe_session_id' => $session->id,
                    'updated_at' => now(),
                ]);

            // =====================================================
            // 13. LOG
            // =====================================================

            Log::info(
                'Stripe Checkout creado correctamente',
                [
                    'session_id' =>
                    $session->id,

                    'user_id' =>
                    $user->id,

                    'paquete_id' =>
                    $paquete->id,

                    'precio_paquete_id' =>
                    $precioPaquete->id,

                    'tipo_habitacion' =>
                    $precioPaquete->tipo_habitacion,

                    'precio_por_persona' =>
                    $precioPorPersona,

                    'num_personas' =>
                    $numPersonas,

                    'total' =>
                    $totalPrecio,
                ]
            );

            // =====================================================
            // 14. RESPUESTA
            // =====================================================

            return response()->json([
                'url' => $session->url
            ]);
        } catch (\Exception $e) {

            Log::error('Stripe crearPago ERROR', [
                'error' =>
                $e->getMessage(),

                'trace' =>
                $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Error al crear el pago'
            ], 500);
        }
    }

    /* =========================================================
        GUARDAR RESERVA TEMPORAL
    ========================================================== */
    //
    // ⭐ NUEVO ⭐ Además de las plazas, comprueba que quedan
    // habitaciones del tipo elegido. Tampoco resta aquí.
    //

    public function guardarReservaTemp(Request $request)
    {
        try {

            Log::info('GUARDAR RESERVA TEMPORAL INICIO');

            $token = $request->cookie('access_token');

            if (!$token) {

                Log::warning(
                    'guardarReservaTemp: no existe access_token'
                );

                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            if (!$user) {

                Log::warning(
                    'guardarReservaTemp: usuario no autenticado'
                );

                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }

            $validated = $request->validate([

                'paqueteId' =>
                'required|integer|exists:paquetes_turisticos,id',

                // $request->validate() SOLO devuelve los campos que
                // aparecen aquí, así que este campo es imprescindible
                // para que llegue a reservas_temporales y a crearPago().
                'precio_paquete_id' =>
                'required|integer|exists:precios_paquetes,id',

                'participantes' =>
                'required|array|min:1|max:20',

                'participantes.*.nombre' =>
                'required|string|max:100',

                'participantes.*.apellidos' =>
                'required|string|max:150',

                'participantes.*.email' =>
                'required|email|max:200',

                'participantes.*.dni' =>
                'nullable|string|max:20',

                'participantes.*.telefono' =>
                'nullable|string|max:20',

                'participantes.*.direccion' =>
                'nullable|string|max:255',

                'participantes.*.ciudad' =>
                'nullable|string|max:100',

                'participantes.*.provincia' =>
                'nullable|string|max:100',

                'participantes.*.fechaNacimiento' =>
                'nullable|date',

                'participantes.*.experiencia' =>
                'nullable|string|max:500',

                'participantes.*.motivacion' =>
                'nullable|string|max:500',

                'participantes.*.infoRelevante' =>
                'nullable|string|max:500',
            ]);

            if (
                strlen(json_encode($validated)) > 50000
            ) {

                return response()->json([
                    'error' => 'Datos demasiado grandes'
                ], 413);
            }

            $errorPlazas = false;
            $errorPrecioInvalido = false;
            $errorSinHabitaciones = false; // ⭐ NUEVO

            DB::transaction(function () use (
                $validated,
                $user,
                &$errorPlazas,
                &$errorPrecioInvalido,
                &$errorSinHabitaciones
            ) {

                $numPersonas =
                    count($validated['participantes']);

                $paquete = PaqueteTuristico::lockForUpdate()
                    ->findOrFail(
                        $validated['paqueteId']
                    );

                if ($paquete->plazas < $numPersonas) {

                    $errorPlazas = true;

                    return;
                }

                // =============================================
                // VALIDACIÓN ADICIONAL DE SEGURIDAD
                // =============================================
                //
                // Comprobamos que la fila de precio pertenece
                // realmente a este paquete (evita manipular el
                // precio_paquete_id desde el cliente).
                //
                $precioValido = DB::table('precios_paquetes')
                    ->where('id', $validated['precio_paquete_id'])
                    ->where('paquete_id', $paquete->id)
                    ->exists();

                if (!$precioValido) {

                    $errorPrecioInvalido = true;

                    return;
                }

                // =============================================
                // ⭐ NUEVO ⭐ HABITACIONES DISPONIBLES
                // =============================================
                //
                // null = sin límite. Si es 0 (o menos), agotada.
                //
                $stock = DB::table('precios_paquetes')
                    ->where('id', $validated['precio_paquete_id'])
                    ->value('habitaciones_disponibles');

                if ($stock !== null && (int) $stock <= 0) {

                    $errorSinHabitaciones = true;

                    return;
                }

                DB::table('reservas_temporales')
                    ->where('usuario_id', $user->id)
                    ->delete();

                DB::table('reservas_temporales')->insert([

                    'usuario_id' =>
                    $user->id,

                    'datos' =>
                    json_encode($validated),

                    'resultado' =>
                    null,

                    'stripe_session_id' =>
                    null,

                    'created_at' =>
                    now(),

                    'updated_at' =>
                    now(),
                ]);
            });

            if ($errorPlazas) {

                return response()->json([
                    'error' =>
                    'No hay plazas suficientes'
                ], 400);
            }

            if ($errorPrecioInvalido) {

                Log::warning(
                    'guardarReservaTemp: precio_paquete_id no corresponde al paquete',
                    [
                        'user_id' => $user->id,
                        'paquete_id' => $validated['paqueteId'],
                        'precio_paquete_id' => $validated['precio_paquete_id'],
                    ]
                );

                return response()->json([
                    'error' =>
                    'El precio seleccionado no es válido para este paquete'
                ], 422);
            }

            // ⭐ NUEVO ⭐
            if ($errorSinHabitaciones) {

                Log::warning(
                    'guardarReservaTemp: habitación agotada',
                    [
                        'user_id' => $user->id,
                        'paquete_id' => $validated['paqueteId'],
                        'precio_paquete_id' => $validated['precio_paquete_id'],
                    ]
                );

                return response()->json([
                    'error' =>
                    'Ya no quedan habitaciones de este tipo.'
                ], 422);
            }

            Log::info(
                'Reserva temporal guardada correctamente',
                [
                    'user_id' => $user->id,
                    'paquete_id' => $validated['paqueteId'],
                    'precio_paquete_id' => $validated['precio_paquete_id'],
                    'personas' => count($validated['participantes']),
                ]
            );

            return response()->json([
                'ok' => true
            ]);
        } catch (
            \Illuminate\Validation\ValidationException $e
        ) {

            Log::warning(
                'guardarReservaTemp: error validación',
                [
                    'errors' => $e->errors()
                ]
            );

            return response()->json([
                'error' => $e->errors()
            ], 422);
        } catch (\Exception $e) {

            Log::error(
                'guardarReservaTemp ERROR',
                [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]
            );

            return response()->json([
                'error' => 'Error interno'
            ], 500);
        }
    }


    /* =========================================================
        OBTENER RESERVA TEMPORAL
    ========================================================== */

    public function obtenerReservaTemp(Request $request)
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

            $reservaTemp = DB::table('reservas_temporales')
                ->where('usuario_id', $user->id)
                ->latest()
                ->first();

            if (!$reservaTemp) {
                return response()->json(null);
            }

            $datos = json_decode(
                $reservaTemp->datos,
                true
            );

            return response()->json([

                'datos' =>
                $datos,

                'stripe_session_id' =>
                $reservaTemp->stripe_session_id ?? null,

            ]);
        } catch (\Exception $e) {

            Log::error(
                'obtenerReservaTemp ERROR',
                [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]
            );

            return response()->json([
                'error' => 'Error interno'
            ], 500);
        }
    }


    /* =========================================================
        CLIENTE DEL USUARIO
    ========================================================== */

    public function obtenerClienteUsuario(Request $request)
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

            $cliente = Cliente::where(
                'usuario_id',
                $user->id
            )->first();

            if (!$cliente) {
                return response()->json([
                    'error' => 'Cliente no encontrado'
                ], 404);
            }

            return response()->json($cliente);
        } catch (\Exception $e) {

            Log::error(
                'obtenerClienteUsuario ERROR',
                [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]
            );

            return response()->json([
                'error' => 'Error interno'
            ], 500);
        }
    }


    /* =========================================================
        VALIDAR DNI
    ========================================================== */

    public function validarDniReserva(Request $request)
    {
        $request->validate([

            'dni' =>
            'required|string|max:20',

            'paqueteId' =>
            'required|integer|exists:paquetes_turisticos,id',

        ]);

        $exists = DB::table('participantes')

            ->join(
                'reservas',
                'participantes.reserva_id',
                '=',
                'reservas.id'
            )

            ->where(
                'participantes.dni',
                $request->dni
            )

            ->where(
                'reservas.paquete_id',
                $request->paqueteId
            )

            ->whereIn(
                'reservas.estado',
                [
                    'Confirmada',
                    'Pendiente'
                ]
            )

            ->exists();

        return response()->json([
            'existe' => $exists
        ]);
    }


    /* =========================================================
        PROCESAR RESERVA PAGADA
    ========================================================== */
    //
    // ⭐ NUEVO ⭐ Aquí se descuenta 1 de habitaciones_disponibles
    // (tabla precios_paquetes) cuando el pago está confirmado.
    // Es idempotente: si la reserva ya existe, se devuelve antes
    // de llegar al descuento, así que webhook y verificarPagoExito
    // no pueden restar dos veces.
    //

    private function procesarReservaPagada($session)
    {
        Log::info('========================================');
        Log::info('PROCESAR RESERVA PAGADA - INICIO');
        Log::info('========================================');

        Log::info('Session recibida', [
            'session_id' => $session->id,
            'payment_status' => $session->payment_status ?? null,
        ]);

        return DB::transaction(function () use ($session) {

            Log::info('Entrando en transacción de reserva', [
                'session_id' => $session->id
            ]);

            /* =====================================================
                IDEMPOTENCIA
            ====================================================== */

            $existing = Reserva::where(
                'stripe_session_id',
                $session->id
            )
                ->lockForUpdate()
                ->first();

            if ($existing) {

                Log::info(
                    'Reserva ya existente. Se ignora.',
                    [
                        'session_id' =>
                        $session->id,

                        'reserva_id' =>
                        $existing->id,
                    ]
                );

                return $existing;
            }


            /* =====================================================
                METADATA
            ====================================================== */

            $metadata =
                json_decode(
                    json_encode($session->metadata),
                    true
                );

            Log::info(
                'Metadata Stripe',
                [
                    'metadata' => $metadata
                ]
            );

            if (
                empty($metadata['user_id']) ||
                empty($metadata['paquete_id']) ||
                empty($metadata['reserva_temp_id'])
            ) {

                Log::error(
                    'Metadata Stripe incompleta',
                    [
                        'metadata' => $metadata
                    ]
                );

                throw new \Exception(
                    'PERMANENTE: Metadata incompleta'
                );
            }


            /* =====================================================
                RESERVA TEMPORAL
            ====================================================== */

            $temp = DB::table(
                'reservas_temporales'
            )
                ->where(
                    'id',
                    $metadata['reserva_temp_id']
                )
                ->where(
                    'stripe_session_id',
                    $session->id
                )
                ->lockForUpdate()
                ->first();

            if (!$temp) {

                Log::error(
                    'RESERVA TEMPORAL NO ENCONTRADA',
                    [
                        'session_id' =>
                        $session->id,

                        'temp_id' =>
                        $metadata['reserva_temp_id'],
                    ]
                );

                DB::table(
                    'stripe_session_resultados'
                )->updateOrInsert(

                    [
                        'stripe_session_id' =>
                        $session->id
                    ],

                    [
                        'usuario_id' =>
                        $metadata['user_id'],

                        'resultado' =>
                        'temporal_no_encontrada',

                        'created_at' =>
                        now(),

                        'updated_at' =>
                        now(),
                    ]
                );

                throw new \Exception(
                    'PERMANENTE: Reserva temporal no encontrada'
                );
            }


            Log::info(
                'Reserva temporal encontrada',
                [
                    'temp_id' => $temp->id,
                    'session_id' => $session->id,
                ]
            );


            $datos = json_decode(
                $temp->datos,
                true
            );

            if (
                empty($datos['participantes']) ||
                !is_array($datos['participantes'])
            ) {

                throw new \Exception(
                    'PERMANENTE: Participantes inválidos'
                );
            }

            $numPersonas =
                count($datos['participantes']);


            /* =====================================================
                USUARIO
            ====================================================== */

            $user = User::find(
                $metadata['user_id']
            );

            if (!$user) {

                throw new \Exception(
                    'PERMANENTE: Usuario no encontrado'
                );
            }

            Log::info(
                'Usuario encontrado',
                [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]
            );


            /* =====================================================
                CLIENTE
            ====================================================== */

            $cliente = Cliente::where(
                'usuario_id',
                $user->id
            )->first();

            if (!$cliente) {

                throw new \Exception(
                    'PERMANENTE: Cliente no encontrado'
                );
            }

            Log::info(
                'Cliente encontrado',
                [
                    'cliente_id' => $cliente->id,
                    'cliente_email' => $cliente->email ?? null,
                ]
            );


            /* =====================================================
                PAQUETE
            ====================================================== */

            $paquete =
                PaqueteTuristico::lockForUpdate()
                ->find(
                    $metadata['paquete_id']
                );

            if (!$paquete) {

                throw new \Exception(
                    'PERMANENTE: Paquete no encontrado'
                );
            }

            Log::info(
                'Paquete encontrado',
                [
                    'paquete_id' => $paquete->id,
                    'nombre' => $paquete->nombre,
                    'plazas' => $paquete->plazas,
                    'precio' => $paquete->precio,
                ]
            );


            /* =====================================================
                PLAZAS
            ====================================================== */

            if ($paquete->plazas < $numPersonas) {

                DB::table(
                    'stripe_session_resultados'
                )->updateOrInsert(

                    [
                        'stripe_session_id' =>
                        $session->id
                    ],

                    [
                        'usuario_id' =>
                        $metadata['user_id'],

                        'resultado' =>
                        'sin_plazas',

                        'created_at' =>
                        now(),

                        'updated_at' =>
                        now(),
                    ]
                );

                Log::warning(
                    'NO HAY PLAZAS SUFICIENTES',
                    [
                        'plazas' => $paquete->plazas,
                        'personas' => $numPersonas,
                    ]
                );

                throw new \Exception(
                    'PERMANENTE: No hay plazas suficientes'
                );
            }


            /* =====================================================
                DESCONTAR PLAZAS
            ====================================================== */

            $paquete->decrement(
                'plazas',
                $numPersonas
            );


            /* =====================================================
                ⭐ NUEVO ⭐ DESCONTAR HABITACIÓN
            ====================================================== */
            //
            // Resta 1 a habitaciones_disponibles del tipo de
            // habitación pagado. Cada reserva ocupa UNA habitación
            // (el nº de viajeros lo fija la capacidad de la
            // habitación elegida).
            //
            // reservarHabitacion() hace un UPDATE atómico
            // "... WHERE habitaciones_disponibles > 0", así que dos
            // pagos simultáneos no pueden coger la última habitación.
            // Si el tipo no tiene límite (NULL) no se resta nada.
            //
            // Si falla, la excepción deshace TODA la transacción
            // (también el descuento de plazas de arriba).
            //

            if (!empty($metadata['precio_paquete_id'])) {

                $precioHabitacion = PrecioPaquete::where(
                    'id',
                    $metadata['precio_paquete_id']
                )
                    ->where('paquete_id', $paquete->id)
                    ->first();

                if ($precioHabitacion) {

                    if (!$precioHabitacion->reservarHabitacion()) {

                        DB::table(
                            'stripe_session_resultados'
                        )->updateOrInsert(

                            [
                                'stripe_session_id' =>
                                $session->id
                            ],

                            [
                                'usuario_id' =>
                                $metadata['user_id'],

                                'resultado' =>
                                'sin_habitaciones',

                                'created_at' =>
                                now(),

                                'updated_at' =>
                                now(),
                            ]
                        );

                        Log::warning(
                            'NO QUEDAN HABITACIONES DE ESTE TIPO',
                            [
                                'precio_paquete_id' =>
                                $precioHabitacion->id,

                                'tipo_habitacion' =>
                                $precioHabitacion->tipo_habitacion,

                                'session_id' =>
                                $session->id,
                            ]
                        );

                        throw new \Exception(
                            'PERMANENTE: No quedan habitaciones de este tipo'
                        );
                    }

                    Log::info(
                        'Habitación descontada',
                        [
                            'precio_paquete_id' =>
                            $precioHabitacion->id,

                            'tipo_habitacion' =>
                            $precioHabitacion->tipo_habitacion,
                        ]
                    );
                } else {

                    Log::warning(
                        'Habitación de la metadata no encontrada para este paquete',
                        [
                            'precio_paquete_id' =>
                            $metadata['precio_paquete_id'],

                            'paquete_id' =>
                            $paquete->id,
                        ]
                    );
                }
            }


            // =====================================================
            // PRECIO REAL DE LA HABITACIÓN
            // =====================================================
            //
            // Se usa el total ya calculado y verificado en
            // crearPago() (metadata), que es la fuente de verdad
            // del importe cobrado por Stripe.
            //
            $precioPorPersonaReal = isset($metadata['precio_por_persona'])
                ? (float) $metadata['precio_por_persona']
                : (float) $paquete->precio;

            $totalPrecio = isset($metadata['total_precio'])
                ? (float) $metadata['total_precio']
                : round($precioPorPersonaReal * $numPersonas, 2);

            Log::info(
                'Plazas descontadas',
                [
                    'personas' => $numPersonas,
                    'nuevo_stock' => $paquete->fresh()->plazas,
                    'precio_por_persona' => $precioPorPersonaReal,
                    'total' => $totalPrecio,
                ]
            );


            /* =====================================================
                CREAR RESERVA
            ====================================================== */

            $reserva = Reserva::create([

                'reservation_token' =>
                Str::uuid(),

                'cliente_id' =>
                $cliente->id,

                'paquete_id' =>
                $paquete->id,

                'num_personas' =>
                $numPersonas,

                'fecha_inicio' =>
                $paquete->fecha_inicio,

                'fecha_fin' =>
                $paquete->fecha_fin,

                'fecha_pago' =>
                now(),

                'metodo_pago' =>
                'stripe',

                'estado' =>
                'Confirmada',

                'num_cuotas' =>
                1,

                'importe_cuotas' =>
                $totalPrecio,

                'total_precio' =>
                $totalPrecio,

                'stripe_session_id' =>
                $session->id,

                'fecha_reserva' =>
                now(),

                'acepta_condiciones_black_friday' =>
                true,

                'condiciones_black_friday_aceptadas_at' =>
                now(),
            ]);

            Log::info(
                'RESERVA CREADA',
                [
                    'reserva_id' => $reserva->id,
                    'session_id' => $session->id,
                ]
            );


            /* =====================================================
                PARTICIPANTES
            ====================================================== */

            foreach (
                $datos['participantes']
                as $p
            ) {

                Participante::create([

                    'reserva_id' =>
                    $reserva->id,

                    'nombre' =>
                    $p['nombre'] ?? '',

                    'apellidos' =>
                    $p['apellidos'] ?? '',

                    'email' =>
                    $p['email'] ?? '',

                    'dni' =>
                    $p['dni'] ?? null,

                    'telefono' =>
                    $p['telefono'] ?? null,

                    'direccion' =>
                    $p['direccion'] ?? null,

                    'ciudad' =>
                    $p['ciudad'] ?? null,

                    'provincia' =>
                    $p['provincia'] ?? null,

                    'fecha_nacimiento' =>
                    $p['fechaNacimiento'] ?? null,

                    'experiencia' =>
                    $p['experiencia'] ?? null,

                    'motivacion' =>
                    $p['motivacion'] ?? null,

                    'info_relevante' =>
                    $p['infoRelevante'] ?? null,
                ]);
            }

            Log::info(
                'Participantes creados',
                [
                    'reserva_id' => $reserva->id,
                    'cantidad' => $numPersonas,
                ]
            );


            /* =====================================================
                FACTURA
            ====================================================== */

            DB::table('facturas')->insert([

                'cliente_id' =>
                $cliente->id,

                'reserva_id' =>
                $reserva->id,

                'nombre_cliente' =>
                $user->name ?? 'Cliente',

                'apellidos_cliente' =>
                $user->apellidos ?? '',

                'email_cliente' =>
                $user->email,

                'fecha_compra' =>
                now(),

                'metodo_pago' =>
                'stripe',

                'precio_total' =>
                $totalPrecio,

                'iva' =>
                21,

                'telefono_empresa' =>
                '659633676',

                'email_empresa' =>
                'info@viajesatalanta.com',

                'detalles' =>
                "Reserva de paquete turístico ID: {$paquete->id}",

                'created_at' =>
                now(),

                'updated_at' =>
                now(),
            ]);

            Log::info(
                'Factura creada',
                [
                    'reserva_id' => $reserva->id
                ]
            );


            /* =====================================================
                EMAILS
            ====================================================== */

            Log::info('========================================');
            Log::info('INICIO ENVÍO DE EMAILS');
            Log::info('========================================');

            try {

                Log::info(
                    'Preparando datos para email',
                    [
                        'reserva_id' => $reserva->id,
                        'usuario_email' => $user->email,
                        'cliente_email' => $cliente->email ?? null,
                    ]
                );


                $clienteArray = [

                    'nombre' =>
                    $cliente->nombre
                        ?? $user->name
                        ?? '',

                    'apellidos' =>
                    $cliente->apellidos
                        ?? $user->apellidos
                        ?? '',

                    'dni' =>
                    $cliente->dni
                        ?? '',

                    'direccion' =>
                    $cliente->direccion
                        ?? '',

                    'telefono' =>
                    $cliente->telefono
                        ?? '',

                    'email' =>
                    $user->email
                        ?? '',
                ];


                $nombreCompleto =
                    trim(
                        ($user->name ?? 'Cliente')
                            . ' '
                            . ($user->apellidos ?? '')
                    );


                Log::info(
                    'clienteArray preparado',
                    [
                        'clienteArray' => $clienteArray,
                        'nombreCompleto' => $nombreCompleto,
                    ]
                );


                /* =================================================
                    SERVICIOS INCLUIDOS
                ================================================== */

                $serviciosIncluidos =
                    DB::table('incluye')

                    ->where(
                        'paquete_id',
                        $paquete->id
                    )

                    ->pluck('descripcion')

                    ->toArray();


                Log::info(
                    'Servicios incluidos obtenidos',
                    [
                        'cantidad' =>
                        count($serviciosIncluidos)
                    ]
                );


                /* =================================================
                    SERVICIOS NO INCLUIDOS
                ================================================== */

                $serviciosNoIncluidos =
                    DB::table('no_incluye')

                    ->where(
                        'paquete_id',
                        $paquete->id
                    )

                    ->pluck('descripcion')

                    ->toArray();


                Log::info(
                    'Servicios no incluidos obtenidos',
                    [
                        'cantidad' =>
                        count($serviciosNoIncluidos)
                    ]
                );


                /* =================================================
                    DESCUENTOS
                ================================================== */

                $descuentos =
                    DB::table('descuentos')

                    ->select(
                        'titulo',
                        'codigo',
                        'descripcion',
                        'enlace'
                    )

                    ->get()

                    ->map(function ($d) {

                        return [

                            'titulo' =>
                            $d->titulo,

                            'codigo' =>
                            $d->codigo,

                            'descripcion' =>
                            $d->descripcion,

                            'enlace' =>
                            $d->enlace,
                        ];
                    })

                    ->toArray();


                Log::info(
                    'Descuentos obtenidos',
                    [
                        'cantidad' =>
                        count($descuentos)
                    ]
                );


                /* =================================================
                    ITINERARIO
                ================================================== */

                $itinerario =
                    DB::table('itinerarios')

                    ->where(
                        'paquete_turistico_id',
                        $paquete->id
                    )

                    ->orderBy('fecha')

                    ->get()

                    ->map(function ($i) {

                        return [

                            'dia' =>
                            $i->dia,

                            'fecha' =>
                            $i->fecha,

                            'descripcion' =>
                            $i->descripcion,
                        ];
                    })

                    ->toArray();


                Log::info(
                    'Itinerario obtenido',
                    [
                        'cantidad' =>
                        count($itinerario)
                    ]
                );


                /* =================================================
                    CONFIGURACIÓN MAIL
                ================================================== */

                Log::info(
                    'Configuración Mail Laravel',
                    [
                        'mailer' =>
                        config('mail.default'),

                        'host' =>
                        config('mail.mailers.smtp.host'),

                        'port' =>
                        config('mail.mailers.smtp.port'),

                        'encryption' =>
                        config('mail.mailers.smtp.encryption'),

                        'from_address' =>
                        config('mail.from.address'),

                        'from_name' =>
                        config('mail.from.name'),
                    ]
                );


                /* =================================================
                    EMAIL CLIENTE
                ================================================== */

                Log::info(
                    'INTENTANDO ENVIAR EMAIL AL CLIENTE',
                    [
                        'destinatario' =>
                        $user->email,

                        'reserva_id' =>
                        $reserva->id,
                    ]
                );


                Mail::to($user->email)->send(
                    new ReservaConfirmacionMail(
                        cliente: $clienteArray,
                        fechaReservaFormatted: date('d/m/Y'),
                        precioUnitario: $precioPorPersonaReal,
                        subtotal: $totalPrecio,
                        name: $nombreCompleto,
                        tipoPago: 'total',
                        numCuotas: 1,
                        importeCuotas: $totalPrecio,
                        plazas: $numPersonas,
                        totalPrecio: $totalPrecio,
                        destino: $paquete->nombre,
                        linkPagoCuotas: null,
                        reserva: $reserva,
                        participantes: $datos['participantes'],
                        paqueteNombre: $paquete->nombre,
                        reservaId: $reserva->id,
                        clienteNombreCompleto: $nombreCompleto,
                        fechaInicio: $paquete->fecha_inicio,
                        fechaFin: $paquete->fecha_fin,
                        serviciosIncluidos: $serviciosIncluidos,
                        serviciosNoIncluidos: $serviciosNoIncluidos,
                        descuentos: $descuentos,
                        itinerario: $itinerario,
                        vouchers: []
                    )
                );


                Log::info(
                    'EMAIL CLIENTE ENVIADO CORRECTAMENTE',
                    [
                        'destinatario' =>
                        $user->email,

                        'reserva_id' =>
                        $reserva->id,
                    ]
                );


                /* =================================================
                    EMAIL ADMINISTRACIÓN
                ================================================== */

                Log::info(
                    'INTENTANDO ENVIAR EMAIL ADMINISTRACIÓN',
                    [
                        'destinatario' =>
                        'lourdes.hernandezsilva@viajesatalanta.com',

                        'reserva_id' =>
                        $reserva->id,
                    ]
                );


                Mail::to(
                    'lourdes.hernandezsilva@viajesatalanta.com'
                )->send(

                    new NotificacionNuevaReserva(
                        $reserva,
                        $datos['participantes']
                    )
                );


                Log::info(
                    'EMAIL ADMINISTRACIÓN ENVIADO CORRECTAMENTE',
                    [
                        'destinatario' =>
                        'lourdes.hernandezsilva@viajesatalanta.com',

                        'reserva_id' =>
                        $reserva->id,
                    ]
                );


                Log::info(
                    '========================================'
                );

                Log::info(
                    'TODOS LOS EMAILS ENVIADOS CORRECTAMENTE'
                );

                Log::info(
                    '========================================'
                );
            } catch (\Exception $mailError) {

                Log::error(
                    '========================================'
                );

                Log::error(
                    'ERROR ENVIANDO EMAILS'
                );

                Log::error(
                    '========================================'
                );

                Log::error(
                    'Error de Mail',
                    [
                        'reserva_id' =>
                        $reserva->id,

                        'session_id' =>
                        $session->id,

                        'destinatario_cliente' =>
                        $user->email,

                        'error' =>
                        $mailError->getMessage(),

                        'exception_class' =>
                        get_class($mailError),

                        'file' =>
                        $mailError->getFile(),

                        'line' =>
                        $mailError->getLine(),

                        'trace' =>
                        $mailError->getTraceAsString(),
                    ]
                );
            }


            /* =====================================================
                ELIMINAR TEMPORAL
            ====================================================== */

            DB::table('reservas_temporales')
                ->where('id', $temp->id)
                ->delete();


            Log::info(
                'Reserva temporal eliminada',
                [
                    'temp_id' =>
                    $temp->id,

                    'reserva_id' =>
                    $reserva->id,
                ]
            );


            Log::info(
                '========================================'
            );

            Log::info(
                'RESERVA CREADA CORRECTAMENTE',
                [
                    'reserva_id' =>
                    $reserva->id,

                    'session_id' =>
                    $session->id,

                    'paquete_id' =>
                    $paquete->id,

                    'personas' =>
                    $numPersonas,

                    'total' =>
                    $totalPrecio,
                ]
            );

            Log::info(
                '========================================'
            );


            return $reserva;
        });
    }


    /* =========================================================
        WEBHOOK STRIPE
    ========================================================== */

    public function stripeWebhook(Request $request)
    {
        Log::info('==============================');
        Log::info('STRIPE WEBHOOK INICIO');
        Log::info('==============================');

        $payload =
            $request->getContent();

        $sigHeader =
            $request->server(
                'HTTP_STRIPE_SIGNATURE'
            );

        $endpointSecret =
            config(
                'services.stripe.webhook_secret'
            );

        try {

            $event =
                \Stripe\Webhook::constructEvent(
                    $payload,
                    $sigHeader,
                    $endpointSecret
                );
        } catch (\Exception $e) {

            Log::error(
                'Webhook firma inválida',
                [
                    'error' =>
                    $e->getMessage()
                ]
            );

            return response()->json([
                'error' => 'Webhook inválido'
            ], 400);
        }


        Log::info(
            'Webhook Stripe recibido',
            [
                'event_id' =>
                $event->id,

                'event_type' =>
                $event->type,
            ]
        );


        if (
            !in_array(
                $event->type,
                [
                    'checkout.session.completed',
                    'checkout.session.async_payment_succeeded'
                ]
            )
        ) {

            Log::info(
                'Evento Stripe ignorado',
                [
                    'event_type' =>
                    $event->type
                ]
            );

            return response()->json([
                'ok' => true
            ]);
        }


        $session =
            $event->data->object;


        if (
            $session->payment_status !== 'paid'
        ) {

            Log::warning(
                'Checkout recibido pero no está pagado',
                [
                    'session_id' =>
                    $session->id,

                    'payment_status' =>
                    $session->payment_status,
                ]
            );

            return response()->json([
                'ok' => true
            ]);
        }


        try {

            Log::info(
                'Iniciando procesamiento de reserva desde webhook',
                [
                    'session_id' =>
                    $session->id
                ]
            );

            $reserva =
                $this->procesarReservaPagada(
                    $session
                );

            Log::info(
                'Webhook procesado correctamente',
                [
                    'session_id' =>
                    $session->id,

                    'reserva_id' =>
                    $reserva->id,
                ]
            );

            return response()->json([
                'success' => true
            ]);
        } catch (\Exception $e) {

            Log::error(
                'ERROR PROCESANDO WEBHOOK',
                [
                    'session_id' =>
                    $session->id,

                    'error' =>
                    $e->getMessage(),

                    'trace' =>
                    $e->getTraceAsString(),
                ]
            );


            if (
                str_starts_with(
                    $e->getMessage(),
                    'PERMANENTE:'
                )
            ) {

                return response()->json([
                    'error' =>
                    'no reintentar'
                ], 200);
            }


            return response()->json([
                'error' =>
                'error interno'
            ], 500);
        }
    }


    /* =========================================================
        VERIFICAR PAGO EXITOSO
    ========================================================== */

    public function verificarPagoExito(Request $request)
    {
        try {

            Log::info(
                '=============================='
            );

            Log::info(
                'VERIFICAR PAGO EXITO INICIO'
            );

            Log::info(
                '=============================='
            );


            /* =====================================================
                AUTENTICACIÓN
            ====================================================== */

            $token =
                $request->cookie(
                    'access_token'
                );

            if (!$token) {

                Log::warning(
                    'verificarPagoExito: no existe access_token'
                );

                return response()->json([
                    'error' =>
                    'No autenticado'
                ], 401);
            }


            $user =
                JWTAuth::setToken(
                    $token
                )->authenticate();


            if (!$user) {

                Log::warning(
                    'verificarPagoExito: usuario no autenticado'
                );

                return response()->json([
                    'error' =>
                    'No autenticado'
                ], 401);
            }


            Log::info(
                'Usuario autenticado',
                [
                    'user_id' =>
                    $user->id,

                    'email' =>
                    $user->email,
                ]
            );


            /* =====================================================
                SESSION ID
            ====================================================== */

            $sessionId =
                $request->query(
                    'session_id'
                );


            if (!$sessionId) {

                return response()->json([
                    'error' =>
                    'session_id requerido'
                ], 400);
            }


            Log::info(
                'Session ID recibido',
                [
                    'session_id' =>
                    $sessionId
                ]
            );


            Stripe::setApiKey(
                config(
                    'services.stripe.secret'
                )
            );


            /* =====================================================
                RESERVA YA EXISTE
            ====================================================== */

            $reserva =
                Reserva::where(
                    'stripe_session_id',
                    $sessionId
                )->first();


            if ($reserva) {

                $cliente =
                    Cliente::where(
                        'id',
                        $reserva->cliente_id
                    )->first();


                if (
                    !$cliente ||
                    $cliente->usuario_id != $user->id
                ) {

                    Log::warning(
                        'Intento de consultar reserva de otro usuario',
                        [
                            'session_id' =>
                            $sessionId,

                            'user_id' =>
                            $user->id,

                            'reserva_id' =>
                            $reserva->id,
                        ]
                    );

                    return response()->json([
                        'error' =>
                        'No autorizado'
                    ], 403);
                }


                Log::info(
                    'Reserva definitiva encontrada',
                    [
                        'reserva_id' =>
                        $reserva->id
                    ]
                );


                return response()->json([

                    'estado' =>
                    'confirmada',

                    'reserva_id' =>
                    $reserva->id,

                    'paquete_id' =>
                    $reserva->paquete_id,

                    'num_personas' =>
                    $reserva->num_personas,

                    'total_precio' =>
                    $reserva->total_precio,

                    'email' =>
                    $cliente->email
                        ?? $user->email,
                ]);
            }


            /* =====================================================
                CONSULTAR STRIPE
            ====================================================== */

            Log::info(
                'No existe reserva. Consultando Stripe...',
                [
                    'session_id' =>
                    $sessionId
                ]
            );


            try {

                $stripeSession =
                    Session::retrieve(
                        $sessionId
                    );


                Log::info(
                    'Sesión Stripe obtenida',
                    [
                        'session_id' =>
                        $stripeSession->id,

                        'payment_status' =>
                        $stripeSession->payment_status,

                        'status' =>
                        $stripeSession->status,
                    ]
                );


                if (
                    $stripeSession->payment_status === 'paid'
                ) {

                    Log::info(
                        'Stripe confirma pago. Procesando reserva directamente...',
                        [
                            'session_id' =>
                            $sessionId
                        ]
                    );


                    try {

                        $reserva =
                            $this->procesarReservaPagada(
                                $stripeSession
                            );


                        $cliente =
                            Cliente::where(
                                'id',
                                $reserva->cliente_id
                            )->first();


                        if (
                            !$cliente ||
                            $cliente->usuario_id != $user->id
                        ) {

                            Log::warning(
                                'La sesión pagada no pertenece al usuario',
                                [
                                    'session_id' =>
                                    $sessionId,

                                    'user_id' =>
                                    $user->id,
                                ]
                            );

                            return response()->json([
                                'error' =>
                                'No autorizado'
                            ], 403);
                        }


                        Log::info(
                            'Reserva creada desde verificarPagoExito',
                            [
                                'reserva_id' =>
                                $reserva->id,

                                'session_id' =>
                                $sessionId,
                            ]
                        );


                        return response()->json([

                            'estado' =>
                            'confirmada',

                            'reserva_id' =>
                            $reserva->id,

                            'paquete_id' =>
                            $reserva->paquete_id,

                            'num_personas' =>
                            $reserva->num_personas,

                            'total_precio' =>
                            $reserva->total_precio,

                            'email' =>
                            $cliente->email
                                ?? $user->email,
                        ]);
                    } catch (\Exception $processError) {

                        Log::error(
                            'Error procesando reserva desde verificarPagoExito',
                            [
                                'session_id' =>
                                $sessionId,

                                'error' =>
                                $processError->getMessage(),

                                'trace' =>
                                $processError->getTraceAsString(),
                            ]
                        );

                        return response()->json([
                            'estado' =>
                            'pendiente'
                        ]);
                    }
                }


                Log::warning(
                    'Stripe indica que el pago no está completado',
                    [
                        'session_id' =>
                        $sessionId,

                        'payment_status' =>
                        $stripeSession->payment_status,
                    ]
                );


                return response()->json([

                    'estado' =>
                    'pendiente',

                ]);
            } catch (\Exception $stripeEx) {

                Log::error(
                    'Error consultando Stripe',
                    [
                        'session_id' =>
                        $sessionId,

                        'error' =>
                        $stripeEx->getMessage(),

                        'trace' =>
                        $stripeEx->getTraceAsString(),
                    ]
                );


                return response()->json([
                    'estado' =>
                    'pendiente'
                ]);
            }
        } catch (\Exception $e) {

            Log::error(
                'verificarPagoExito ERROR',
                [
                    'error' =>
                    $e->getMessage(),

                    'trace' =>
                    $e->getTraceAsString(),
                ]
            );

            return response()->json([
                'error' =>
                'Error interno'
            ], 500);
        }
    }
}