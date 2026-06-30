<?php

namespace App\Http\Controllers\Colaboraciones;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Incluye;
use App\Models\Colaboracion;
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


class ColaboracionesController extends Controller
{
    // Obtener todas las colaboraciones paginadas
    public function index(Request $request)
    {
        $page = $request->input('page', 0); // React comienza en 0
        $size = $request->input('size', 10); // Tamaño por página

        $laravelPage = $page + 1;

        $colaboraciones = Colaboracion::orderBy('id', 'asc')
            ->paginate($size, ['*'], 'page', $laravelPage);

        return response()->json([
            'content' => $colaboraciones->items(),
            'totalPages' => $colaboraciones->lastPage(),
            'currentPage' => $colaboraciones->currentPage(),
            'totalItems' => $colaboraciones->total(),
        ]);
    }

    // Obtener galería por proyecto
    public function galeria($id)
    {
        // Trae todas las imágenes del proyecto por su ID
        $imagenes = GaleriaProyecto::where('proyecto_id', $id)
            ->orderBy('id', 'asc')
            ->get(['ruta_imagen', 'descripcion_imagen']);

        // Retorna JSON
        return response()->json([
            'galeria' => $imagenes
        ]);
    }


    public function listado()
    {
        $colaboraciones = Colaboracion::orderBy('fecha_inicio', 'desc')->get();

        // Añadir URL completa de la foto
        $colaboraciones->transform(function ($c) {
            $c->foto_url = asset('storage/colaboraciones/portada/' . $c->id . '/' . $c->foto);
            return $c;
        });

        return response()->json($colaboraciones);
    }

    public function show($id)
    {
        $colaboracion = Colaboracion::with('galeria')->findOrFail($id);

        // Añadir URL correcta a cada imagen
        $colaboracion->galeria->transform(function ($img) {
            $img->url = asset(
                'storage/colaboraciones/' . $img->proyecto_id . '/images/' . $img->ruta_imagen
            );
            return $img;
        });

        return response()->json($colaboracion);
    }

    public function eliminarImagen($colaboracionId, $imagenId)
    {
        $img = GaleriaProyecto::findOrFail($imagenId);
        // Eliminar archivo físico si existe
        Storage::disk('public')->delete('colaboraciones/' . $img->proyecto_id . '/images/' . $img->ruta_imagen);
        $img->delete();
        return response()->json(['message' => 'Imagen eliminada']);
    }

    public function editarImagen(Request $request, $colaboracionId, $imagenId)
    {
        $img = GaleriaProyecto::findOrFail($imagenId);

        if ($request->hasFile('imagen')) {
            // Eliminar antigua
            Storage::disk('public')->delete('colaboraciones/' . $img->proyecto_id . '/images/' . $img->ruta_imagen);
            // Guardar nueva
            $file = $request->file('imagen');
            $filename = $file->getClientOriginalName();
            $file->storeAs('public/colaboraciones/' . $img->proyecto_id . '/images', $filename);
            $img->ruta_imagen = $filename;
        }

        $img->descripcion_imagen = $request->descripcion_imagen;
        $img->save();

        // Devolver datos actualizados con URL
        $img->url = asset('storage/colaboraciones/' . $img->proyecto_id . '/images/' . $img->ruta_imagen);
        return response()->json($img);
    }

