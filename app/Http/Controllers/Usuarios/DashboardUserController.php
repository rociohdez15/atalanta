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

    $reserva = Reserva::with('paquete')->find($reservaId);
    if (!$reserva) {
        Log::error("Reserva no encontrada con ID: {$reservaId}");
        return response()->json(['error' => 'Reserva no encontrada'], 404);
    }

    $nombrePaquete = $reserva->paquete ? $reserva->paquete->nombre : 'Paquete no asociado';

    // Fechas formateadas
    $fechaReservaFormatted = $reserva->fecha_reserva ? date('d/m/Y', strtotime($reserva->fecha_reserva)) : 'No disponible';
    $fechaInicioFormatted = $reserva->paquete && $reserva->paquete->fecha_inicio ? date('d/m/Y', strtotime($reserva->paquete->fecha_inicio)) : null;
    $fechaFinFormatted = $reserva->paquete && $reserva->paquete->fecha_fin ? date('d/m/Y', strtotime($reserva->paquete->fecha_fin)) : null;

    $tipoPago = $reserva->metodo_pago ?? 'No disponible';
    $numCuotas = $reserva->num_cuotas ?? 'N/A';
    $importeCuotas = $reserva->importe_cuotas ?? 'N/A';
    $plazas = $reserva->num_personas ?? 'N/A';

    $ivaRate = 0.21;
    $precioTotal = $reserva->total_precio ?? 0;
    if ($precioTotal > 0) {
        $baseImponible = round($precioTotal / (1 + $ivaRate), 2);
        $iva = round($precioTotal - $baseImponible, 2);
    } else {
        $baseImponible = 0;
        $iva = 0;
    }

    $baseImponibleFormatted = number_format($baseImponible, 2, ',', '.');
    $ivaFormatted = number_format($iva, 2, ',', '.');
    $totalPrecio = number_format($precioTotal, 2, ',', '.');

    $participantes = $reserva->participantes ?? [];

    $precioUnitario = $precioTotal; // Para la tabla de conceptos
    $subtotal = $precioTotal;

    $logoPath = public_path('images/logo-factura.png'); // ruta absoluta al logo
    $logoBase64 = base64_encode(file_get_contents($logoPath));
    $logoSrc = 'data:image/png;base64,' . $logoBase64;

    $htmlPdf = "
