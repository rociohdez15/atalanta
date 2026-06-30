<?php

namespace App\Http\Controllers\Facturas;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\Factura;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\DB;




class FacturasController extends Controller
{
    // Obtener todos los clientes
    public function obtenerClientes()
    {
        return response()->json(Cliente::all());
    }

    // Buscar clientes por término en nombre, apellidos o dni
    public function buscarClientes(Request $request)
    {
        $input = $request->query('input', '');

        if (!$input) {
            return response()->json(Cliente::all());
        }

        $clientes = Cliente::where('nombre', 'like', "%$input%")
            ->orWhere('apellidos', 'like', "%$input%")
            ->orWhere('dni', 'like', "%$input%")
            ->orWhere('id', $input)           // busca coincidencia exacta en id
            ->orWhere('usuario_id', $input)   // busca coincidencia exacta en usuario_id
            ->get();

        return response()->json($clientes);
    }


    // Eliminar cliente por id
    public function eliminarCliente($id)
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        $cliente->delete();

        return response()->json(['message' => 'Cliente eliminado']);
    }

    public function reservasPorCliente($clienteId)
    {
        Log::info('reservasPorCliente llamado con clienteId:', ['clienteId' => $clienteId]);

        $reservas = Reserva::where('cliente_id', $clienteId)->get();

        Log::info('Reservas encontradas:', ['count' => $reservas->count(), 'reservas' => $reservas]);

        return response()->json($reservas);
    }


    public function generarFacturaAdmin(Request $request, $reservaId, $clienteId)
    {
        // 🔐 Validar cookie y autenticar usuario
        $token = $request->cookie('access_token');
        if (!$token) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        try {
            $user = JWTAuth::setToken($token)->authenticate();
        } catch (\Exception $e) {
            Log::error('Token inválido o usuario no autenticado: ' . $e->getMessage());
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        // 🚫 Validar rol: solo ADMIN o usuario dueño de la reserva
        if ($user->rol !== 'ADMIN' && $user->id !== (int)$clienteId) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Buscar reserva y cliente
        $reserva = Reserva::with('paquete')->find($reservaId);
        $cliente = Cliente::find($clienteId);

        if (!$reserva || !$cliente) {
            return response()->json(['error' => 'Reserva o cliente no encontrados'], 404);
        }

        // Detectar si es un viaje personalizado
        $esPersonalizado = $reserva->paquete_id == 0;

        // Nombre del viaje

        $nombrePaquete = $esPersonalizado
            ? ($reserva->destino ?: 'Destino personalizado')
            : ($reserva->paquete ? $reserva->paquete->nombre : 'Paquete no asociado');

        // Fecha reserva
        $fechaReservaFormatted = $reserva->fecha_reserva
            ? date('d/m/Y', strtotime($reserva->fecha_reserva))
            : 'No disponible';

        // Fechas inicio y fin
        if ($esPersonalizado) {

            $fechaInicioFormatted = !empty($reserva->fecha_inicio)
                ? date('d/m/Y', strtotime($reserva->fecha_inicio))
                : 'No disponible';

            $fechaFinFormatted = !empty($reserva->fecha_fin)
                ? date('d/m/Y', strtotime($reserva->fecha_fin))
                : 'No disponible';
        } else {

            $fechaInicioFormatted = $reserva->paquete && $reserva->paquete->fecha_inicio
                ? date('d/m/Y', strtotime($reserva->paquete->fecha_inicio))
                : 'No disponible';

            $fechaFinFormatted = $reserva->paquete && $reserva->paquete->fecha_fin
                ? date('d/m/Y', strtotime($reserva->paquete->fecha_fin))
                : 'No disponible';
        }

        // 🧩 SERVICIOS INCLUIDOS
        if ($esPersonalizado) {

            $servicios = DB::table('incluye_personalizados')
                ->where('reserva_id', $reservaId)
                ->get();
        } else {

            $servicios = DB::table('incluye')
                ->where('paquete_id', $reserva->paquete_id)
                ->get()
                ->map(function ($item) {
                    $decoded = json_decode($item->descripcion, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $item->descripcion = $decoded['descripcion'] ?? $item->descripcion;
                        $item->precio = $decoded['precio'] ?? 0;
                    }
                    return $item;
                });
        }

        $tipoPago = $reserva->metodo_pago ?? 'No disponible';
        $numCuotas = $reserva->num_cuotas ?? 'N/A';
        $importeCuotas = $reserva->importe_cuotas ?? 'N/A';
        $plazas = $reserva->num_personas ?? 'N/A';

        $ivaRate = 0.21;
        $precioTotal = $reserva->total_precio ?? 0;
        $baseImponible = $precioTotal > 0 ? round($precioTotal / (1 + $ivaRate), 2) : 0;
        $iva = $precioTotal > 0 ? round($precioTotal - $baseImponible, 2) : 0;

        $baseImponibleFormatted = number_format($baseImponible, 2, ',', '.');
        $ivaFormatted = number_format($iva, 2, ',', '.');
        $totalPrecio = number_format($precioTotal, 2, ',', '.');

        $participantes = $reserva->participantes ?? [];

        // Manejo seguro del logo
        $logoPath = public_path('images/logo_factura_negro.png');
        if (file_exists($logoPath)) {
            $logoBase64 = base64_encode(file_get_contents($logoPath));
            $logoSrc = 'data:image/png;base64,' . $logoBase64;
        } else {
            // Placeholder si no existe
            $logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMB/eeFmjAAAAAASUVORK5CYII=';
        }

        $precioUnitario = $servicios->sum(function ($servicio) {
            return isset($servicio->precio) ? (float) $servicio->precio : 0;
        });
        $subtotal = $precioTotal;

        // HTML del PDF (igual a mostrarNombrePorLog)
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
        <table width='100%' style='border-bottom:4px solid #000000; margin-bottom:20px; padding-bottom:10px;'>
            <tr>
                <td style='width:30%; vertical-align:middle;'><img src='{$logoSrc}' alt='Logo Empresa' style='height:100px; border-radius:6px;'></td>
                <td style='width:70%; vertical-align:middle; text-align:right;'>
                    <div style='background-color:#000000; color:#fff; padding:5px 15px; border-radius:6px; display:inline-block; margin-bottom:10px;'>
                        <div style='font-size:10px; opacity:0.9;'>FACTURA Nº</div>
                        <div style='font-size:18px; font-weight:bold;'>{$reservaId}</div>
                    </div>
                    <div style='font-size:11px; color:#000000; text-align:right;'><strong>Fecha de emisión:</strong><br>" . date('d/m/Y') . "</div>
                </td>
            </tr>
        </table>

        <!-- Datos emisor y cliente -->
        <div style='display:table; width:100%; margin-bottom:50px; border-spacing:0px 0;'>
            <div style='display:table-cell; width:50%; vertical-align:top; text-align:left;'>
                <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'>
                    <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del emisor</h3>
                    <div style='font-size:13px; line-height:1.3;'>
                        <p style='margin:0 0 4px 0;'><strong style='color:#000000;'>Atalanta</strong></p>
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
                        <p style='margin:0 0 4px 0;'><strong style='color:#000000;'>{$cliente->nombre} {$cliente->apellidos}</strong></p>
                        <p style='margin:0 0 3px 0;'>DNI: {$cliente->dni}</p>
                        <p style='margin:0 0 3px 0;'>Dirección: {$cliente->direccion}</p>
                        <p style='margin:0 0 3px 0;'>Tel: {$cliente->telefono}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detalles de la Experiencia -->
        <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; margin-bottom:30px; border:1px solid rgba(138,119,90,0.2);'>
            <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Detalles de la experiencia</h3>
            <table style='width:100%; border-collapse:collapse; font-size:13px;'>
                <tr>
                    <td style='width:50%; padding:5px 10px; vertical-align:top;'>
                        <strong style='color:#000000'>Experiencia:</strong><br>
                        <span style='font-size:12px;'><strong>{$nombrePaquete}</strong></span><br><br>
                        <strong style='color:#000000'>Fecha de reserva:</strong><br>
                        {$fechaReservaFormatted}<br><br>
                        <strong style='color:#000000'>Fecha de entrada:</strong><br>
                        {$fechaInicioFormatted}
                    </td>
                    <td style='width:50%; padding:5px 10px; vertical-align:top;'>
                        <strong style='color:#000000'>Fecha de salida:</strong><br>
                        {$fechaFinFormatted}<br><br>
                        <strong style='color:#000000'>Número de viajeros:</strong><br>
                        {$plazas}" . ($plazas == 1 ? ' persona' : ' personas') . "
                    </td>
                </tr>
            </table>
        </div>

        <!-- Viajeros -->
        <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Viajeros</h3>
        <div style='margin-bottom:30px;'>
            <table style='width:100%; border-collapse:collapse; font-size:13px;'>
                <thead>
                    <tr style='background-color:#000000; color:#ffffff;'>
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
                    <tr style='background-color:#f5f5f5;'>
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

        <!-- Servicios incluidos -->
        <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>
            Servicios incluidos
        </h3>

        <div style='margin-bottom:30px;'>
            <table style='width:100%; border-collapse:collapse; font-size:13px;'>
                <thead>
                    <tr style='background-color:#000000; color:#ffffff;'>
                        <th style='padding:12px; text-align:left;'>
                            Descripción
                        </th>
                        <th style='padding:12px; text-align:right; border-radius:0 8px 8px 0;'>
                            Precio
                        </th>
                    </tr>
                </thead>

                <tbody>
                    " . ($servicios->isEmpty() ? "
                    <tr>
                        <td colspan='2' style='padding:15px 12px; text-align:center; color:#888;'>
                            No hay servicios adicionales incluidos.
                        </td>
                    </tr>
                    " : collect($servicios)->map(function ($servicio, $index) {

            $bg = $index % 2 === 0 ? '#ffffff' : '#f5f5f5';

            return "
                        <tr style='background-color:{$bg};'>
                            <td style='padding:15px 12px; border-bottom:1px solid rgba(138,119,90,0.2);'>
                                {$servicio->descripcion}
                            </td>

                            <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(138,119,90,0.2);'>
                                " . number_format($servicio->precio ?? 0, 2, ',', '.') . " €
                            </td>
                        </tr>";
        })->implode('')) . "
                </tbody>
            </table>
        </div>

        <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>
            Gastos de gestión: 10%
        </h5>
        
        <!-- Tabla de conceptos -->
        <!-- Experiencia -->
        <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Experiencia</h3>
        <div style='margin-bottom:30px;'>
            <table style='width:100%; border-collapse:collapse; font-size:13px;'>
                <thead>
                    <tr style='background-color:#000000; color:#ffffff;'>
                        <th style='padding:12px; text-align:left; border-radius:8px 0 0 0;'>Destino y fecha</th>
                        <th style='padding:12px; text-align:center;'>Nº de viajeros</th>
                        <th style='padding:12px; text-align:right; border-radius:0 8px 0 0;'>" . (strtolower($tipoPago) === 'parcial' ? 'Importe Total' : 'Importe') . "</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style='background-color:#f5f5f5;'>
                        <td style='padding:15px 12px; border-bottom:1px solid rgba(138,119,90,0.2);'>
                            <strong>{$nombrePaquete}</strong><br>
                            <span style='font-size:11px; color:#000000;'>Del {$fechaInicioFormatted} al {$fechaFinFormatted}</span>
                        </td>
                        <td style='padding:15px 12px; text-align:center; border-bottom:1px solid rgba(138,119,90,0.2);'>
                            {$plazas}" . ($plazas == 1 ? ' persona' : ' personas') . "
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
                <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'>
                    <div style='display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;'>
                        <span>Subtotal:</span>
                        <span>{$baseImponibleFormatted} €</span>
                    </div>
                    <div style='display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px; padding-bottom:15px; border-bottom:2px solid rgba(138,119,90,0.3);'>
                        <span>IVA (21%):</span>
                        <span>{$ivaFormatted} €</span>
                    </div>
                    <div style='display:flex; justify-content:space-between; font-size:15px; font-weight:bold; color:#000000;'>
                        <span>TOTAL:</span>
                        <span>{$totalPrecio} €</span>
                    </div>
                </div>
            </div>
            <div style='clear:both;'></div>
        </div>

            <!-- Footer -->
        <div style='margin-top:40px; padding-top:20px; border-top:2px solid #000000; font-size:11px; color:#000000; text-align:center;'>
            <p style='margin:0 0 5px 0;'><strong>Gracias por confiar en Atalanta</strong></p>
            <p style='margin:0; opacity:0.8;'>Esta factura ha sido generada electrónicamente y es válida sin firma ni sello.</p>
            <p style='margin:5px 0 0 0; opacity:0.8;'>Para cualquier consulta, contacte con nosotros en info@viajesatalanta.com o llame al +34 614 892 722</p>
        </div>
        </div>
    </body>
    </html>";

        $pdf = PDF::loadHTML($htmlPdf)->setPaper('A4');

        // Para descargar el PDF directamente:
        return $pdf->download("factura_reserva_{$reservaId}.pdf");

        // Si quieres enviarlo inline para visualizar en navegador:
        // return $pdf->stream("factura_reserva_{$reservaId}.pdf");
    }

    public function index()
    {
        return response()->json(Factura::all());
    }

    public function show($id)
    {
        $factura = Factura::find($id);
        return $factura
            ? response()->json($factura)
            : response()->json(['error' => 'Factura no encontrada'], 404);
    }

    public function buscador(Request $request)
    {
        $input = $request->query('input');

        Log::info('Input recibido en buscador:', ['input' => $input]);

        if (!$input) {
            return response()->json([], 200);
        }

        $resultados = DB::table('facturas')
            ->where('id', 'LIKE', "%{$input}%")
            ->orWhere('nombre_cliente', 'LIKE', "%{$input}%")
            ->orWhere('apellidos_cliente', 'LIKE', "%{$input}%")
            ->orWhere('email_cliente', 'LIKE', "%{$input}%")
            ->orWhere('reserva_id', 'LIKE', "%{$input}%")
            ->get();

        return response()->json($resultados, 200);
    }


    public function destroy($id)
    {
        $factura = Factura::find($id);
        if (!$factura) {
            return response()->json(['error' => 'Factura no encontrada'], 404);
        }

        $factura->delete();
        return response()->json(['mensaje' => 'Factura eliminada']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cliente_id' => 'required|integer',
            'reserva_id' => 'required|integer',
            'nombre_cliente' => 'required|string|max:255',
            'apellidos_cliente' => 'required|string|max:255',
            'email_cliente' => 'required|email|max:255',
            'fecha_compra' => 'required|date',
            'metodo_pago' => 'required|string|max:255',
            'precio_total' => 'required|numeric',
            'iva' => 'required|numeric',
            'telefono_empresa' => 'required|string|max:50',
            'email_empresa' => 'required|email|max:255',
            'detalles' => 'nullable|string',
        ]);

        $factura = Factura::create($data);
        return response()->json($factura, 201);
    }

    public function generarFacturaSimple(Request $request, $facturaId)
    {
        /* ===========================
     * 🔐 AUTENTICACIÓN JWT (COOKIE)
     * =========================== */
        $token = $request->cookie('access_token');
        if (!$token) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        try {
            $user = JWTAuth::setToken($token)->authenticate();
        } catch (\Exception $e) {
            Log::error('Token inválido: ' . $e->getMessage());
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        /* ===========================
     * 📄 OBTENER FACTURA
     * =========================== */
        $factura = DB::table('facturas')->where('id', $facturaId)->first();

        if (!$factura) {
            return response()->json(['error' => 'Factura no encontrada'], 404);
        }

        /* ===========================
     * 🧮 CÁLCULOS
     * =========================== */
        $ivaRate = $factura->iva / 100;
        $precioTotal = $factura->precio_total;

        $baseImponible = round($precioTotal / (1 + $ivaRate), 2);
        $ivaValor = round($precioTotal - $baseImponible, 2);

        $baseFormatted  = number_format($baseImponible, 2, ',', '.');
        $ivaFormatted   = number_format($ivaValor, 2, ',', '.');
        $totalFormatted = number_format($precioTotal, 2, ',', '.');

        $fechaFactura = date('d/m/Y', strtotime($factura->fecha_compra));

        /* ===========================
     * 🖼️ LOGO CORRECTO
     * =========================== */
        $logoPath = public_path('images/logo_factura_negro.png');
        if (file_exists($logoPath)) {
            $logoBase64 = base64_encode(file_get_contents($logoPath));
            $logoSrc = 'data:image/png;base64,' . $logoBase64;
        } else {
            $logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMB/eeFmjAAAAAASUVORK5CYII=';
        }

        /* ===========================
     * 🎨 HTML (DISEÑO ADMIN)
     * =========================== */
        $htmlPdf = "
            <html>
            <head>
            <style>
            @page { margin: 10mm 20mm 10mm 10mm; }
            body { font-family: 'DejaVu Sans', Arial, sans-serif; color: #333; }
            </style>
            </head>
            <body>

            <div style='padding:30px;'>

            <!-- Header -->
            <table width='100%' style='border-bottom:4px solid #000000; margin-bottom:20px;'>
            <tr>
            <td width='50%'><img src='{$logoSrc}' alt='Logo Empresa'
            style='height:80px;
            background:#000;
            padding:10px;
            border-radius:8px;'></td>
            <td width='70%' style='text-align:right'>
            <div style='background:#000000;color:#fff;padding:6px 15px;border-radius:6px;display:inline-block'>
            <div style='font-size:10px'>FACTURA Nº</div>
            <div style='font-size:18px;font-weight:bold'>{$factura->id}</div>
            </div>
            <br>
            <span style='font-size:11px;color:#000000'><strong>Fecha:</strong> {$fechaFactura}</span>
            </td>
            </tr>
            </table>

            <!-- Datos -->
            <div style='display:table;width:100%;margin-bottom:40px'>
            <div style='display:table-cell; width:50%; vertical-align:top; text-align:left;'>
                <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'>
                    <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del emisor</h3>
                    <div style='font-size:13px; line-height:1.3;'>
                        <p style='margin:0 0 4px 0;'><strong style='color:#000000;'>Atalanta</strong></p>
                        <p style='margin:0 0 3px 0;'>Dirección: Villanueva de los Castillejos, Huelva, España</p>
                        <p style='margin:0 0 3px 0;'>Tel: +34 614 892 722</p>
                        <p style='margin:0 0 3px 0;'>Email: info@viajesatalanta.com</p>
                        <p style='margin:0 0 6px 0;'>Web: www.viajesatalanta.com</p>
                    </div>
                </div>
            </div>

            <div style='display:table-cell;width:50%;padding-left:10px'>
            <div style='background:#f5f5f5;padding:20px;border-radius:10px;border:2px solid #000000'>
            <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del cliente</h3>
            <p style='font-size:13px; line-height:1.3;'><strong>{$factura->nombre_cliente} {$factura->apellidos_cliente}</strong><br>
            {$factura->email_cliente}</p>
            </div>
            </div>
            </div>

            <!-- Concepto -->
            <table width='100%' style='border-collapse:collapse;font-size:13px;margin-bottom:30px'>
            <tr style='background:#000000;color:#fff'>
            <th style='padding:12px;text-align:left'>Concepto</th>
            <th style='padding:12px;text-align:right'>Importe</th>
            </tr>
            <tr style='background:#f5f5f5'>
            <td style='padding:12px'>{$factura->detalles}</td>
            <td style='padding:12px;text-align:right'>{$totalFormatted} €</td>
            </tr>
            </table>

            <!-- Totales -->
            <div style='width:300px;float:right'>
            <div style='background:#f5f5f5;padding:20px;border-radius:10px;border:2px solid #000000'>
            <div style='display:flex;justify-content:space-between'>
            <span style='font-size:13px; line-height:1.3;'>Base imponible = </span><span style='font-size:13px; line-height:1.3;'>{$baseFormatted} €</span>
            </div>
            <div style='display:flex;justify-content:space-between;margin:10px 0'>
            <span style='font-size:13px; line-height:1.3;'>IVA ({$factura->iva}%) = </span><span style='font-size:13px; line-height:1.3;'>{$ivaFormatted} €</span>
            </div>
            <div style='display:flex;justify-content:space-between;font-weight:bold;color:#000000'>
            <span style='font-size:13px; line-height:1.3;'>TOTAL = </span><span style='font-size:13px; line-height:1.3;'>{$totalFormatted} €</span>
            </div>
            </div>
            </div>

            <div style='clear:both'></div>

            <!-- Footer -->
            <div style='margin-top:50px;text-align:center;font-size:11px;color:#000000'>
            <p>Factura generada electrónicamente</p>
            </div>

            </div>
            </body>
            </html>";

        $pdf = PDF::loadHTML($htmlPdf)->setPaper('A4');

        return $pdf->download("factura_{$factura->id}.pdf");
    }
}
