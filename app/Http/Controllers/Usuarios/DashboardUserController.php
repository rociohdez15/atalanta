<?php

namespace App\Http\Controllers\Usuarios;

use App\Models\Cliente;
use App\Models\User;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\Controller;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class DashboardUserController extends Controller
{

    public function show(Request $request)
    {
        try {
            // Busca token en la cookie "token"
            $token = $request->cookie('access_token');
            if (!$token) {
                return response()->json(['error' => 'Token no proporcionado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o usuario no autenticado'], 401);
        }

        $cliente = Cliente::where('usuario_id', $user->id)->first();

        if (!$cliente) {
            return response()->json(['error' => 'Cliente no encontrado'], 404);
        }

        return response()->json($cliente);
    }

    public function update(Request $request)
    {
        try {
            // Obtener token desde la cookie HttpOnly llamada 'token'
            $token = $request->cookie('access_token');
            if (!$token) {
                return response()->json(['error' => 'Token no proporcionado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o usuario no autenticado'], 401);
        }

        $cliente = Cliente::where('usuario_id', $user->id)->first();

        if (!$cliente) {
            return response()->json(['error' => 'Cliente no encontrado'], 404);
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'required|string|max:20|unique:clientes,dni,' . $cliente->id,
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
        ]);

        $cliente->nombre = $request->nombre;
        $cliente->apellidos = $request->apellidos;
        $cliente->dni = $request->dni;
        $cliente->direccion = $request->direccion;
        $cliente->telefono = $request->telefono;
        $cliente->fecha_nacimiento = $request->fecha_nacimiento;

        $cliente->save();

        return response()->json($cliente);
    }

    public function cambioPassword(Request $request)
    {
        Log::info('Inicio cambioPassword');

        $request->validate([
            'current_password' => ['required'],
            'new_password' => ['required', 'min:8', 'confirmed'], // asegurarse de que hay un campo new_password_confirmation
        ]);

        Log::info('Validación de datos completada', [
            'current_password' => $request->current_password,
            // No pongas new_password por seguridad
        ]);

        try {
            // Leer token desde la cookie HttpOnly llamada 'token'
            $token = $request->cookie('access_token');
            if (!$token) {
                return response()->json(['error' => 'Token no proporcionado'], 401);
            }

            $jwtUser = JWTAuth::setToken($token)->authenticate();
            Log::info('Usuario autenticado con JWT', ['user_id' => $jwtUser->id]);
        } catch (\Exception $e) {
            Log::error('Error al autenticar token JWT', ['exception' => $e->getMessage()]);
            return response()->json(['error' => 'Token inválido o usuario no autenticado'], 401);
        }

        $user = User::find($jwtUser->id);

        if (!$user) {
            Log::error('Usuario no encontrado en la base de datos', ['user_id' => $jwtUser->id]);
            return response()->json(['error' => 'Usuario no encontrado.'], 404);
        }

        Log::info('Usuario encontrado', ['user_id' => $user->id]);

        if (!Hash::check($request->current_password, $user->password)) {
            Log::warning('Contraseña actual incorrecta', [
                'user_id' => $user->id,
            ]);
            return response()->json(['current_password' => ['La contraseña actual no es correcta.']], 422);
        }

        Log::info('Contraseña actual correcta, procediendo a cambiarla');

        $user->password = Hash::make($request->new_password);

        if ($user->save()) {
            Log::info('Contraseña actualizada y usuario guardado', ['user_id' => $user->id]);
        } else {
            Log::error('Error al guardar el usuario tras cambiar la contraseña', ['user_id' => $user->id]);
            return response()->json(['error' => 'Error al actualizar la contraseña.'], 500);
        }

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.'
        ], 200);
    }

    public function listarReservasUsuario(Request $request)
    {
        try {
            // El token se recibe desde la cookie HttpOnly.
            $token = $request->cookie('access_token');

            if (!$token) {
                return response()->json(['error' => 'Token no proporcionado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            $cliente = Cliente::where('usuario_id', $user->id)->first();

            if (!$cliente) {
                return response()->json(['error' => 'Cliente no encontrado'], 404);
            }

            // Incluimos el paquete cuando existe. Las reservas personalizadas
            // pueden no tener paquete asociado y guardan sus fechas en reservas.
            $reservas = $cliente->reservas()
                ->with(['paquete', 'cliente'])
                ->get();

            $formatearFecha = static function ($valor) {
                if (empty($valor)) {
                    return null;
                }

                try {
                    return \Carbon\Carbon::parse($valor)->format('Y-m-d');
                } catch (\Throwable $e) {
                    return null;
                }
            };

            $resultado = $reservas->map(function ($reserva) use ($formatearFecha) {
                $paquete = $reserva->paquete;
                $esPersonalizado = empty($reserva->paquete_id)
                    || (int) $reserva->paquete_id === 0;

                // Para reservas personalizadas, el nombre se guarda en la reserva;
                // para las normales, se obtiene del paquete relacionado.
                $experiencia = $esPersonalizado
                    ? ($reserva->destino
                        ?? $reserva->nombre_experiencia
                        ?? $reserva->experiencia
                        ?? 'Experiencia personalizada')
                    : ($paquete?->nombre
                        ?? $reserva->destino
                        ?? 'Experiencia');

                // En las personalizadas las fechas pertenecen a la reserva.
                // En las normales se usan primero las fechas del paquete.
                $fechaInicioOrigen = $esPersonalizado
                    ? ($reserva->fecha_inicio ?? null)
                    : ($paquete?->fecha_inicio ?? $reserva->fecha_inicio ?? null);

                $fechaFinOrigen = $esPersonalizado
                    ? ($reserva->fecha_fin ?? null)
                    : ($paquete?->fecha_fin ?? $reserva->fecha_fin ?? null);

                $clienteNombreCompleto = $reserva->cliente
                    ? trim(($reserva->cliente->nombre ?? '') . ' ' . ($reserva->cliente->apellidos ?? ''))
                    : null;

                return [
                    'reserva_id' => $reserva->id,
                    'numero_reserva' => $reserva->reservation_token ?? null,
                    'experiencia' => $experiencia,
                    'clienteNombreCompleto' => $clienteNombreCompleto,
                    'fecha_reserva' => $formatearFecha($reserva->fecha_reserva),
                    'fecha_inicio' => $formatearFecha($fechaInicioOrigen),
                    'fecha_fin' => $formatearFecha($fechaFinOrigen),
                    'tipo_pago' => $reserva->metodo_pago,
                    'num_cuotas' => $reserva->num_cuotas ?? null,
                    'importe_cuotas' => $reserva->importe_cuotas ?? null,
                    'total_precio' => $reserva->total_precio,
                    'num_personas' => $reserva->num_personas,
                    'estado' => $reserva->estado,
                ];
            });

            return response()->json($resultado);
        } catch (\Throwable $e) {
            Log::error('Error en listarReservasUsuario', [
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'No se pudieron cargar las reservas'], 500);
        }
    }

   public function mostrarNombrePorLog(Request $request, $reservaId)
{
    try {
        // Leer token desde cookie HttpOnly
        $token = $request->cookie('access_token');

        if (!$token) {
            return response()->json([
                'error' => 'Token no proporcionado'
            ], 401);
        }

        $user = JWTAuth::setToken($token)->authenticate();

    } catch (\Exception $e) {

        Log::error(
            'Token inválido o usuario no autenticado: ' .
            $e->getMessage()
        );

        return response()->json([
            'error' => 'Token inválido o usuario no autenticado'
        ], 401);
    }

    // =========================================================
    // CLIENTE
    // =========================================================

    $cliente = Cliente::where(
        'usuario_id',
        $user->id
    )->first();

    if (!$cliente) {

        Log::error(
            'Cliente no encontrado para usuario ID: ' .
            $user->id
        );

        return response()->json([
            'error' => 'Cliente no encontrado'
        ], 404);
    }

    // Obtener usuario para recuperar el email
    $usuarioCliente = User::find($cliente->usuario_id);

    // =========================================================
    // RESERVA
    // =========================================================

    $reserva = Reserva::with([
        'paquete.incluye',
        'incluye_personalizados',
    ])->find($reservaId);

    if (!$reserva) {

        Log::error(
            "Reserva no encontrada con ID: {$reservaId}"
        );

        return response()->json([
            'error' => 'Reserva no encontrada'
        ], 404);
    }

    $paquete = $reserva->paquete;

    $esPersonalizado = empty($reserva->paquete_id)
        || (int) $reserva->paquete_id === 0;

    // =========================================================
    // NOMBRE DEL PAQUETE / DESTINO
    // =========================================================

    $nombrePaquete = $esPersonalizado
        ? ($reserva->destino ?? 'Destino personalizado')
        : ($paquete->nombre ?? ($reserva->destino ?? 'Experiencia'));

    // =========================================================
    // FECHAS
    // =========================================================

    $extraerFecha = function ($valor) {

        if (empty($valor)) {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($valor);
        } catch (\Throwable $e) {
            return null;
        }
    };

    $fechaReservaCarbon = $extraerFecha(
        $reserva->fecha_reserva
    );

    // Para personalizados se utilizan las fechas de la reserva.
    // Para paquetes se utilizan las fechas del paquete.
    if ($esPersonalizado) {

        $fechaInicioCarbon = $extraerFecha(
            $reserva->fecha_inicio
        );

        $fechaFinCarbon = $extraerFecha(
            $reserva->fecha_fin
        );

    } else {

        $fechaInicioCarbon = $extraerFecha(
            $paquete->fecha_inicio ??
            $reserva->fecha_inicio ??
            null
        );

        $fechaFinCarbon = $extraerFecha(
            $paquete->fecha_fin ??
            $reserva->fecha_fin ??
            null
        );
    }

    $fechaReservaFormatted = $fechaReservaCarbon
        ? $fechaReservaCarbon->format('d/m/Y')
        : 'No disponible';

    $fechaInicio = $fechaInicioCarbon
        ? $fechaInicioCarbon->format('d-m-Y')
        : 'No disponible';

    $fechaFin = $fechaFinCarbon
        ? $fechaFinCarbon->format('d-m-Y')
        : 'No disponible';

    $fechaInicioFormatted = $fechaInicioCarbon
        ? $fechaInicioCarbon->format('d/m/Y')
        : 'No disponible';

    $fechaFinFormatted = $fechaFinCarbon
        ? $fechaFinCarbon->format('d/m/Y')
        : 'No disponible';

    // =========================================================
    // DATOS DEL CLIENTE
    // =========================================================

    $nombreCliente = trim(
        ($cliente->nombre ?? '') .
        ' ' .
        ($cliente->apellidos ?? '')
    );

    $dniCliente = $cliente->dni ??
        'No especificado';

    $direccionCliente = $cliente->direccion ??
        'No especificada';

    $telefonoCliente = $cliente->telefono ??
        'No especificado';

    // 🔹 EL EMAIL SE OBTIENE DE USERS
    $emailCliente = $usuarioCliente?->email ??
        'No especificado';

    // =========================================================
    // DATOS ECONÓMICOS
    // =========================================================

    $tipoPago = strtolower(
        (string) ($reserva->metodo_pago ?? '')
    );

    $plazas = (int) (
        $reserva->num_personas ?? 0
    );

    $totalPrecioFloat = (float) (
        $reserva->total_precio ?? 0
    );

    $baseImponible = $totalPrecioFloat > 0
        ? $totalPrecioFloat / 1.21
        : 0;

    $iva = $totalPrecioFloat - $baseImponible;

    $baseImponibleFormatted = number_format(
        $baseImponible,
        2,
        ',',
        '.'
    );

    $ivaFormatted = number_format(
        $iva,
        2,
        ',',
        '.'
    );

    $totalPrecioFormatted = number_format(
        $totalPrecioFloat,
        2,
        ',',
        '.'
    );

    $subtotal = number_format(
        $totalPrecioFloat,
        2,
        ',',
        '.'
    );

    // =========================================================
    // NOTAS
    // =========================================================

    $notas = $reserva->notas ?? '';

    if (is_array($notas)) {
        $notas = implode("\n", $notas);
    }

    if (is_object($notas)) {
        $notas = json_encode(
            $notas,
            JSON_UNESCAPED_UNICODE
        );
    }

    $notas = (string) $notas;

    // =========================================================
    // PARTICIPANTES
    // =========================================================


    // =========================================================
    // SERVICIOS INCLUIDOS
    // =========================================================

    $serviciosIncluidos = $esPersonalizado
        ? $reserva->incluye_personalizados
        : ($paquete->incluye ?? collect());

    // =========================================================
    // FUNCIÓN PARA ESCAPAR HTML
    // =========================================================

    $esc = function ($value) {
        return htmlspecialchars(
            (string) ($value ?? ''),
            ENT_QUOTES,
            'UTF-8'
        );
    };

    // =========================================================
    // ESCAPAR DATOS
    // =========================================================

    $nombreCliente = $esc($nombreCliente);
    $dniCliente = $esc($dniCliente);
    $direccionCliente = $esc($direccionCliente);
    $telefonoCliente = $esc($telefonoCliente);
    $emailCliente = $esc($emailCliente);

    $nombrePaquete = $esc($nombrePaquete);

    $fechaReservaFormatted = $esc(
        $fechaReservaFormatted
    );

    $fechaInicio = $esc($fechaInicio);
    $fechaFin = $esc($fechaFin);

    $fechaInicioFormatted = $esc(
        $fechaInicioFormatted
    );

    $fechaFinFormatted = $esc(
        $fechaFinFormatted
    );

    // =========================================================
    // LOGO
    // =========================================================

    $logoPath = public_path(
        'images/logo_factura_negro.png'
    );

    if (file_exists($logoPath)) {

        $logoBase64 = base64_encode(
            file_get_contents($logoPath)
        );

        $logoSrc =
            'data:image/png;base64,' .
            $logoBase64;

    } else {

        $logoSrc =
            'data:image/png;base64,' .
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMB/eeFmjAAAAAASUVORK5CYII=';
    }

    // =========================================================
    // HTML PDF
    // =========================================================

    $htmlPdf = "
<html>
<head>

<style>

@page {
    margin:10mm 20mm 10mm 10mm;
}

body {
    font-family:'DejaVu Sans', Arial, sans-serif;
    color:#333;
    margin:0;
    padding:0;
}

h1,
h2,
h3 {
    margin:0;
    padding:0;
}

table {
    width:100%;
    border-collapse:collapse;
    font-size:13px;
}

th,
td {
    padding:12px;
}

th {
    background:#000000;
    color:#ffffff;
}

</style>

</head>

<body>

<div style='padding:30px;'>

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <table
        width='100%'
        style='
            border-bottom:4px solid #000000;
            margin-bottom:20px;
            padding-bottom:10px;
        '
    >

        <tr>

            <td
                style='
                    width:30%;
                    vertical-align:middle;
                '
            >

                <img
                    src='{$logoSrc}'
                    alt='Logo Empresa'
                    style='
                        height:100px;
                        border-radius:6px;
                    '
                >

            </td>

            <td
                style='
                    width:70%;
                    vertical-align:middle;
                    text-align:right;
                '
            >

                <div
                    style='
                        font-size:11px;
                        color:#000000;
                        text-align:right;
                    '
                >

                    <strong>
                        Fecha de emisión:
                    </strong>

                    <br>

                    " . date('d/m/Y') . "

                </div>

            </td>

        </tr>

    </table>


    <!-- =====================================================
         DATOS EMISOR Y CLIENTE
    ====================================================== -->

    <div
        style='
            display:table;
            width:100%;
            margin-bottom:50px;
        '
    >

        <!-- EMISOR -->

        <div
            style='
                display:table-cell;
                width:50%;
                vertical-align:top;
                text-align:left;
            '
        >

            <div
                style='
                    background-color:#f5f5f5;
                    padding:20px;
                    border-radius:10px;
                    border:2px solid #000000;
                '
            >

                <h3
                    style='
                        color:#000000;
                        font-size:14px;
                        font-weight:bold;
                        margin-bottom:10px;
                        text-transform:uppercase;
                        letter-spacing:1px;
                    '
                >
                    Datos del emisor
                </h3>

                <div
                    style='
                        font-size:13px;
                        line-height:1.3;
                    '
                >

                    <p style='margin:0 0 4px 0;'>
                        <strong>
                            Atalanta
                        </strong>
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Dirección:
                        Villanueva de los Castillejos,
                        Huelva, España
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Tel: +34 614 892 722
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Email: info@viajesatalanta.com
                    </p>

                    <p style='margin:0 0 6px 0;'>
                        Web: www.viajesatalanta.com
                    </p>

                </div>

            </div>

        </div>


        <!-- CLIENTE -->

        <div
            style='
                display:table-cell;
                width:50%;
                vertical-align:top;
                text-align:right;
            '
        >

            <div
                style='
                    background-color:#f5f5f5;
                    padding:20px;
                    border-radius:10px;
                    border:2px solid #000000;
                    display:inline-block;
                    text-align:left;
                '
            >

                <h3
                    style='
                        color:#000000;
                        font-size:14px;
                        font-weight:bold;
                        margin-bottom:10px;
                        text-transform:uppercase;
                        letter-spacing:1px;
                    '
                >
                    Datos del cliente
                </h3>

                <div
                    style='
                        font-size:13px;
                        line-height:1.3;
                    '
                >

                    <p style='margin:0 0 4px 0;'>
                        <strong>
                            {$nombreCliente}
                        </strong>
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        DNI: {$dniCliente}
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Dirección: {$direccionCliente}
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Tel: {$telefonoCliente}
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Email: {$emailCliente}
                    </p>

                </div>

            </div>

        </div>

    </div>


    <!-- =====================================================
         DETALLES DE LA EXPERIENCIA
    ====================================================== -->

    <div
        style='
            background-color:#f5f5f5;
            padding:20px;
            border-radius:10px;
            margin-bottom:30px;
            border:1px solid rgba(138,119,90,0.2);
        '
    >

        <h3
            style='
                color:#000000;
                font-size:16px;
                font-weight:bold;
                margin-bottom:15px;
            '
        >
            Detalles de la experiencia
        </h3>

        <table>

            <tr>

                <td
                    style='
                        width:50%;
                        padding:5px 10px;
                        vertical-align:top;
                    '
                >

                    <strong>
                        Experiencia:
                    </strong>

                    <br>

                    <span style='font-size:12px;'>
                        <strong>
                            {$nombrePaquete}
                        </strong>
                    </span>

                    <br><br>

                    <strong>
                        Fecha de reserva:
                    </strong>

                    <br>

                    {$fechaReservaFormatted}

                    <br><br>

                    <strong>
                        Fecha de ida:
                    </strong>

                    <br>

                    {$fechaInicioFormatted}

                </td>


                <td
                    style='
                        width:50%;
                        padding:5px 10px;
                        vertical-align:top;
                    '
                >

                    <strong>
                        Fecha de vuelta:
                    </strong>

                    <br>

                    {$fechaFinFormatted}

                    <br><br>

                    <strong>
                        Número de viajeros:
                    </strong>

                    <br>

                    {$plazas}
";

    $htmlPdf .= $plazas == 1
        ? " persona"
        : " personas";

    $htmlPdf .= "
                </td>

            </tr>

        </table>

    </div>


    <!-- =====================================================
         SERVICIOS INCLUIDOS
    ====================================================== -->

    <h3
        style='
            color:#000000;
            font-size:16px;
            font-weight:bold;
            margin-bottom:15px;
        '
    >
        Servicios incluidos
    </h3>

    <div style='margin-bottom:20px;'>

        <table>

            <thead>

                <tr
                    style='
                        background-color:#000000;
                        color:#ffffff;
                    '
                >

                    <th
                        style='
                            padding:12px;
                            text-align:left;
                        '
                    >
                        Descripción
                    </th>

                    <th
                        style='
                            padding:12px;
                            text-align:right;
                        '
                    >
                        Precio
                    </th>

                </tr>

            </thead>

            <tbody>
";

    if (
        $serviciosIncluidos &&
        $serviciosIncluidos->count() > 0
    ) {

        foreach (
            $serviciosIncluidos as $index => $servicio
        ) {

            $bg = $index % 2 === 0
                ? '#ffffff'
                : '#f5f5f5';

            $desc = $esc(
                $servicio->descripcion ?? ''
            );

            $precio = (float) (
                $servicio->precio ?? 0
            );

            $precioFormatted = number_format(
                $precio,
                2,
                ',',
                '.'
            );

            $htmlPdf .= "
                <tr
                    style='
                        background-color:{$bg};
                    '
                >

                    <td
                        style='
                            padding:15px 12px;
                            border-bottom:
                            1px solid rgba(0,0,0,0.15);
                        '
                    >
                        {$desc}
                    </td>

                    <td
                        style='
                            padding:15px 12px;
                            text-align:right;
                            border-bottom:
                            1px solid rgba(0,0,0,0.15);
                        '
                    >
                        {$precioFormatted} €
                    </td>

                </tr>
";
        }

    } else {

        $htmlPdf .= "
                <tr>

                    <td
                        colspan='2'
                        style='
                            padding:15px 12px;
                            text-align:center;
                            color:#888;
                        '
                    >
                        No hay servicios adicionales incluidos.
                    </td>

                </tr>
";
    }

    $htmlPdf .= "
            </tbody>

        </table>

    </div>


    <!-- =====================================================
         NOTAS
    ====================================================== -->
";

    if (!empty(trim($notas))) {

        $notasPdf = nl2br(
            htmlspecialchars(
                $notas,
                ENT_QUOTES,
                'UTF-8'
            )
        );

        $htmlPdf .= "
    <h5
        style='
            color:#000000;
            font-size:13px;
            font-weight:bold;
            margin-top:10px;
            margin-bottom:15px;
            line-height:1.5;
        '
    >

        Notas:<br>

        <span style='font-weight:normal;'>
            {$notasPdf}
        </span>

    </h5>
";
    }


    // =========================================================
    // GASTOS DE GESTIÓN
    // =========================================================

    $htmlPdf .= "
    <h5
        style='
            color:#000000;
            font-size:13px;
            font-weight:bold;
            margin-bottom:15px;
        '
    >
        Gastos de gestión incluidos.
    </h5>


    <!-- =====================================================
         EXPERIENCIA
    ====================================================== -->

    <h3
        style='
            color:#000000;
            font-size:16px;
            font-weight:bold;
            margin-bottom:15px;
        '
    >
        Experiencia
    </h3>

    <div style='margin-bottom:30px;'>

        <table>

            <thead>

                <tr
                    style='
                        background-color:#000000;
                        color:#ffffff;
                    '
                >

                    <th
                        style='
                            padding:12px;
                            text-align:left;
                        '
                    >
                        Destino y fecha
                    </th>

                    <th
                        style='
                            padding:12px;
                            text-align:center;
                        '
                    >
                        Nº de viajeros
                    </th>

                    <th
                        style='
                            padding:12px;
                            text-align:right;
                        '
                    >
";

    $htmlPdf .= $tipoPago === 'parcial'
        ? 'Importe Total'
        : 'Importe';

    $htmlPdf .= "
                    </th>

                </tr>

            </thead>

            <tbody>

                <tr
                    style='
                        background-color:#f5f5f5;
                    '
                >

                    <td
                        style='
                            padding:15px 12px;
                            border-bottom:
                            1px solid rgba(0,0,0,0.15);
                        '
                    >

                        <strong>
                            {$nombrePaquete}
                        </strong>

                        <br>

                        <span
                            style='
                                font-size:11px;
                                color:#000000;
                            '
                        >
                            Del {$fechaInicio}
                            al {$fechaFin}
                        </span>

                    </td>

                    <td
                        style='
                            padding:15px 12px;
                            text-align:center;
                            border-bottom:
                            1px solid rgba(0,0,0,0.15);
                        '
                    >
                        {$plazas}
";

    $htmlPdf .= $plazas == 1
        ? ' persona'
        : ' personas';

    $htmlPdf .= "
                    </td>

                    <td
                        style='
                            padding:15px 12px;
                            text-align:right;
                            border-bottom:
                            1px solid rgba(0,0,0,0.15);
                        '
                    >
                        <strong>
                            {$subtotal} €
                        </strong>
                    </td>

                </tr>

            </tbody>

        </table>

    </div>


    <!-- =====================================================
         TOTALES
    ====================================================== -->

    <div
        style='
            width:100%;
            margin-top:20px;
        '
    >

        <div
            style='
                width:300px;
                float:right;
            '
        >

            <div
                style='
                    background-color:#f5f5f5;
                    padding:20px;
                    border-radius:10px;
                    border:2px solid #000000;
                '
            >

                <div
                    style='
                        margin-bottom:10px;
                        font-size:13px;
                    '
                >

                    <span>
                        Subtotal:
                    </span>

                    <span style='float:right;'>
                        {$baseImponibleFormatted} €
                    </span>

                </div>


                <div
                    style='
                        margin-bottom:15px;
                        font-size:13px;
                        padding-bottom:15px;
                        border-bottom:
                        2px solid rgba(0,0,0,0.3);
                    '
                >

                    <span>
                        IVA (21%):
                    </span>

                    <span style='float:right;'>
                        {$ivaFormatted} €
                    </span>

                </div>


                <div
                    style='
                        font-size:15px;
                        font-weight:bold;
                    '
                >

                    <span>
                        TOTAL:
                    </span>

                    <span style='float:right;'>
                        {$totalPrecioFormatted} €
                    </span>

                </div>

                <div style='clear:both;'></div>

            </div>

        </div>

        <div style='clear:both;'></div>

    </div>


    <!-- =====================================================
         FOOTER
    ====================================================== -->

    <div
        style='
            margin-top:40px;
            padding-top:20px;
            border-top:2px solid #000000;
            font-size:11px;
            color:#000000;
            text-align:center;
        '
    >

        <p style='margin:0 0 5px 0;'>
            <strong>
                Gracias por confiar en Atalanta
            </strong>
        </p>

        <p style='margin:0; opacity:0.8;'>
            Esta factura ha sido generada electrónicamente
            y es válida sin firma ni sello.
        </p>

        <p style='margin:5px 0 0 0; opacity:0.8;'>
            Para cualquier consulta, contacte con nosotros
            en info@viajesatalanta.com
            o llame al +34 614 892 722
        </p>

    </div>

</div>

</body>
</html>
";

    // =========================================================
    // GENERAR PDF
    // =========================================================

    $pdf = PDF::loadHTML($htmlPdf)
        ->setPaper('A4');

    return $pdf->download(
        "factura_reserva_{$reservaId}.pdf"
    );
}
}
