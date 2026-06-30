<?php

namespace App\Http\Controllers\Proveedores;

use App\Models\Proveedor;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ProveedoresController extends Controller
{
    public function index()
    {
        return response()->json(Proveedor::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'nullable|string',
            'telefono' => 'nullable|string|max:20',
            'notas' => 'nullable|string',
        ]);

        $proveedor = Proveedor::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'notas' => $request->notas,
        ]);

        return response()->json([
            'message' => 'Proveedor creado correctamente',
            'proveedor' => $proveedor
        ], 201);
    }

    public function show($id)
    {
        return Proveedor::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required',
            'email' => 'nullable|string',
            'telefono' => 'nullable',
            'notas' => 'nullable',
        ]);

        $proveedor = Proveedor::findOrFail($id);

        $proveedor->update([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'notas' => $request->notas,
        ]);

        return response()->json([
            'message' => 'Proveedor actualizado correctamente',
            'proveedor' => $proveedor
        ]);
    }

    public function destroy($id)
    {
        Proveedor::destroy($id);

        return response()->json(['message' => 'Eliminado correctamente']);
    }

    public function buscar(Request $request)
    {
        $input = $request->input('input');

        return Proveedor::where('nombre', 'like', "%$input%")
            ->orWhere('email', 'like', "%$input%")
            ->get();
    }
}
