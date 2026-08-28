<?php

namespace App\Http\Controllers\Paquetes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Incluye;
use App\Models\PaqueteTuristico;
use Illuminate\Support\Facades\Log;
use App\Models\MapaPunto;
use App\Models\Itinerario;
use App\Models\GaleriaPaquete;
use App\Models\NoIncluye;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;


class PaqueteTuristicoController extends Controller
{
    // Obtener todos los paquetes turísticos paginados
    public function index(Request $request)
    {
        $query = PaqueteTuristico::query();

        // =========================================================
        // FILTRO POR CATEGORÍA
        // =========================================================

        if (
            $request->filled('tipo_viaje') &&
            $request->tipo_viaje !== 'todas'
        ) {
            $query->where(
                'tipo_viaje',
                $request->tipo_viaje
            );
        }

        // =========================================================
        // FILTRO POR OFERTA
        // =========================================================

        if ($request->filled('oferta')) {

            if ($request->oferta === 'sin_oferta') {

                // Solo paquetes sin oferta
                $query->whereNull('oferta');
            } elseif ($request->oferta !== 'todas') {

                // Solo la oferta seleccionada
                $query->where(
                    'oferta',
                    $request->oferta
                );
            }
        }

        // =========================================================
        // FILTRAR BLACK FRIDAY SEGÚN SUS FECHAS
        // =========================================================
        //
        // Si es Black Friday:
        //
        //   ahora >= oferta_inicio
        //   Y
        //   ahora <= oferta_fin
        //
        // Los demás paquetes siguen apareciendo normalmente.
        //
        // =========================================================

        $ahora = now();

        $query->where(function ($q) use ($ahora) {

            // Paquetes que NO son Black Friday
            $q->where(function ($subQuery) {
                $subQuery->whereNull('oferta')
                    ->orWhere('oferta', '!=', 'black_friday');
            })

                // O Black Friday que esté actualmente activo
                ->orWhere(function ($subQuery) use ($ahora) {
                    $subQuery
                        ->where('oferta', 'black_friday')
                        ->whereNotNull('oferta_inicio')
                        ->whereNotNull('oferta_fin')
                        ->where('oferta_inicio', '<=', $ahora)
                        ->where('oferta_fin', '>=', $ahora);
                });
        });

        // =========================================================
        // PLAZAS
        // =========================================================
        //
        // Paquetes normales:
        //     plazas > 0
        //
        // Black Friday:
        //     también puede aparecer agotado para mostrar SOLD OUT
        //
        // =========================================================

        $query->where(function ($q) {

            $q->where('plazas', '>', 0)

                ->orWhere(function ($subQuery) {

                    $subQuery
                        ->where('oferta', 'black_friday')
                        ->where('plazas', '<=', 0);
                });
        });

        // =========================================================
        // PAGINACIÓN
        // =========================================================

        $paquetes = $query->paginate(
            $request->get('size', 6),
            ['*'],
            'page',
            $request->get('page', 0) + 1
        );

        return response()->json([
            'content' => $paquetes->items(),
            'totalPages' => $paquetes->lastPage(),
            'totalElements' => $paquetes->total(),
            'currentPage' => $paquetes->currentPage() - 1,
        ]);
    }


