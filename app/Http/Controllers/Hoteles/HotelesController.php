<?php

namespace App\Http\Controllers\Hoteles;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\Request;

class HotelesController extends Controller
{
    // OBTENER HOTELES
    public function obtenerHoteles()
    {
        return response()->json(
            Hotel::orderBy('id', 'asc')->get()
        );
    }

    // BUSCAR HOTELES
    public function buscar(Request $request)
    {
        $input = $request->input('input');

        $hoteles = Hotel::where('nombre', 'like', "%{$input}%")
            ->orWhere('email', 'like', "%{$input}%")
            ->orWhere('telefono', 'like', "%{$input}%")
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($hoteles);
    }

    // CREAR HOTEL
    public function crear(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'lugar' => 'nullable|string|max:255',
            'email' => 'nullable|string|max:1000',
            'telefono' => 'nullable|string|max:255',
        ]);

        $hotel = Hotel::create([
            'nombre' => $request->nombre,
            'lugar' => $request->lugar,
            'email' => $request->email,
            'telefono' => $request->telefono,
        ]);

        return response()->json([
            'message' => 'Hotel creado correctamente',
            'hotel' => $hotel
        ], 201);
    }

    // ELIMINAR HOTEL
    public function eliminar($id)
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json([
                'message' => 'Hotel no encontrado'
            ], 404);
        }

        $hotel->delete();

        return response()->json([
            'message' => 'Hotel eliminado correctamente'
        ]);
    }

    public function editar(Request $request, $id)
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json([
                'message' => 'Hotel no encontrado'
            ], 404);
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'lugar' => 'nullable|string|max:255',
            'email' => 'nullable|string|max:1000',
            'telefono' => 'nullable|string|max:255',
        ]);

        $hotel->update([
            'nombre' => $request->nombre,
            'lugar' => $request->lugar,
            'email' => $request->email,
            'telefono' => $request->telefono,
        ]);

        return response()->json([
            'message' => 'Hotel actualizado correctamente',
            'hotel' => $hotel
        ]);
    }
}
