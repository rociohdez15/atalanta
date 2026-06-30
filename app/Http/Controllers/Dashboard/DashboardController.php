<?php

namespace App\Http\Controllers\Dashboard;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Models\Evento;
use App\Models\Proyecto;
use App\Models\FormularioContacto;
use App\Models\Notificacion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Response;

class DashboardController extends Controller
{
    public function getTotalProveedores()
    {
        $total = DB::table('proveedores')->count();
        return response()->json($total);
    }

 public function getTotalIngresos()
{
    try {
        $total = DB::table('reservas')->sum('total_precio');
        return response()->json($total);
    } catch (\Exception $e) {
        return response()->json([
            'error' => true,
            'message' => $e->getMessage(),
        ], 500);
    }
}


    public function getTotalReservas()
    {
        $total = DB::table('reservas')->count();
        return response()->json($total);
    }

    public function getTotalUsuarios()
    {
        $total = DB::table('users')->count();
        return response()->json($total);
    }

    public function obtenerIngresosSemanaActual()
    {
        $start = Carbon::now()->startOfWeek();
        $end = Carbon::now()->endOfWeek();

        $total = DB::table('reservas')
            ->whereBetween('fecha_reserva', [$start, $end])
            ->sum('total_precio');

        return response()->json($total);
    }

    public function obtenerVentasSemanaActual()
    {
        $start = Carbon::now()->startOfWeek();
        $end = Carbon::now()->endOfWeek();

        $total = DB::table('reservas')
            ->whereBetween('fecha_reserva', [$start, $end])
            ->count();

        return response()->json($total);
    }

    public function obtenerIngresosSemanaAnterior()
    {
        $start = Carbon::now()->subWeek()->startOfWeek();
        $end = Carbon::now()->subWeek()->endOfWeek();

        $total = DB::table('reservas')
            ->whereBetween('fecha_reserva', [$start, $end])
            ->sum('total_precio');

        return response()->json($total);
    }

    public function obtenerIngresosYReservasSemana()
    {
        $start = Carbon::now()->startOfWeek();
        $data = [
            'ingresos' => [],
            'ventas' => []
        ];

        for ($i = 0; $i < 7; $i++) {
            $date = $start->copy()->addDays($i)->toDateString();

            $ingresos = DB::table('reservas')
                ->whereDate('fecha_reserva', $date)
                ->sum('total_precio');

            $ventas = DB::table('reservas')
                ->whereDate('fecha_reserva', $date)
                ->count();

            $data['ingresos'][] = $ingresos;
            $data['ventas'][] = $ventas;
        }

        return response()->json($data);
    }

    public function obtenerVentasAnuales()
{
    try {
        $year = date('Y'); // alternativa a now()->year

        $ventasPorMes = array_fill(1, 12, 0);

        $ventas = DB::table('reservas')
            ->select(DB::raw('MONTH(fecha_reserva) as mes'), DB::raw('COUNT(*) as total'))
            ->whereYear('fecha_reserva', $year)
            ->groupBy('mes')
            ->get();

        foreach ($ventas as $venta) {
            $ventasPorMes[$venta->mes] = $venta->total;
        }

        $nombresMeses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $resultado = [];
        foreach ($ventasPorMes as $numeroMes => $cantidad) {
            $resultado[$nombresMeses[$numeroMes]] = $cantidad;
        }

        return response()->json($resultado);
    } catch (\Exception $e) {
        // Para debug, devuelve el error en la respuesta (solo en desarrollo)
        return response()->json([
            'error' => true,
            'message' => $e->getMessage(),
            'trace' => $e->getTrace()
        ], 500);
    }
}


    public function ingresosTrimestre($trimestre)
    {
        $year = now()->year;

        switch ($trimestre) {
            case 1:
                $start = "$year-01-01";
                $end = "$year-03-31";
                break;
            case 2:
                $start = "$year-04-01";
                $end = "$year-06-30";
                break;
            case 3:
                $start = "$year-07-01";
                $end = "$year-09-30";
                break;
            default:
                return response()->json(0);
        }

        $total = DB::table('reservas')
            ->whereBetween('fecha_reserva', [$start, $end])
            ->sum('total_precio');

        return response()->json($total);
    }

    public function obtenerEventos()
    {
        return response()->json(Evento::all());
    }

    public function obtenerProyectos()
    {
        return response()->json(Proyecto::all());
    }

    public function obtenerFormContacto()
    {
        return response()->json(FormularioContacto::all());
    }

    public function obtenerNotificaciones()
    {
        $notificaciones = Notificacion::with('cliente')->get();
        return response()->json($notificaciones);
    }

    public function crearEvento(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'fecha' => 'required|date',
            'hora' => 'required'
        ]);

        $evento = new Evento();
        $evento->nombre = $request->nombre;
        $evento->fecha = $request->fecha;
        $evento->hora = $request->hora;
        $evento->save();

        return response()->json(['mensaje' => 'Evento creado exitosamente']);
    }

}
