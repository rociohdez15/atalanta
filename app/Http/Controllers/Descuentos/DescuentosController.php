<?php

namespace App\Http\Controllers\Descuentos;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\colaboracion;
use App\Models\Descuento;
use Illuminate\Support\Facades\Log;
use App\Models\MapaPunto;
use App\Models\Itinerario;
use App\Models\GaleriaProyecto;
use App\Models\NoIncluye;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\File;


class DescuentosController extends Controller
{
    // Obtener todos los descuentos paginados
    public function index(Request $request)
    {
        $page = $request->input('page', 0); // React comienza en 0
        $size = $request->input('size', 10); // Tamaño por página

        $laravelPage = $page + 1;

        $descuentos = Descuento::orderBy('id', 'asc')
            ->paginate($size, ['*'], 'page', $laravelPage);

        return response()->json([
            'content' => $descuentos->items(),
            'totalPages' => $descuentos->lastPage(),
            'currentPage' => $descuentos->currentPage(),
            'totalItems' => $descuentos->total(),
        ]);
    }

    // 🔹 LISTADO COMPLETO 
    public function listado()
    {
        $descuentos = Descuento::orderBy('id', 'desc')->get();

        $descuentos->transform(function ($d) {
            $d->foto_url = asset('storage/descuentos/portada/' . $d->id . '/' . $d->foto);
            return $d;
        });

        return response()->json($descuentos);
    }

    // 🔹 MOSTRAR UNO
    public function show($id)
    {
        $descuento = Descuento::findOrFail($id);

        $descuento->foto_url = asset('storage/descuentos/portada/' . $descuento->id . '/' . $descuento->foto);

        return response()->json($descuento);
    }

    public function editar(Request $request, $id)
    {
        $descuento = Descuento::findOrFail($id);

        // 🔹 Validación básica (opcional pero recomendable)
        $request->validate([
            'titulo' => 'required|string|max:255',
            'codigo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'enlace' => 'nullable|string|max:255',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // 🔹 Actualizar campos
        $descuento->titulo = $request->titulo;
        $descuento->codigo = $request->codigo;
        $descuento->descripcion = $request->descripcion;
        $descuento->enlace = $request->enlace;

        // 🔹 Si hay nueva imagen
        if ($request->hasFile('foto')) {

            $file = $request->file('foto');
            $path = 'descuentos/portada/' . $id;

            // Eliminar imagen anterior si existe
            if ($descuento->foto && Storage::disk('public')->exists($path . '/' . $descuento->foto)) {
                Storage::disk('public')->delete($path . '/' . $descuento->foto);
            }

            // Nuevo nombre único (mejor que solo time())
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

            $file->storeAs('public/' . $path, $filename);

            $descuento->foto = $filename;
        }

        $descuento->save();

        // 🔥 IMPORTANTE: devolver foto_url como en listado
        $descuento->foto_url = asset('storage/descuentos/portada/' . $descuento->id . '/' . $descuento->foto);

        return response()->json($descuento);
    }

    public function destroy($id)
    {
        $descuento = Descuento::findOrFail($id);

        $path = 'descuentos/portada/' . $id;

        // 🔹 Eliminar imagen si existe
        if ($descuento->foto && Storage::disk('public')->exists($path . '/' . $descuento->foto)) {
            Storage::disk('public')->delete($path . '/' . $descuento->foto);
        }

        // 🔹 Eliminar carpeta completa (opcional pero recomendado)
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->deleteDirectory($path);
        }

        // 🔹 Eliminar registro de BD
        $descuento->delete();

        return response()->json([
            'message' => 'Descuento eliminado correctamente'
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'codigo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'enlace' => 'nullable|string|max:255',
            'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // ✅ 1. Crear descuento
            $descuento = Descuento::create([
                'titulo' => $request->titulo,
                'codigo' => $request->codigo,
                'descripcion' => $request->descripcion,
                'enlace' => $request->enlace,
                'foto' => null,
            ]);

            // ============================
            // 🖼️ PORTADA
            // ============================
            if ($request->hasFile('foto')) {

                $file = $request->file('foto');

                $folderPath = 'public/descuentos/portada/' . $descuento->id;

                // Crear carpeta si no existe
                if (!Storage::exists($folderPath)) {
                    Storage::makeDirectory($folderPath, 0775, true);
                    @chmod(storage_path('app/' . $folderPath), 0775);
                }

                // Nombre único
                $filename = uniqid() . '.' . $file->getClientOriginalExtension();

                // Guardar archivo
                $file->storeAs($folderPath, $filename);

                // Permisos archivo
                $fullPath = storage_path('app/' . $folderPath . '/' . $filename);
                @chmod($fullPath, 0644);

                // Guardar en BD
                $descuento->foto = $filename;
                $descuento->save();
            }

            // 🔥 Generar URL pública (IMPORTANTE para React)
            $descuento->foto_url = asset(
                'storage/descuentos/portada/' . $descuento->id . '/' . $descuento->foto
            );

            return response()->json([
                'message' => 'Descuento creado correctamente',
                'descuento' => $descuento,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear descuento: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al crear el descuento',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