<html>
<head>
    <style>
    @page { margin: 10mm 20mm 10mm 10mm; }
    body { font-family: 'DejaVu Sans', Arial, sans-serif; color: #333; margin:0; padding:0; }
    h1, h2, h3 { margin:0; padding:0; }
    ul.participantes { list-style:none; padding-left:0; font-size:14px; }
    ul.participantes li { padding:5px 0; border-bottom:1px solid #eee; }
    </style>
</head>
<body>
    <div style='width:100%; padding:30px;'>

        <!-- Header -->
        <table width='100%' style='border-bottom:4px solid #8a775a; margin-bottom:20px; padding-bottom:10px;'>
            <tr>
                <td style='width:30%; vertical-align:middle;'><img src='{$logoSrc}' alt='Logo Empresa' style='height:60px; border-radius:6px;'></td>
                <td style='width:70%; vertical-align:middle; text-align:right;'>
                    <div style='background-color:#8a775a; color:#fff; padding:5px 15px; border-radius:6px; display:inline-block; margin-bottom:10px;'>
                        <div style='font-size:10px; opacity:0.9;'>FACTURA Nº</div>
                        <div style='font-size:18px; font-weight:bold;'>{$reservaId}</div>
                    </div>
                    <div style='font-size:11px; color:#8a775a; text-align:right;'><strong>Fecha de emisión:</strong><br>" . date('d/m/Y') . "</div>
                </td>
            </tr>
        </table>

        <!-- Datos emisor y cliente -->
        <div style='display:table; width:100%; margin-bottom:50px; border-spacing:0px 0;'>
            <div style='display:table-cell; width:50%; vertical-align:top; text-align:left;'>
                <div style='background-color:#fcf4ef; padding:20px; border-radius:10px; border:2px solid #8a775a;'>
                    <h3 style='color:#8a775a; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del emisor</h3>
                    <div style='font-size:13px; line-height:1.3;'>
                        <p style='margin:0 0 4px 0;'><strong style='color:#8a775a;'>Atalanta</strong></p>
                        <p style='margin:0 0 3px 0;'>Dirección: Villanueva de los Castillejos, Huelva, España</p>
                        <p style='margin:0 0 3px 0;'>Tel: +34 659 633 676</p>
                        <p style='margin:0 0 3px 0;'>Email: info@viajesatalanta.com</p>
                        <p style='margin:0 0 6px 0;'>Web: www.viajesatalanta.com</p>
                        <div style='padding-top:6px; border-top:1px solid rgba(138,119,90,0.2);'>
                            <p style='margin:0 0 2px 0;'><strong>CIF:</strong> B-12345678</p>
                            <p style='margin:0;'><strong>Registro Mercantil:</strong> Madrid, Tomo 1234, Folio 56</p>
                        </div>
                    </div>
                </div>
            </div>
            <div style='display:table-cell; width:50%; vertical-align:top; text-align:right;'>
                <div style='background-color:#fcf4ef; padding:20px; border-radius:10px; border:2px solid #c16e44; display:inline-block; text-align:left;'>
                    <h3 style='color:#c16e44; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del cliente</h3>
                    <div style='font-size:13px; line-height:1.3;'>
                        <p style='margin:0 0 4px 0;'><strong style='color:#8a775a;'>{$cliente->nombre} {$cliente->apellidos}</strong></p>
                        <p style='margin:0 0 3px 0;'>DNI: {$cliente->dni}</p>
                        <p style='margin:0 0 3px 0;'>Dirección: {$cliente->direccion}</p>
                        <p style='margin:0 0 3px 0;'>Tel: {$cliente->telefono}</p>
                        <p style='margin:0;'>Email: {$cliente->email}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detalles de la Experiencia -->
        <div style='background-color:#f8f5f1; padding:20px; border-radius:10px; margin-bottom:30px; border:1px solid rgba(138,119,90,0.2);'>
            <h3 style='color:#8a775a; font-size:16px; font-weight:bold; margin-bottom:15px;'>Detalles de la experiencia</h3>
            <table style='width:100%; border-collapse:collapse; font-size:13px;'>
                <tr>
                    <td style='width:50%; padding:5px 10px; vertical-align:top;'>
                        <strong style='color:#8a775a'>Experiencia:</strong><br>
                        <span style='font-size:12px;'><strong>{$nombrePaquete}</strong></span><br><br>
                        <strong style='color:#8a775a'>Fecha de reserva:</strong><br>
                        {$fechaReservaFormatted}<br><br>
                        <strong style='color:#8a775a'>Fecha de inicio:</strong><br>
                        {$fechaInicioFormatted}
                    </td>
                    <td style='width:50%; padding:5px 10px; vertical-align:top;'>
                        <strong style='color:#8a775a'>Fecha de fin:</strong><br>
                        {$fechaFinFormatted}<br><br>
                        <strong style='color:#8a775a'>Tipo de pago:</strong><br>
                        <span style='background-color:" . (strtolower($tipoPago) === 'total' ? '#4cc33fff' : '#e89b0cff') . "; color:#8a775a; padding:3px 12px; border-radius:20px; font-size:12px; display:inline-block;'>" . strtoupper($tipoPago) . "</span><br><br>
                        <strong style='color:#8a775a'>Número de viajeros:</strong><br>
                        {$plazas}" . ($plazas == 1 ? ' persona' : ' personas') . "
                    </td>
                </tr>
            </table>
        </div>

        <!-- Viajeros (debajo de Detalles de la Experiencia) -->
        <h3 style='color:#8a775a; font-size:16px; font-weight:bold; margin-bottom:15px;'>Viajeros</h3>
        <div style='margin-bottom:30px;'>
            <table style='width:100%; border-collapse:collapse; font-size:13px;'>
                <thead>
                    <tr style='background-color:#8a775a; color:#ffffff;'>
                        <th style='padding:12px; text-align:left; border-radius:8px 0 0 0;'>Nombre</th>
                        <th style='padding:12px; text-align:left;'>Apellidos</th>
                        <th style='padding:12px; text-align:center;'>DNI</th>
                        <th style='padding:12px; text-align:left; border-radius:0 8px 0 0;'>Email</th>
                    </tr>
                </thead>
                <tbody>";
                foreach ($participantes as $p) {
                    $dni = $p['dni'] ?? 'N/A';
                    $nombreP = $p['nombre'] ?? 'Nombre no disponible';
                    $apellidosP = $p['apellidos'] ?? '';
                    $emailP = $p['email'] ?? 'Email no disponible';
                    $htmlPdf .= "
                    <tr style='background-color:#fcf4ef;'>
                        <td style='padding:12px; border-bottom:1px solid rgba(138,119,90,0.2);'>{$nombreP}</td>
                        <td style='padding:12px; border-bottom:1px solid rgba(138,119,90,0.2);'>{$apellidosP}</td>
                        <td style='padding:12px; text-align:center; border-bottom:1px solid rgba(138,119,90,0.2);'>{$dni}</td>
                        <td style='padding:12px; border-bottom:1px solid rgba(138,119,90,0.2);'>{$emailP}</td>
                    </tr>";
                }
$htmlPdf .= "
                </tbody>
            </table>
        </div>

        <!-- Tabla de conceptos -->
        <div style='margin-bottom:30px;'>
            <table style='width:100%; border-collapse:collapse; font-size:13px;'>
                <thead>
                    <tr style='background-color:#8a775a; color:#ffffff;'>
                        <th style='padding:12px; text-align:left; border-radius:8px 0 0 0;'>Experiencia</th>
                        <th style='padding:12px; text-align:center;'>Nº de viajeros</th>
                        <th style='padding:12px; text-align:center;'>" . (strtolower($tipoPago) === 'parcial' ? 'Nº de Cuotas' : 'Cantidad') . "</th>
                        <th style='padding:12px; text-align:right;'>" . (strtolower($tipoPago) === 'parcial' ? 'Importe por Cuota' : 'Precio Unit.') . "</th>
                        <th style='padding:12px; text-align:right; border-radius:0 8px 0 0;'>" . (strtolower($tipoPago) === 'parcial' ? 'Importe Total' : 'Importe') . "</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style='background-color:#fcf4ef;'>
                        <td style='padding:15px 12px; border-bottom:1px solid rgba(138,119,90,0.2);'>
                            <strong>{$nombrePaquete}</strong><br>
                            <span style='font-size:11px; color:#8a775a;'>Del {$fechaInicioFormatted} al {$fechaFinFormatted}</span>
                        </td>
                        <td style='padding:15px 12px; text-align:center; border-bottom:1px solid rgba(138,119,90,0.2);'>
                            {$plazas}" . ($plazas == 1 ? ' persona' : ' personas') . "
                        </td>
                        <td style='padding:15px 12px; text-align:center; border-bottom:1px solid rgba(138,119,90,0.2);'>
                            " . (strtolower($tipoPago) === 'parcial' ? "{$numCuotas}" : "{$plazas}") . "
                        </td>
                        <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(138,119,90,0.2);'>
                            " . (strtolower($tipoPago) === 'parcial' ? "{$importeCuotas} €" : "{$precioUnitario} €") . "
                        </td>
                        <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(138,119,90,0.2);'>
                            <strong>{$subtotal} €</strong>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Totales -->
        <div style='width:100%; margin-top:20px;'>
            <div style='width:300px; float:right;'>
                <div style='background-color:#fcf4ef; padding:20px; border-radius:10px; border:2px solid #8a775a;'>
                    <div style='display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;'>
                        <span>Subtotal:</span>
                        <span>{$baseImponibleFormatted} €</span>
                    </div>
                    <div style='display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px; padding-bottom:15px; border-bottom:2px solid rgba(138,119,90,0.3);'>
                        <span>IVA (21%):</span>
                        <span>{$ivaFormatted} €</span>
                    </div>
                    <div style='display:flex; justify-content:space-between; font-size:15px; font-weight:bold; color:#8a775a;'>
                        <span>TOTAL:</span>
                        <span>{$totalPrecio} €</span>
                    </div>
                </div>
            </div>
            <div style='clear:both;'></div>
        </div>

        <!-- Información de pago -->
        <div style='margin-top:30px; background-color:#f8f5f1; padding:15px 20px; border-radius:8px; border:1px solid rgba(138,119,90,0.2);'>
            <strong style='color:#8a775a; font-size:14px;'>Información de Pago</strong>
            <p style='margin:0; font-size:12px; line-height:1.6;'><strong>Método de pago:</strong> {$tipoPago}<br><strong>Estado:</strong> <span>PAGADO</span></p>
        </div>

        <!-- Footer -->
        <div style='margin-top:40px; padding-top:20px; border-top:2px solid #8a775a; font-size:11px; color:#8a775a; text-align:center;'>
            <p style='margin:0 0 5px 0;'><strong>Gracias por confiar en Atalanta</strong></p>
            <p style='margin:0; opacity:0.8;'>Esta factura ha sido generada electrónicamente y es válida sin firma ni sello.</p>
            <p style='margin:5px 0 0 0; opacity:0.8;'>Para cualquier consulta, contacte con nosotros en info@viajesatalanta.com o llame al +34 912 345 678</p>
        </div>

    </div>
</body>
</html>";

    $pdf = PDF::loadHTML($htmlPdf)->setPaper('A4');
    

    // Descargar PDF
    return $pdf->download("factura_reserva_{$reservaId}.pdf");
}

}
