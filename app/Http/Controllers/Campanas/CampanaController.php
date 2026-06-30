<?php

namespace App\Http\Controllers\Campanas;

use App\Models\Campana;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CampanaController extends Controller
{
    public function activas()
    {
        return Campana::where('activo', true)
            ->where(function ($q) {
                $q->whereNull('fecha_inicio')
                    ->orWhere('fecha_inicio', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('fecha_fin')
                    ->orWhere('fecha_fin', '>=', now());
            })
            ->orderBy('orden', 'asc')
            ->get();
    }

    public function index()
    {

        $campanas = Campana::orderBy('orden', 'asc')
            ->get();


        return response()->json($campanas);
    }



    public function cambiarEstado(Request $request, $id)
    {


        $campana = Campana::find($id);


        if (!$campana) {

            return response()->json([
                "message" => "Campaña no encontrada"
            ], 404);
        }



        $campana->activo = $request->activo;

        $campana->save();



        return response()->json([
            "message" => "Estado actualizado",
            "campana" => $campana
        ]);
    }

    public function update(Request $request, $id)
    {
        $campana = Campana::find($id);

        if (!$campana) {
            return response()->json([
                'message' => 'Campaña no encontrada'
            ], 404);
        }

        $campana->nombre = $request->nombre;
        $campana->titulo = $request->titulo;
        $campana->subtitulo = $request->subtitulo;
        $campana->imagen = $request->imagen;
        $campana->boton = $request->boton;
        $campana->link = $request->link;
        $campana->orden = $request->orden;
        $campana->fecha_inicio = $request->fecha_inicio;
        $campana->fecha_fin = $request->fecha_fin;
        $campana->activo = $request->activo;

        $campana->save();

        return response()->json($campana);
    }

    // =========================
    // ELIMINAR CAMPANA
    // =========================
    public function destroy($id)
    {
        $campana = Campana::find($id);

        if (!$campana) {
            return response()->json([
                'message' => 'Campaña no encontrada'
            ], 404);
        }

        $campana->delete();

        return response()->json([
            'message' => 'Campaña eliminada correctamente'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'titulo' => 'required|string|max:255',
            'subtitulo' => 'nullable|string',
            'imagen' => 'nullable|string',
            'boton' => 'nullable|string',
            'link' => 'nullable|string',
            'orden' => 'nullable|integer',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'activo' => 'boolean',
        ]);

        $campana = new Campana();

        $campana->nombre = $request->nombre;
        $campana->titulo = $request->titulo;
        $campana->subtitulo = $request->subtitulo;
        $campana->imagen = $request->imagen;
        $campana->boton = $request->boton;
        $campana->link = $request->link;
        $campana->orden = $request->orden ?? 0;
        $campana->fecha_inicio = $request->fecha_inicio;
        $campana->fecha_fin = $request->fecha_fin;
        $campana->activo = $request->activo ?? true;

        $campana->save();

        return response()->json([
            'message' => 'Campaña creada correctamente',
            'data' => $campana
        ], 201);
    }
}
