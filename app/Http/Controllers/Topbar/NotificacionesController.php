<?php

namespace App\Http\Controllers\Topbar;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class NotificacionesController extends Controller
{
public function obtenerNotificaciones()
{
    $notificaciones = Notificacion::with('cliente.user')
        ->orderBy('is_read') // false (0) aparecerá antes que true (1)
        ->get();

    return response()->json($notificaciones);
}



    public function marcarComoLeido(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|integer']);

        $notificacion = Notificacion::findOrFail($request->id);
        $notificacion->is_read = 1;
        $notificacion->save();

        return response()->json(null, 204);
    }

public function obtenerNotificacionPorId($id): JsonResponse
{
    $notificacion = Notificacion::with('cliente.user')->find($id);

    if (!$notificacion) {
        return response()->json(['message' => 'Notificación no encontrada'], 404);
    }

    return response()->json($notificacion);
}


    public function buscarNotificacion(Request $request): JsonResponse
    {
        $input = $request->query('input');

        if (is_numeric($input)) {
            $resultados = Notificacion::where('id', $input)->get();
        } else {
            $resultados = Notificacion::where('tipo', $input)->get();
        }

        return response()->json($resultados);
    }

    public function eliminarNotificacion($id): JsonResponse
    {
        try {
            Notificacion::destroy($id);
            return response()->json(['message' => 'Notificación eliminada correctamente']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar la notificación'], 500);
        }
    }
}

