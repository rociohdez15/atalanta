<?php

namespace App\Http\Controllers\Eventos;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Models\Evento;
use Illuminate\Support\Facades\Validator;

class EventosController extends Controller
{
    public function crearEvento(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string',
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Datos inválidos'], 400);
        }

        $nombre = $request->input('nombre');
        $fecha = $request->input('fecha');
        $hora = $request->input('hora');

        // Validar duplicado exacto
        if (Evento::where('nombre', $nombre)
            ->where('fecha', $fecha)
            ->where('hora', $hora)
            ->exists()
        ) {
            return response()->json(['message' => 'Ya existe un evento con el mismo nombre, fecha y hora.'], 409);
        }

        // Validar conflicto de horario
        if (Evento::where('fecha', $fecha)
            ->where('hora', $hora)
            ->exists()
        ) {
            return response()->json(['message' => 'Ya hay otro evento en esa fecha y hora.'], 409);
        }

        Evento::create([
            'nombre' => $nombre,
            'fecha' => $fecha,
            'hora' => $hora,
        ]);

        return response()->json(['message' => 'Evento creado']);
    }

    public function obtenerEventos()
    {
        return response()->json(Evento::all());
    }

    public function eliminarEvento($id)
    {
        if (!Evento::find($id)) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }

        Evento::destroy($id);
        return response()->json(['message' => 'Evento eliminado correctamente']);
    }

    public function editarEvento(Request $request, $id)
    {
        $evento = Evento::find($id);

        if (!$evento) {
            return response()->json(['message' => 'Evento no encontrado'], 404);
        }

        // Obtener los parámetros de la query string
        $nombre = $request->query('nombre');
        $fecha = $request->query('fecha');
        $hora = $request->query('hora');

        if (!$nombre || !$fecha || !$hora) {
            return response()->json(['message' => 'Todos los campos son obligatorios'], 400);
        }

        $evento->nombre = $nombre;
        $evento->fecha = $fecha;
        $evento->hora = $hora;

        $evento->save();

        return response()->json(['message' => 'Evento actualizado correctamente']);
    }


    public function buscarEvento(Request $request)
    {
        $input = $request->query('input');

        if (is_numeric($input)) {
            $evento = Evento::find($input);
            return $evento
                ? response()->json([$evento])
                : response()->json(['message' => 'No se encontraron resultados.'], 404);
        }

        $resultados = Evento::where('nombre', $input)->get();

        if ($resultados->isEmpty()) {
            return response()->json(['message' => 'No se encontraron resultados.'], 404);
        }

        return response()->json($resultados);
    }
}
