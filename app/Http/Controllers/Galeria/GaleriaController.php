<?php

namespace App\Http\Controllers\Galeria;

use Illuminate\Http\Request;
use App\Models\Galeria;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class GaleriaController extends Controller
{
    // Obtener imágenes paginadas
    public function index(Request $request)
    {
        $page = $request->input('page', 0); // React empieza desde 0
        $size = $request->input('size', 4); // tamaño por página

        // Laravel espera la página comenzando en 1
        $laravelPage = $page + 1;

        $imagenes = Galeria::orderBy('id', 'asc')->paginate($size, ['*'], 'page', $laravelPage);

        return response()->json([
            'content' => $imagenes->items(),
            'totalPages' => $imagenes->lastPage(),
            'currentPage' => $imagenes->currentPage(),
            'totalItems' => $imagenes->total(),
        ]);
    }

    // Obtener galería completa
    public function obtenerGaleria()
    {
        return Galeria::all();
    }

    // Guardar imagen
    public function guardarImagen(Request $request)
    {
        $request->validate([
            'imagen' => 'required|image',
            'titulo' => 'required|string',
            'fecha' => 'required|date',
            'ubicacion' => 'required|string',
            'mapa' => 'required|string',
        ]);

        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('public/uploads/images', $fileName);

            $galeria = Galeria::create([
                'imagen' => $fileName,
                'titulo' => $request->titulo,
                'fecha' => $request->fecha,
                'ubicacion' => $request->ubicacion,
                'mapa' => $request->mapa,
            ]);

            return response()->json($galeria, 200);
        }

        return response()->json(['error' => 'No se subió ningún archivo'], 400);
    }

    // Eliminar una imagen
    public function eliminar($id)
    {
        $imagen = Galeria::find($id);

        if (!$imagen) {
            return response()->json(['message' => 'Imagen no encontrada'], 404);
        }

        // Eliminar archivo del sistema si existe
        $rutaImagen = 'public/uploads/images/' . $imagen->imagen;
        if (Storage::exists($rutaImagen)) {
            Storage::delete($rutaImagen);
        }

        $imagen->delete();

        return response()->json(['message' => 'Imagen eliminada correctamente'], 200);
    }

    public function editar(Request $request, $id)
    {
        $request->validate([
            'titulo' => 'required|string',
            'fecha' => 'required|date',
            'ubicacion' => 'required|string',
            'mapa' => 'required|string',
            'imagen' => 'nullable|image|max:2048',
        ]);

        $imagen = Galeria::findOrFail($id);

        $imagen->titulo = $request->input('titulo');
        $imagen->fecha = $request->input('fecha');
        $imagen->ubicacion = $request->input('ubicacion');
        $imagen->mapa = $request->input('mapa');

        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');
            $path = $file->store('public/uploads/images');
            // Elimina archivo anterior si es necesario
            // Actualiza el nombre o ruta en el modelo
            $imagen->imagen = basename($path);
        }

        $imagen->save();

        return response()->json($imagen);
    }

    public function buscarImagen(Request $request)
{
    $input = $request->input('query');

    if (is_numeric($input)) {
        // Buscar por ID exacto
        $imagen = Galeria::where('id', $input)
            ->orWhere('titulo', 'like', "%{$input}%")
            ->orWhere('ubicacion', 'like', "%{$input}%")
            ->get();
    } else {
        // Buscar por título o ubicación que contengan el texto
        $imagen = Galeria::where('titulo', 'like', "%{$input}%")
            ->orWhere('ubicacion', 'like', "%{$input}%")
            ->get();
    }

    if ($imagen->isEmpty()) {
        return response()->json(['message' => 'No se encontraron resultados.'], 404);
    }

    return response()->json($imagen);
}

}
