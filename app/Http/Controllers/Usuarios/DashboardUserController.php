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
            // Leer token desde cookie HttpOnly
            $token = $request->cookie('access_token');
            if (!$token) {
                return response()->json(['error' => 'Token no proporcionado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            // Buscar cliente por usuario_id
            $cliente = Cliente::where('usuario_id', $user->id)->first();
            if (!$cliente) {
                return response()->json(['error' => 'Cliente no encontrado'], 404);
            }

            // Obtener reservas con el paquete turístico y el cliente
            $reservas = $cliente->reservas()->with(['paquete', 'cliente'])->get();

            $resultado = $reservas->map(function ($reserva) {
                $fechaReserva = $reserva->fecha_reserva instanceof \Carbon\Carbon ? $reserva->fecha_reserva->format('Y-m-d') : null;
                $fechaInicio = $reserva->paquete && $reserva->paquete->fecha_inicio instanceof \Carbon\Carbon ? $reserva->paquete->fecha_inicio->format('Y-m-d') : null;
                $fechaFin = $reserva->paquete && $reserva->paquete->fecha_fin instanceof \Carbon\Carbon ? $reserva->paquete->fecha_fin->format('Y-m-d') : null;

                $clienteNombreCompleto = $reserva->cliente ? $reserva->cliente->nombre . ' ' . $reserva->cliente->apellidos : null;

                return [
                    'reserva_id' => $reserva->id,
                    'numero_reserva' => $reserva->reservation_token ?? null,
                    'experiencia' => $reserva->paquete?->nombre,
                    'clienteNombreCompleto' => $clienteNombreCompleto,
                    'fecha_reserva' => $fechaReserva,
                    'fecha_inicio' => $fechaInicio,
                    'fecha_fin' => $fechaFin,
                    'tipo_pago' => $reserva->metodo_pago,
                    'num_cuotas' => $reserva->num_cuotas ?? null,
                    'importe_cuotas' => $reserva->importe_cuotas ?? null,
                    'total_precio' => $reserva->total_precio,
                    'num_personas' => $reserva->num_personas,
                    'estado' => $reserva->estado,
                ];
            });

            return response()->json($resultado);
        } catch (\Exception $e) {
            Log::error('Error en listarReservasUsuario: ' . $e->getMessage());
            return response()->json(['error' => 'Error interno: ' . $e->getMessage()], 500);
        }
    }
    public function mostrarNombrePorLog(Request $request, $reservaId)
{
    try {
        // Leer token desde cookie HttpOnly
        $token = $request->cookie('access_token');
        if (!$token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        $user = JWTAuth::setToken($token)->authenticate();
    } catch (\Exception $e) {
        Log::error('Token inválido o usuario no autenticado: ' . $e->getMessage());
        return response()->json(['error' => 'Token inválido o usuario no autenticado'], 401);
    }

    $cliente = Cliente::where('usuario_id', $user->id)->first();
    if (!$cliente) {
        Log::error('Cliente no encontrado para usuario ID: ' . $user->id);
        return response()->json(['error' => 'Cliente no encontrado'], 404);
    }

    // Cargar reserva con paquete, participantes, servicios del paquete y servicios personalizados
    $reserva = Reserva::with([
        'paquete.incluye',
        'participantes',
        'incluye_personalizados',
    ])->find($reservaId);

    if (!$reserva) {
        Log::error("Reserva no encontrada con ID: {$reservaId}");
        return response()->json(['error' => 'Reserva no encontrada'], 404);
    }

    $paquete = $reserva->paquete;
    $esPersonalizado = (int) ($reserva->paquete_id ?? 0) === 0;

    $nombrePaquete = $esPersonalizado
        ? ($reserva->destino ?? 'Destino personalizado')
        : ($paquete->nombre ?? ($reserva->destino ?? 'Experiencia'));

    /*
    |--------------------------------------------------------------------------
    | FECHAS
    |--------------------------------------------------------------------------
    */
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

    $fechaReservaCarbon = $extraerFecha($reserva->fecha_reserva);
    $fechaInicioCarbon  = $extraerFecha($paquete->fecha_inicio ?? $reserva->fecha_inicio ?? null);
    $fechaFinCarbon     = $extraerFecha($paquete->fecha_fin ?? $reserva->fecha_fin ?? null);

    $fechaReservaFormatted = $fechaReservaCarbon ? $fechaReservaCarbon->format('d/m/Y') : 'No disponible';
    $fechaInicio           = $fechaInicioCarbon ? $fechaInicioCarbon->format('d-m-Y') : null;
    $fechaFin              = $fechaFinCarbon ? $fechaFinCarbon->format('d-m-Y') : null;
    $fechaInicioFormatted  = $fechaInicioCarbon ? $fechaInicioCarbon->format('d/m/Y') : 'No disponible';
    $fechaFinFormatted     = $fechaFinCarbon ? $fechaFinCarbon->format('d/m/Y') : 'No disponible';

    /*
    |--------------------------------------------------------------------------
    | DATOS ECONÓMICOS
    |--------------------------------------------------------------------------
    */
    $tipoPago = strtolower((string) ($reserva->metodo_pago ?? ''));
    $plazas   = (int) ($reserva->num_personas ?? 0);

    $totalPrecioFloat = (float) ($reserva->total_precio ?? 0);
    $baseImponible    = $totalPrecioFloat > 0 ? $totalPrecioFloat / 1.21 : 0;
    $iva              = $totalPrecioFloat - $baseImponible;

    $baseImponibleFormatted = number_format($baseImponible, 2, ',', '.');
    $ivaFormatted           = number_format($iva, 2, ',', '.');
    $totalPrecioFormatted   = number_format($totalPrecioFloat, 2, ',', '.');
    $subtotal               = number_format($totalPrecioFloat, 2, ',', '.');

    $importeAlojamiento = (float) ($reserva->importe_alojamiento ?? 0);
    $impuestoMunicipal  = (float) ($reserva->impuesto_municipal ?? 0);

    /*
    |--------------------------------------------------------------------------
    | PARTICIPANTES (relación real)
    |--------------------------------------------------------------------------
    */
    $participantes = $reserva->participantes; // Collection de modelos Participante

    /*
    |--------------------------------------------------------------------------
    | SERVICIOS INCLUIDOS (paquete->incluye o incluye_personalizada)
    |--------------------------------------------------------------------------
    */
    $serviciosIncluidos = $esPersonalizado
        ? $reserva->incluye_personalizados
        : ($paquete->incluye ?? collect());

    /*
    |--------------------------------------------------------------------------
    | LOGO
    |--------------------------------------------------------------------------
    */
    $logoPath = public_path('images/logo_factura_negro.png');
    if (file_exists($logoPath)) {
        $logoBase64 = base64_encode(file_get_contents($logoPath));
        $logoSrc = 'data:image/png;base64,' . $logoBase64;
    } else {
        $logoSrc = 'data:image/png;base64,' .
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMB/eeFmjAAAAAASUVORK5CYII=';
    }

    /*
    |--------------------------------------------------------------------------
    | HTML PDF (mismo diseño que ReservaConfirmacionMail)
    |--------------------------------------------------------------------------
    */
    $htmlPdf = "
<html>
<head>
<style>
@page { margin:10mm 20mm 10mm 10mm; }
body { font-family:'DejaVu Sans', Arial, sans-serif; color:#333; margin:0; padding:0; }
h1, h2, h3 { margin:0; padding:0; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th, td { padding:12px; }
th { background:#000000; color:#fff; }
</style>
</head>
<body>
<div style='padding:30px;'>

    <table width='100%' style='border-bottom:4px solid #000000; margin-bottom:20px; padding-bottom:10px;'>
        <tr>
            <td style='width:30%; vertical-align:middle;'>
                <img src='{$logoSrc}' alt='Logo Empresa' style='height:100px; border-radius:6px;'>
            </td>
            <td style='width:70%; vertical-align:middle; text-align:right;'>
                <div style='font-size:11px; color:#000000; text-align:right;'>
                    <strong>Fecha de emisión:</strong><br>" . date('d/m/Y') . "
                </div>
            </td>
        </tr>
    </table>

    <div style='display:table; width:100%; margin-bottom:50px;'>
        <div style='display:table-cell; width:50%; vertical-align:top; text-align:left;'>
            <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'>
                <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del emisor</h3>
                <div style='font-size:13px; line-height:1.3;'>
                    <p style='margin:0 0 4px 0;'><strong>Atalanta</strong></p>
                    <p style='margin:0 0 3px 0;'>Dirección: Villanueva de los Castillejos, Huelva, España</p>
                    <p style='margin:0 0 3px 0;'>Tel: +34 614 892 722</p>
                    <p style='margin:0 0 3px 0;'>Email: info@viajesatalanta.com</p>
                    <p style='margin:0 0 6px 0;'>Web: www.viajesatalanta.com</p>
                </div>
            </div>
        </div>
        <div style='display:table-cell; width:50%; vertical-align:top; text-align:right;'>
            <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000; display:inline-block; text-align:left;'>
                <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del cliente</h3>
                <div style='font-size:13px; line-height:1.3;'>
                    <p><strong>Nombre: {$cliente->nombre} {$cliente->apellidos}</strong></p>
                    <p style='margin:0 0 3px 0;'>DNI: {$cliente->dni}</p>
                    <p style='margin:0 0 3px 0;'>Dirección: {$cliente->direccion}</p>
                    <p style='margin:0 0 3px 0;'>Tel: {$cliente->telefono}</p>
                    <p style='margin:0 0 3px 0;'>Email: {$cliente->email}</p>
                </div>
            </div>
        </div>
    </div>

    <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; margin-bottom:30px; border:1px solid rgba(138,119,90,0.2);'>
        <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Detalles de la experiencia</h3>
        <table>
            <tr>
                <td style='width:50%; padding:5px 10px; vertical-align:top;'>
                    <strong>Experiencia:</strong><br>
                    <span style='font-size:12px;'><strong>{$nombrePaquete}</strong></span><br><br>
                    <strong>Fecha de reserva:</strong><br>{$fechaReservaFormatted}<br><br>
                    <strong>Fecha de entrada:</strong><br>{$fechaInicioFormatted}
                </td>
                <td style='width:50%; padding:5px 10px; vertical-align:top;'>
                    <strong>Fecha de salida:</strong><br>{$fechaFinFormatted}<br><br>
                    <strong>Número de viajeros:</strong><br>{$plazas}" . ($plazas == 1 ? ' persona' : ' personas') . "
                </td>
            </tr>
        </table>
    </div>

    <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Viajeros</h3>
    <div style='margin-bottom:30px;'>
        <table>
            <thead>
                <tr style='background-color:#000000; color:#ffffff;'>
                    <th style='padding:12px; text-align:left;'>Nombre</th>
                    <th style='padding:12px; text-align:left;'>Apellidos</th>
                    <th style='padding:12px; text-align:center;'>DNI</th>
                    <th style='padding:12px; text-align:left;'>Email</th>
                </tr>
            </thead>
            <tbody>";
                if ($participantes && $participantes->count() > 0) {
                    foreach ($participantes as $p) {
                        $nombreP    = $p->nombre ?? 'Nombre no disponible';
                        $apellidosP = $p->apellidos ?? '';
                        $dni        = $p->dni ?? 'N/A';
                        $emailP     = $p->email ?? 'Email no disponible';
                        $htmlPdf .= "
                <tr style='background-color:#f5f5f5;'>
                    <td style='padding:12px; border-bottom:1px solid rgba(0,0,0,0.15);'>{$nombreP}</td>
                    <td style='padding:12px; border-bottom:1px solid rgba(0,0,0,0.15);'>{$apellidosP}</td>
                    <td style='padding:12px; text-align:center; border-bottom:1px solid rgba(0,0,0,0.15);'>{$dni}</td>
                    <td style='padding:12px; border-bottom:1px solid rgba(0,0,0,0.15);'>{$emailP}</td>
                </tr>";
                    }
                } else {
                    $htmlPdf .= "
                <tr>
                    <td colspan='4' style='padding:15px 12px; text-align:center; color:#888;'>No hay viajeros registrados.</td>
                </tr>";
                }
    $htmlPdf .= "
            </tbody>
        </table>
    </div>

    <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Servicios incluidos</h3>
    <div style='margin-bottom:30px;'>
        <table>
            <thead>
                <tr style='background-color:#000000; color:#ffffff;'>
                    <th style='padding:12px; text-align:left;'>Descripción</th>
                    <th style='padding:12px; text-align:right;'>Precio</th>
                </tr>
            </thead>
            <tbody>";
                if ($serviciosIncluidos && $serviciosIncluidos->count() > 0) {
                    foreach ($serviciosIncluidos as $index => $servicio) {
                        $bg     = $index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                        $desc   = $servicio->descripcion ?? '';
                        $precio = $servicio->precio ?? 0;
                        $htmlPdf .= "
                <tr style='background-color:{$bg};'>
                    <td style='padding:15px 12px; border-bottom:1px solid rgba(0,0,0,0.15);'>{$desc}</td>
                    <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(0,0,0,0.15);'>" . number_format((float) $precio, 2, ',', '.') . " €</td>
                </tr>";
                    }
                } else {
                    $htmlPdf .= "
                <tr>
                    <td colspan='2' style='padding:15px 12px; text-align:center; color:#888;'>No hay servicios adicionales incluidos.</td>
                </tr>";
                }
    $htmlPdf .= "
            </tbody>
        </table>
    </div>

    <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>Gastos de gestión incluidos.</h5>
    <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>Importe a pagar en el alojamiento: " . number_format($importeAlojamiento, 2, ',', '.') . " €</h5>
    <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>Impuesto municipal: " . number_format($impuestoMunicipal, 2, ',', '.') . " €</h5>

    <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Experiencia</h3>
    <div style='margin-bottom:30px;'>
        <table>
            <thead>
                <tr style='background-color:#000000; color:#ffffff;'>
                    <th style='padding:12px; text-align:left;'>Destino y fecha</th>
                    <th style='padding:12px; text-align:center;'>Nº de viajeros</th>
                    <th style='padding:12px; text-align:right;'>" . ($tipoPago === 'parcial' ? 'Importe Total' : 'Importe') . "</th>
                </tr>
            </thead>
            <tbody>
                <tr style='background-color:#f5f5f5;'>
                    <td style='padding:15px 12px; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        <strong>{$nombrePaquete}</strong><br>
                        <span style='font-size:11px; color:#000000;'>Del {$fechaInicio} al {$fechaFin}</span>
                    </td>
                    <td style='padding:15px 12px; text-align:center; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        {$plazas}" . ($plazas == 1 ? ' persona' : ' personas') . "
                    </td>
                    <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        <strong>{$subtotal} €</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div style='width:100%; margin-top:20px;'>
        <div style='width:300px; float:right;'>
            <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'>
                <div style='display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;'>
                    <span>Subtotal:</span><span>{$baseImponibleFormatted} €</span>
                </div>
                <div style='display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px; padding-bottom:15px; border-bottom:2px solid rgba(0,0,0,0.3);'>
                    <span>IVA (21%):</span><span>{$ivaFormatted} €</span>
                </div>
                <div style='display:flex; justify-content:space-between; font-size:15px; font-weight:bold;'>
                    <span>TOTAL:</span><span>{$totalPrecioFormatted} €</span>
                </div>
            </div>
        </div>
        <div style='clear:both;'></div>
    </div>

    <div style='margin-top:40px; padding-top:20px; border-top:2px solid #000000; font-size:11px; color:#000000; text-align:center;'>
        <p style='margin:0 0 5px 0;'><strong>Gracias por confiar en Atalanta</strong></p>
        <p style='margin:0; opacity:0.8;'>Esta factura ha sido generada electrónicamente y es válida sin firma ni sello.</p>
        <p style='margin:5px 0 0 0; opacity:0.8;'>Para cualquier consulta, contacte con nosotros en info@viajesatalanta.com o llame al +34 614 892 722</p>
    </div>

</div>
</body>
</html>";

    $pdf = PDF::loadHTML($htmlPdf)->setPaper('A4');

    return $pdf->download("factura_reserva_{$reservaId}.pdf");
}
}