    public function editar(Request $request, $id)
    {
        try {
            $colaboracion = Colaboracion::findOrFail($id);

            $colaboracion->nombre = $request->input('nombre');
            $colaboracion->web = $request->input('web');
            $colaboracion->descripcion = $request->input('descripcion');
            $colaboracion->fecha_inicio = $request->input('fecha_inicio');
            $colaboracion->fecha_fin = $request->input('fecha_fin');

            if ($request->hasFile('foto')) {
                $file = $request->file('foto');

                // Crear carpeta si no existe
                $path = 'colaboraciones/portada/' . $id;
                if (!Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->makeDirectory($path);
                }

                // Borrar foto antigua solo si existe
                if ($colaboracion->foto && Storage::disk('public')->exists($path . '/' . $colaboracion->foto)) {
                    Storage::disk('public')->delete($path . '/' . $colaboracion->foto);
                }

                // Generar nombre único
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                // Guardar archivo
                $file->storeAs('public/' . $path, $filename);
                $colaboracion->foto = $filename;
            }

            $colaboracion->save();

            return response()->json($colaboracion);
        } catch (\Exception $e) {
            Log::error('Error al editar colaboración ID ' . $id . ': ' . $e->getMessage());
            return response()->json([
                'error' => 'No se pudo actualizar la colaboración',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    public function eliminar($id)
    {
        $colaboracion = Colaboracion::findOrFail($id);

        // Eliminar foto de portada si existe
        Storage::disk('public')->delete('colaboraciones/portada/' . $id . '/' . $colaboracion->foto);

        $colaboracion->delete();

        return response()->json(['message' => 'Colaboración eliminada']);
    }

    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'nombre' => 'required|string|max:255',
        'web' => 'required|string|max:255',
        'descripcion' => 'required|string',
        'fecha_inicio' => 'required|date',
        'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        'galeria' => 'required|array|min:1',
        'galeria.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        'galeria_descripcion' => 'required|array|min:1',
        'galeria_descripcion.*' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    try {
        // ✅ 1. Crear colaboración
        $colaboracion = Colaboracion::create([
            'nombre' => $request->nombre,
            'web' => $request->web,
            'descripcion' => $request->descripcion,
            'fecha_inicio' => $request->fecha_inicio,
            'foto' => null,
        ]);

        // ============================
        // 🖼️ PORTADA (IGUAL QUE PAQUETES)
        // ============================
        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $folderPath = 'public/colaboraciones/portada/' . $colaboracion->id;

            if (!Storage::exists($folderPath)) {
                Storage::makeDirectory($folderPath, 0775, true);
                @chmod(storage_path('app/' . $folderPath), 0775);
            }

            $filename = uniqid() . '.' . $file->getClientOriginalExtension();

            $file->storeAs($folderPath, $filename);

            // permisos archivo
            $fullFilePath = storage_path('app/' . $folderPath . '/' . $filename);
            @chmod($fullFilePath, 0644);

            $colaboracion->foto = $filename;
            $colaboracion->save();
        }

        // ============================
        // 🖼️ GALERÍA (IGUAL QUE PAQUETES)
        // ============================
        if ($request->hasFile('galeria')) {
            $galeriaFiles = $request->file('galeria');
            $descripciones = $request->galeria_descripcion;

            $galeriaFolder = 'colaboraciones/' . $colaboracion->id . '/images';

            if (!Storage::disk('public')->exists($galeriaFolder)) {
                Storage::disk('public')->makeDirectory($galeriaFolder);
                chmod(storage_path('app/public/' . $galeriaFolder), 0777);
            }

            foreach ($galeriaFiles as $index => $img) {
                $imageName = ($index + 1) . '_' . uniqid() . '.' . $img->getClientOriginalExtension();

                Storage::disk('public')->putFileAs($galeriaFolder, $img, $imageName);

                // permisos archivo
                chmod(storage_path('app/public/' . $galeriaFolder . '/' . $imageName), 0777);

                // 👇 IMPORTANTE: guardar ruta pública igual que paquetes
                $publicUrl = '/storage/' . $galeriaFolder . '/' . $imageName;

                GaleriaProyecto::create([
                    'proyecto_id' => $colaboracion->id,
                    'ruta_imagen' => $imageName, // o guarda $publicUrl si prefieres
                    'descripcion_imagen' => $descripciones[$index],
                ]);
            }
        }

        return response()->json([
            'message' => 'Colaboración creada correctamente',
            'colaboracion' => $colaboracion,
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error al crear colaboración: ' . $e->getMessage());

        return response()->json([
            'message' => 'Error al crear la colaboración',
            'error' => $e->getMessage(),
        ], 500);
    }
}
}