    public function indexAdmin(Request $request)
    {
        try {
            $size = (int) $request->get('size', 10);

            // Evitar tamaños inválidos o excesivamente grandes
            if ($size < 1) {
                $size = 10;
            }

            if ($size > 100) {
                $size = 100;
            }

            $page = (int) $request->get('page', 0);

            if ($page < 0) {
                $page = 0;
            }

            /*
        |--------------------------------------------------------------------------
        | TODOS LOS PAQUETES
        |--------------------------------------------------------------------------
        |
        | IMPORTANTE:
        | Aquí NO aplicamos:
        |
        | - tipo_viaje
        | - oferta
        | - Black Friday
        | - plazas
        |
        */

            $paquetes = PaqueteTuristico::orderBy('id', 'desc')
                ->paginate(
                    $size,
                    ['*'],
                    'page',
                    $page + 1
                );

            return response()->json([
                'content' => $paquetes->items(),
                'totalPages' => $paquetes->lastPage(),
                'totalElements' => $paquetes->total(),
                'currentPage' => $paquetes->currentPage() - 1,
            ]);
        } catch (\Exception $e) {

            Log::error(
                'Error al obtener los paquetes para administración: ' .
                    $e->getMessage(),
                [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all(),
                ]
            );

            return response()->json([
                'message' => 'Error al obtener los paquetes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Obtener un solo paquete por ID (opcional)
    public function show($id)
    {
        $paquete = PaqueteTuristico::find($id);

        if (!$paquete) {
            return response()->json(['message' => 'Paquete no encontrado'], 404);
        }

        return response()->json($paquete);
    }

    public function imagenes($id)
    {
        try {
            $paquete = PaqueteTuristico::with('imagenes')->findOrFail($id);
            return response()->json($paquete->imagenes);
        } catch (\Exception $e) {
            Log::error('Error al obtener imágenes del paquete ID ' . $id . ': ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo obtener las imágenes del paquete'], 500);
        }
    }

    public function getByPaquete($id)
    {
        $puntos = MapaPunto::where('paquete_id', $id)->get();

        return response()->json($puntos);
    }

    public function itinerarios($id)
    {
        $itinerarios = Itinerario::where('paquete_turistico_id', $id)
            ->orderBy('dia')
            ->get(['dia', 'descripcion']);

        return response()->json($itinerarios);
    }

    public function incluye($id)
    {
        $incluye = Incluye::where('paquete_id', $id)->get();
        return response()->json($incluye);
    }


    public function noIncluye($id)
    {
        $noIncluye = NoIncluye::where('paquete_id', $id)->get();
        return response()->json($noIncluye);
    }

    public function editar(Request $request, $id)
    {
        try {
            $paquete = PaqueteTuristico::findOrFail($id);

            // Validación con reglas
            $request->validate([
                'nombre' => 'required|string',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date',
                'precio' => 'required|numeric',
                'tipo_viaje' => 'required|string',
                'descripcion' => 'nullable|string',
                'plazas' => 'required|integer',
                'foto' => 'nullable|image|max:2048', // max 2MB
                'oferta' => 'nullable|in:navidad,verano,san_valentin,black_friday,cyber_monday,bajada_precio',
                'oferta_inicio' => 'nullable|date|required_with:oferta',
                'oferta_fin' => 'nullable|date|after:oferta_inicio|required_with:oferta',
            ]);

            // Actualizar campos
            $paquete->nombre = $request->nombre;
            $paquete->fecha_inicio = $request->fecha_inicio;
            $paquete->fecha_fin = $request->fecha_fin;
            $paquete->precio = $request->precio;
            $paquete->tipo_viaje = $request->tipo_viaje;
            $paquete->oferta = $request->oferta ?: null;
            $paquete->descripcion = $request->descripcion;
            $paquete->plazas = $request->plazas;
            $paquete->oferta_inicio = $request->oferta
                ? $request->oferta_inicio
                : null;

            $paquete->oferta_fin = $request->oferta
                ? $request->oferta_fin
                : null;


            // Procesar imagen nueva si existe
            if ($request->hasFile('foto')) {
                if ($paquete->foto) {
                    $rutaAnterior = "public/paquetes/portada/{$paquete->id}/{$paquete->foto}";
                    if (Storage::exists($rutaAnterior)) {
                        Storage::delete($rutaAnterior);
                    }
                }

                $imagen = $request->file('foto');
                $nombreImagen = Str::random(20) . '.' . $imagen->getClientOriginalExtension();

                $imagen->storeAs("public/paquetes/portada/{$paquete->id}", $nombreImagen);

                $paquete->foto = $nombreImagen;
            }

            $paquete->save();

            return response()->json($paquete);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error inesperado',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Eliminar paquete
    public function destroy($id)
    {
        $paquete = PaqueteTuristico::findOrFail($id);

        // Opcional: eliminar carpeta de imágenes del paquete
        Storage::deleteDirectory("public/paquetes/portada/{$paquete->id}");

        // Eliminar la carpeta de la galería
        Storage::deleteDirectory("public/paquetes/{$paquete->id}");

        $paquete->delete();

        return response()->json(['message' => 'Paquete eliminado correctamente']);
    }

    public function buscar(Request $request)
    {
        $input = $request->input('input');

        if (!$input) {
            // Si no hay input, devolver todos o vacio, según prefieras
            return response()->json(PaqueteTuristico::all());
        }

        $paquetes = PaqueteTuristico::where('id', $input)
            ->orWhere('nombre', 'like', "%{$input}%")
            ->orWhere('tipo_viaje', 'like', "%{$input}%")
            ->orWhere('plazas', $input)
            ->get();

        return response()->json($paquetes);
    }

    public function agregar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'precio' => 'required|numeric|min:0',
            'tipo_viaje' => 'required|string|max:255',

            // OFERTA / CAMPAÑA
            'oferta' => 'nullable|in:navidad,verano,san_valentin,black_friday,cyber_monday,bajada_precio',
            'oferta_inicio' => 'nullable|date|required_with:oferta',
            'oferta_fin' => 'nullable|date|after:oferta_inicio|required_with:oferta',

            'descripcion' => 'required|string',
            'plazas' => 'required|integer|min:1',
            'viajerosFijos' => 'nullable|integer|min:1|max:255',
            'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240',
            'galeria.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240',
            'galeria' => 'required|array|size:6',

            'servicios_incluidos' => 'array',
            'servicios_incluidos.*' => 'string',

            'servicios_no_incluidos' => 'array',
            'servicios_no_incluidos.*' => 'string',

            'puntos_mapa' => 'required|array|min:1',
            'puntos_mapa.*.latitud' => 'required|numeric|between:-90,90',
            'puntos_mapa.*.longitud' => 'required|numeric|between:-180,180',
            'puntos_mapa.*.nombre' => 'nullable|string|max:255',
            'puntos_mapa.*.descripcion' => 'nullable|string|max:255',

            // Validación para el itinerario con fecha
            'itinerario' => 'required|array|min:1',
            'itinerario.*.dia' => 'required|string|max:255',
            'itinerario.*.fecha' => 'required|date',
            'itinerario.*.descripcion' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $paquete = PaqueteTuristico::create([
                'nombre' => $request->nombre,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'precio' => $request->precio,
                'tipo_viaje' => $request->tipo_viaje,

                // OFERTA
                'oferta' => $request->oferta ?: null,
                'oferta_inicio' => $request->oferta ? $request->oferta_inicio : null,
                'oferta_fin' => $request->oferta ? $request->oferta_fin : null,

                'descripcion' => $request->descripcion,
                'plazas' => $request->plazas,
                'viajerosFijos' => $request->viajerosFijos,
                'lugar' => $request->lugar,
                'servicios' => 'null',
                'numero_plazas' => $request->plazas,
            ]);

            // Guardar imagen de portada
            if ($request->hasFile('foto')) {
                $file = $request->file('foto');
                $folderPath = 'public/paquetes/portada/' . $paquete->id;

                // Crear carpeta con permisos
                if (!Storage::exists($folderPath)) {
                    Storage::makeDirectory($folderPath, 0775, true);
                    @chmod(storage_path('app/' . $folderPath), 0775);
                }

                $filename = uniqid() . '.' . $file->getClientOriginalExtension();

                // Guardar archivo
                $file->storeAs($folderPath, $filename);

                // Después de guardar: dar permisos correctos
                $fullFilePath = storage_path(
                    'app/' . $folderPath . '/' . $filename
                );

                @chmod($fullFilePath, 0644);

                $paquete->foto = $filename;
                $paquete->save();
            }

            // Guardar galería
            if ($request->hasFile('galeria')) {
                $galeriaFiles = $request->file('galeria');

                $galeriaFolder = 'paquetes/' . $paquete->id . '/images';

                // Crear carpeta si no existe
                if (!Storage::disk('public')->exists($galeriaFolder)) {
                    Storage::disk('public')->makeDirectory($galeriaFolder);

                    chmod(
                        storage_path('app/public/' . $galeriaFolder),
                        0777
                    );
                }

                foreach ($request->file('galeria') as $index => $img) {
                    $imageName =
                        ($index + 1) .
                        '_' .
                        uniqid() .
                        '.' .
                        $img->getClientOriginalExtension();

                    // Guardar archivo
                    Storage::disk('public')->putFileAs(
                        $galeriaFolder,
                        $img,
                        $imageName
                    );

                    // Forzar permisos
                    chmod(
                        storage_path(
                            'app/public/' .
                                $galeriaFolder .
                                '/' .
                                $imageName
                        ),
                        0777
                    );

                    // Guardar en BD la ruta pública
                    $publicUrl =
                        '/storage/' .
                        $galeriaFolder .
                        '/' .
                        $imageName;

                    GaleriaPaquete::create([
                        'paquete_id' => $paquete->id,
                        'ruta_imagen' => $publicUrl,
                    ]);
                }
            }

            // Guardar servicios incluidos
            if ($request->has('servicios_incluidos')) {
                foreach ($request->servicios_incluidos as $servicio) {
                    Incluye::create([
                        'paquete_id' => $paquete->id,
                        'descripcion' => $servicio,
                    ]);
                }
            }

            // Guardar servicios no incluidos
            if ($request->has('servicios_no_incluidos')) {
                foreach ($request->servicios_no_incluidos as $servicio) {
                    NoIncluye::create([
                        'paquete_id' => $paquete->id,
                        'descripcion' => $servicio,
                    ]);
                }
            }

            // Guardar puntos del mapa
            foreach ($request->puntos_mapa as $punto) {
                MapaPunto::create([
                    'paquete_id' => $paquete->id,
                    'latitud' => $punto['latitud'],
                    'longitud' => $punto['longitud'],
                    'nombre' => $punto['nombre'] ?? null,
                    'descripcion' => $punto['descripcion'] ?? null,
                ]);
            }

            // Guardar itinerario con fecha
            if ($request->has('itinerario')) {
                foreach ($request->itinerario as $item) {
                    Itinerario::create([
                        'paquete_turistico_id' => $paquete->id,
                        'dia' => $item['dia'],
                        'fecha' => $item['fecha'],
                        'descripcion' => $item['descripcion'],
                    ]);
                }
            }

            return response()->json([
                'message' => 'Paquete creado correctamente',
                'paquete' => $paquete,
            ], 201);
        } catch (\Exception $e) {
            Log::error(
                'Error al crear paquete: ' .
                    $e->getMessage() .
                    ' en ' .
                    $e->getFile() .
                    ' línea ' .
                    $e->getLine()
            );

            return response()->json([
                'message' => 'Error al crear el paquete',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerPaquetePorId($id): JsonResponse
    {
        Log::info("Solicitando paquete turístico con ID: {$id}");

        try {
            $paquete = PaqueteTuristico::with([
                'serviciosIncluidos',
                'serviciosNoIncluidos',
                'imagenes',
                'puntosMapa',
                'itinerario',
            ])->find($id);

            if (!$paquete) {
                Log::warning("Paquete con ID {$id} no encontrado.");
                return response()->json(['message' => 'Paquete no encontrado'], 404);
            }

            Log::info("Paquete encontrado: {$paquete->nombre}");

            $respuesta = [
                'id' => $paquete->id,
                'nombre' => $paquete->nombre,
                'fecha_inicio' => $paquete->fecha_inicio,
                'fecha_fin' => $paquete->fecha_fin,
                'precio' => $paquete->precio,
                'tipo_viaje' => $paquete->tipo_viaje,
                'descripcion' => $paquete->descripcion,
                'foto' => $paquete->foto,
                'plazas' => $paquete->plazas,

                // OFERTA
                'oferta' => $paquete->oferta,
                'oferta_inicio' => $paquete->oferta_inicio,
                'oferta_fin' => $paquete->oferta_fin,

                // Relacionados correctamente como arrays de objetos
                'servicios_incluidos' => $paquete->serviciosIncluidos->map(fn($s) => [
                    'id' => $s->id,
                    'descripcion' => $s->descripcion,
                ]),
                'servicios_no_incluidos' => $paquete->serviciosNoIncluidos->map(fn($s) => [
                    'id' => $s->id,
                    'descripcion' => $s->descripcion,
                ]),
                'imagenes' => $paquete->imagenes->map(fn($g) => [
                    'id' => $g->id,
                    'ruta_imagen' => $g->ruta_imagen,
                ]),
                'puntos_mapa' => $paquete->puntosMapa->map(fn($p) => [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'latitud' => $p->latitud,
                    'longitud' => $p->longitud,
                    'descripcion' => $p->descripcion,
                ]),
                'itinerario' => $paquete->itinerario->map(fn($i) => [
                    'id' => $i->id,
                    'dia' => $i->dia,
                    'descripcion' => $i->descripcion,
                ]),

            ];

            Log::info("Respuesta del paquete formateada correctamente", ['paquete_id' => $paquete->id]);

            return response()->json($respuesta);
        } catch (\Exception $e) {
            Log::error("Error al obtener el paquete con ID {$id}: " . $e->getMessage(), [
                'archivo' => $e->getFile(),
                'linea' => $e->getLine(),
            ]);

            return response()->json([
                'message' => 'Error al obtener el paquete',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function agregarIncluye(Request $request, $paqueteId)
    {
        $request->validate(['descripcion' => 'required|string']);
        $incluye = Incluye::create([
            'paquete_id' => $paqueteId,
            'descripcion' => $request->descripcion,
        ]);
        return response()->json($incluye, 201);
    }

    public function editarIncluye(Request $request, $id)
    {
        Log::info('EditarIncluye - Inicio', ['id' => $id, 'request' => $request->all()]);

        $request->validate(['descripcion' => 'required|string']);

        $incluye = Incluye::findOrFail($id);
        Log::info('EditarIncluye - Incluye encontrado', ['incluye' => $incluye]);

        $incluye->descripcion = $request->descripcion;
        $incluye->save();

        Log::info('EditarIncluye - Incluye actualizado', ['incluye' => $incluye]);

        return response()->json($incluye);
    }

    public function eliminarIncluye($id)
    {
        $incluye = Incluye::findOrFail($id);
        $incluye->delete();
        return response()->json(['message' => 'Servicio incluido eliminado correctamente']);
    }

    public function agregarNoIncluye(Request $request, $paqueteId)
    {
        $request->validate(['descripcion' => 'required|string']);
        $noIncluye = NoIncluye::create([
            'paquete_id' => $paqueteId,
            'descripcion' => $request->descripcion,
        ]);
        return response()->json($noIncluye, 201);
    }

    public function editarNoIncluye(Request $request, $id)
    {
        $request->validate(['descripcion' => 'required|string']);
        $noIncluye = NoIncluye::findOrFail($id);
        $noIncluye->descripcion = $request->descripcion;
        $noIncluye->save();
        return response()->json($noIncluye);
    }

    public function eliminarNoIncluye($id)
    {
        $noIncluye = NoIncluye::findOrFail($id);
        $noIncluye->delete();
        return response()->json(['message' => 'Servicio no incluido eliminado correctamente']);
    }

    public function editarImagenGaleria(Request $request, $id)
    {
        $request->validate(['imagen' => 'required|image|max:2048']);

        $imagenGaleria = GaleriaPaquete::findOrFail($id);

        // Eliminar la imagen anterior
        $paqueteId = $imagenGaleria->paquete_id;
        Storage::delete("public/paquetes/{$paqueteId}/images/{$imagenGaleria->ruta_imagen}");

        // Guardar la nueva imagen
        $nuevaImagen = $request->file('imagen');
        $nombre = uniqid() . '.' . $nuevaImagen->getClientOriginalExtension();
        $ruta = "public/paquetes/{$paqueteId}/images";
        $nuevaImagen->storeAs($ruta, $nombre);

        // Actualizar el registro
        $imagenGaleria->ruta_imagen = $nombre;
        $imagenGaleria->save();

        return response()->json($imagenGaleria);
    }


    public function agregarPuntoMapa(Request $request, $paqueteId)
    {
        $request->validate([
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'nombre' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $punto = MapaPunto::create([
            'paquete_id' => $paqueteId,
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
        ]);

        return response()->json($punto, 201);
    }

    public function eliminarPuntoMapa($id)
    {
        $punto = MapaPunto::findOrFail($id);
        $punto->delete();
        return response()->json(['message' => 'Punto del mapa eliminado correctamente']);
    }

    public function agregarItinerario(Request $request, $paqueteId)
    {
        $request->validate([
            'dia' => 'required|string|max:255',
            'fecha' => 'required|date',
            'descripcion' => 'required|string',
        ]);

        $itinerario = Itinerario::create([
            'paquete_turistico_id' => $paqueteId,
            'dia' => $request->dia,
            'fecha' => $request->fecha,
            'descripcion' => $request->descripcion,
        ]);

        return response()->json($itinerario, 201);
    }

    public function eliminarItinerario($id)
    {
        $itinerario = Itinerario::findOrFail($id);
        $itinerario->delete();
        return response()->json(['message' => 'Itinerario eliminado correctamente']);
    }

    public function editarPuntoMapa(Request $request, $id)
    {
        $request->validate([
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'nombre' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $punto = MapaPunto::findOrFail($id);
        $punto->latitud = $request->latitud;
        $punto->longitud = $request->longitud;
        $punto->nombre = $request->nombre;
        $punto->descripcion = $request->descripcion;
        $punto->save();

        return response()->json($punto);
    }

    public function editarItinerario(Request $request, $id)
    {
        $request->validate([
            'dia' => 'required|string|max:255',
            'descripcion' => 'required|string',
        ]);

        $itinerario = Itinerario::findOrFail($id);
        $itinerario->dia = $request->dia;
        $itinerario->descripcion = $request->descripcion;
        $itinerario->save();

        return response()->json($itinerario);
    }

    public function ultimos(Request $request)
    {
        try {
            Log::info('Se ha entrado al método ultimos');
            Log::info('Request:', $request->all());

            $size = 3; // Solo queremos los últimos 3
            $page = $request->input('page', 0);
            $laravelPage = $page + 1;

            Log::info("Página recibida: $page, página laravel: $laravelPage");

            $paquetes = PaqueteTuristico::orderBy('created_at', 'desc')
                ->paginate($size, ['*'], 'page', $laravelPage);

            Log::info('Paquetes obtenidos:', ['count' => $paquetes->count()]);

            return response()->json([
                'content' => $paquetes->items(),
                'totalPages' => $paquetes->lastPage(),
                'currentPage' => $paquetes->currentPage(),
                'totalItems' => $paquetes->total(),
            ]);
        } catch (\Exception $e) {
            Log::error("Error al obtener los últimos paquetes: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
}
