<?php

namespace App\Http\Controllers\Paquetes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Incluye;
use App\Models\PaqueteTuristico;
use App\Models\PrecioPaquete;
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
use Illuminate\Support\Facades\DB;


class PaqueteTuristicoController extends Controller
{
    // Obtener todos los paquetes turísticos paginados
    // Obtener todos los paquetes turísticos paginados
    public function index(Request $request)
    {
        $query = PaqueteTuristico::query();

        // Ofertas con stock limitado: aparecen aunque estén agotadas (SOLD OUT)
        // y solo se muestran dentro de sus fechas.
        $ofertasLimitadas = ['black_friday', 'cyber_monday'];

        // =========================================================
        // FILTRO POR CATEGORÍA
        // =========================================================

        if (
            $request->filled('tipo_viaje') &&
            $request->tipo_viaje !== 'todas'
        ) {
            $query->where('tipo_viaje', $request->tipo_viaje);
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
                $query->where('oferta', $request->oferta);
            }
        }

        // =========================================================
        // FECHAS DE BLACK FRIDAY Y CYBER MONDAY
        // =========================================================
        //
        //   ahora >= oferta_inicio  Y  ahora <= oferta_fin
        //
        // Los demás paquetes siguen apareciendo normalmente.
        //
        // =========================================================

        $ahora = now();

        $query->where(function ($q) use ($ahora, $ofertasLimitadas) {

            // Paquetes que NO son Black Friday ni Cyber Monday
            $q->where(function ($subQuery) use ($ofertasLimitadas) {
                $subQuery->whereNull('oferta')
                    ->orWhereNotIn('oferta', $ofertasLimitadas);
            })

                // O Black Friday / Cyber Monday actualmente activo
                ->orWhere(function ($subQuery) use ($ahora, $ofertasLimitadas) {
                    $subQuery
                        ->whereIn('oferta', $ofertasLimitadas)
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
        // Black Friday y Cyber Monday:
        //     también aparecen agotados para mostrar SOLD OUT
        //
        // =========================================================

        $query->where(function ($q) use ($ofertasLimitadas) {

            $q->where('plazas', '>', 0)

                ->orWhere(function ($subQuery) use ($ofertasLimitadas) {
                    $subQuery
                        ->whereIn('oferta', $ofertasLimitadas)
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
        // 'precios' ya incluye habitaciones_totales y habitaciones_disponibles
        $paquete = PaqueteTuristico::with('precios')->find($id);

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
            ->get(['dia', 'descripcion', 'fecha']);

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

                // ESTADO
                'estado' => 'required|in:proximamente,disponible',

                'descripcion' => 'nullable|string',
                'plazas' => 'required|integer',
                'foto' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',

                // PDF DEL ITINERARIO
                'pdf_itinerario' => 'nullable|file|mimes:pdf|max:10240',

                // OFERTA
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

            // ESTADO
            $paquete->estado = $request->estado;

            // OFERTA
            $paquete->oferta = $request->oferta ?: null;

            $paquete->descripcion = $request->descripcion;
            $paquete->plazas = $request->plazas;

            $paquete->oferta_inicio = $request->oferta
                ? $request->oferta_inicio
                : null;

            $paquete->oferta_fin = $request->oferta
                ? $request->oferta_fin
                : null;

            /*
            |--------------------------------------------------------------------------
            | FOTO DE PORTADA
            |--------------------------------------------------------------------------
            */
            if ($request->hasFile('foto')) {

                if ($paquete->foto) {
                    $rutaAnterior = "public/paquetes/portada/{$paquete->id}/{$paquete->foto}";

                    if (Storage::exists($rutaAnterior)) {
                        Storage::delete($rutaAnterior);
                    }
                }

                $imagen = $request->file('foto');

                $folderPathFoto = 'public/paquetes/portada/' . $paquete->id;

                if (!Storage::exists($folderPathFoto)) {
                    Storage::makeDirectory($folderPathFoto, 0775, true);
                    @chmod(storage_path('app/' . $folderPathFoto), 0775);
                }

                $nombreImagen = Str::random(20) . '.' . $imagen->getClientOriginalExtension();

                $imagen->storeAs($folderPathFoto, $nombreImagen);

                $fullImagenPath = storage_path('app/' . $folderPathFoto . '/' . $nombreImagen);
                @chmod($fullImagenPath, 0644);

                $paquete->foto = $nombreImagen;
            }

            /*
            |--------------------------------------------------------------------------
            | PDF DEL ITINERARIO
            |--------------------------------------------------------------------------
            */
            if ($request->hasFile('pdf_itinerario')) {

                // Borrar el PDF anterior, si había uno
                if ($paquete->pdf_itinerario) {
                    $rutaPdfAnterior = "public/paquetes/itinerario/{$paquete->id}/{$paquete->pdf_itinerario}";

                    if (Storage::exists($rutaPdfAnterior)) {
                        Storage::delete($rutaPdfAnterior);
                    }
                }

                $pdf = $request->file('pdf_itinerario');

                $folderPathPdf = 'public/paquetes/itinerario/' . $paquete->id;

                if (!Storage::exists($folderPathPdf)) {
                    Storage::makeDirectory($folderPathPdf, 0775, true);
                    @chmod(storage_path('app/' . $folderPathPdf), 0775);
                }

                $nombrePdf = Str::random(20) . '.' . $pdf->getClientOriginalExtension();

                $pdf->storeAs($folderPathPdf, $nombrePdf);

                $fullPdfPath = storage_path('app/' . $folderPathPdf . '/' . $nombrePdf);
                @chmod($fullPdfPath, 0644);

                $paquete->pdf_itinerario = $nombrePdf;
            }

            $paquete->save();

            return response()->json([
                'message' => 'Paquete actualizado correctamente',
                'paquete' => $paquete,
            ], 200);
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

    // =========================================================
    // ACTUALIZAR STOCK DE HABITACIONES
    // =========================================================
    //
    // Cambia el total de habitaciones de un tipo conservando las
    // que ya están reservadas:
    //
    //   reservadas  = totales_antiguos - disponibles_antiguas
    //   disponibles = max(0, totales_nuevos - reservadas)
    //
    // Si se envía null, el tipo pasa a "sin límite".
    //
    public function actualizarHabitaciones(Request $request, $precioId)
    {
        $data = $request->validate([
            'habitaciones_totales' => 'nullable|integer|min:0|max:1000',
        ]);

        $precio = DB::transaction(function () use ($precioId, $data) {

            $precio = PrecioPaquete::lockForUpdate()->findOrFail($precioId);

            $nuevoTotal = $data['habitaciones_totales'] ?? null;

            if ($nuevoTotal === null) {
                $precio->habitaciones_totales = null;
                $precio->habitaciones_disponibles = null;
            } else {
                $reservadas =
                    ($precio->habitaciones_totales !== null &&
                        $precio->habitaciones_disponibles !== null)
                    ? $precio->habitaciones_totales - $precio->habitaciones_disponibles
                    : 0;

                $precio->habitaciones_totales = $nuevoTotal;
                $precio->habitaciones_disponibles = max(0, $nuevoTotal - $reservadas);
            }

            $precio->save();

            return $precio;
        });

        return response()->json($precio);
    }

    public function descargarItinerario($id)
    {
        $paquete = PaqueteTuristico::findOrFail($id);

        if (!$paquete->pdf_itinerario) {
            abort(404, 'Este paquete no tiene PDF de itinerario.');
        }

        $path = "public/paquetes/itinerario/{$paquete->id}/{$paquete->pdf_itinerario}";

        if (!Storage::exists($path)) {
            abort(404, 'El archivo no existe en el servidor.');
        }

        return Storage::download($path, $paquete->pdf_itinerario, [
            'Content-Type' => 'application/pdf',
        ]);
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
        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        $validator = Validator::make($request->all(), [

            // =====================================================
            // PAQUETE
            // =====================================================

            'nombre' => 'required|string|max:255',

            'lugar' => 'required|string|max:255',

            'fecha_inicio' => 'required|date',

            'fecha_fin' => [
                'required',
                'date',
                'after_or_equal:fecha_inicio',
            ],

            'tipo_viaje' => 'required|string|max:255',

            'estado' => [
                'required',
                'in:proximamente,disponible',
            ],

            'descripcion' => 'required|string',

            'plazas' => [
                'required',
                'integer',
                'min:1',
            ],

            'viajerosFijos' => [
                'nullable',
                'integer',
                'min:1',
                'max:255',
            ],

            // =====================================================
            // OFERTA
            // =====================================================

            'oferta' => [
                'nullable',
                'in:navidad,verano,san_valentin,black_friday,cyber_monday,bajada_precio',
            ],

            'oferta_inicio' => [
                'nullable',
                'date',
                'required_with:oferta',
            ],

            'oferta_fin' => [
                'nullable',
                'date',
                'after:oferta_inicio',
                'required_with:oferta',
            ],

            // =====================================================
            // IMÁGENES
            // =====================================================

            'foto' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:10240',
            ],

            'galeria' => [
                'required',
                'array',
                'size:6',
            ],

            'galeria.*' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:10240',
            ],

            // =====================================================
            // PDF DEL ITINERARIO
            // =====================================================

            'pdf_itinerario' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:10240',
            ],

            // =====================================================
            // PRECIOS
            // =====================================================

            'precios' => [
                'required',
                'array',
                'min:1',
            ],

            'precios.*.tipo_habitacion' => [
                'required',
                'string',
                'max:50',
            ],

            'precios.*.capacidad' => [
                'required',
                'integer',
                'min:1',
                'max:20',
            ],

            'precios.*.precio' => [
                'required',
                'numeric',
                'min:0',
            ],

            // Nº de habitaciones de este tipo
            // (vacío / null = sin límite)
            'precios.*.habitaciones_totales' => [
                'nullable',
                'integer',
                'min:1',
                'max:1000',
            ],

            // =====================================================
            // SERVICIOS
            // =====================================================

            'servicios_incluidos' => [
                'required',
                'array',
                'min:1',
            ],

            'servicios_incluidos.*' => [
                'string',
            ],

            'servicios_no_incluidos' => [
                'required',
                'array',
                'min:1',
            ],

            'servicios_no_incluidos.*' => [
                'string',
            ],

            // =====================================================
            // MAPA
            // =====================================================

            'puntos_mapa' => [
                'required',
                'array',
                'min:1',
            ],

            'puntos_mapa.*.latitud' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'puntos_mapa.*.longitud' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'puntos_mapa.*.nombre' => [
                'nullable',
                'string',
                'max:255',
            ],

            'puntos_mapa.*.descripcion' => [
                'nullable',
                'string',
                'max:255',
            ],

            // =====================================================
            // ITINERARIO
            // =====================================================

            'itinerario' => [
                'required',
                'array',
                'min:1',
            ],

            // "dia" es texto libre: "1", "1 y 2", "1, 2 y 3"...
            // (la columna `dia` de la tabla debe ser string/varchar)
            'itinerario.*.dia' => [
                'required',
                'string',
                'max:255',
            ],

            'itinerario.*.fecha' => [
                'required',
                'date',
            ],

            'itinerario.*.descripcion' => [
                'required',
                'string',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | ERRORES DE VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDACIONES ADICIONALES DE PRECIOS
        |--------------------------------------------------------------------------
        */

        $precios = $request->input('precios', []);

        $combinaciones = [];

        foreach ($precios as $index => $precio) {

            $tipoHabitacion = strtolower(
                trim($precio['tipo_habitacion'])
            );

            $capacidad = (int) $precio['capacidad'];

            $clave = $tipoHabitacion . '_' . $capacidad;

            /*
            |--------------------------------------------------------------------------
            | No permitir duplicados
            |--------------------------------------------------------------------------
            */

            if (in_array($clave, $combinaciones, true)) {
                return response()->json([
                    'errors' => [
                        "precios.$index.tipo_habitacion" => [
                            'No puedes tener dos precios para el mismo tipo de habitación y la misma capacidad.'
                        ],
                    ],
                ], 422);
            }

            $combinaciones[] = $clave;

            /*
            |--------------------------------------------------------------------------
            | La capacidad debe coincidir con el tipo
            |--------------------------------------------------------------------------
            */

            $capacidadesPermitidas = [
                'individual' => 1,
                'doble' => 2,
                'triple' => 3,
                'cuadruple' => 4,
            ];

            if (
                isset($capacidadesPermitidas[$tipoHabitacion]) &&
                $capacidad !==
                $capacidadesPermitidas[$tipoHabitacion]
            ) {
                return response()->json([
                    'errors' => [
                        "precios.$index.capacidad" => [
                            "La capacidad no coincide con el tipo de habitación."
                        ],
                    ],
                ], 422);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | VIAJEROS FIJOS
        |--------------------------------------------------------------------------
        */

        if ($request->filled('viajerosFijos')) {

            if (
                (int) $request->viajerosFijos >
                (int) $request->plazas
            ) {
                return response()->json([
                    'errors' => [
                        'viajerosFijos' => [
                            'El número de viajeros fijos no puede ser mayor que las plazas totales.'
                        ],
                    ],
                ], 422);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CREAR PAQUETE
        |--------------------------------------------------------------------------
        */

        try {

            DB::beginTransaction();

            /*
            |--------------------------------------------------------------------------
            | Calcular precio "desde"
            |--------------------------------------------------------------------------
            */

            $preciosPorPersona = collect($precios)
                ->map(function ($precio) {
                    return (float) $precio['precio'];
                })
                ->filter(function ($precio) {
                    return $precio >= 0;
                });

            if ($preciosPorPersona->isEmpty()) {
                DB::rollBack();

                return response()->json([
                    'errors' => [
                        'precios' => [
                            'Debe existir al menos un precio válido.'
                        ],
                    ],
                ], 422);
            }

            $precioDesde = $preciosPorPersona->min();

            /*
            |--------------------------------------------------------------------------
            | CREAR PAQUETE
            |--------------------------------------------------------------------------
            */

            $paquete = PaqueteTuristico::create([
                'nombre' => trim($request->nombre),

                'fecha_inicio' => $request->fecha_inicio,

                'fecha_fin' => $request->fecha_fin,

                'precio' => $precioDesde,

                'tipo_viaje' => trim($request->tipo_viaje),

                'estado' => $request->estado,

                'oferta' => $request->oferta ?: null,

                'oferta_inicio' => $request->oferta
                    ? $request->oferta_inicio
                    : null,

                'oferta_fin' => $request->oferta
                    ? $request->oferta_fin
                    : null,

                'descripcion' => trim(
                    $request->descripcion
                ),

                'plazas' => $request->plazas,

                'viajerosFijos' =>
                $request->viajerosFijos,

                'lugar' => trim($request->lugar),

                'servicios' => 'null',

                'numero_plazas' => $request->plazas,
            ]);

            /*
            |--------------------------------------------------------------------------
            | GUARDAR PRECIOS (con stock de habitaciones)
            |--------------------------------------------------------------------------
            */

            foreach ($precios as $precio) {

                // null = sin límite de habitaciones
                $habitaciones =
                    isset($precio['habitaciones_totales']) &&
                    $precio['habitaciones_totales'] !== ''
                    ? (int) $precio['habitaciones_totales']
                    : null;

                PrecioPaquete::create([
                    'paquete_id' => $paquete->id,

                    'tipo_habitacion' => strtolower(
                        trim(
                            $precio['tipo_habitacion']
                        )
                    ),

                    'capacidad' =>
                    (int) $precio['capacidad'],

                    'precio' =>
                    (float) $precio['precio'],

                    // al crear, todas están disponibles
                    'habitaciones_totales' => $habitaciones,
                    'habitaciones_disponibles' => $habitaciones,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | FOTO DE PORTADA
            |--------------------------------------------------------------------------
            */

            if ($request->hasFile('foto')) {

                $file = $request->file('foto');

                $folderPath =
                    'public/paquetes/portada/' .
                    $paquete->id;

                if (!Storage::exists($folderPath)) {

                    Storage::makeDirectory(
                        $folderPath,
                        0775,
                        true
                    );

                    @chmod(
                        storage_path(
                            'app/' . $folderPath
                        ),
                        0775
                    );
                }

                $filename =
                    uniqid() .
                    '.' .
                    $file->getClientOriginalExtension();

                $file->storeAs(
                    $folderPath,
                    $filename
                );

                $fullFilePath =
                    storage_path(
                        'app/' .
                            $folderPath .
                            '/' .
                            $filename
                    );

                @chmod(
                    $fullFilePath,
                    0644
                );

                $paquete->foto = $filename;

                $paquete->save();
            }

            /*
            |--------------------------------------------------------------------------
            | PDF DEL ITINERARIO
            |--------------------------------------------------------------------------
            */

            if ($request->hasFile('pdf_itinerario')) {

                $pdf = $request->file('pdf_itinerario');

                $folderPathPdf =
                    'public/paquetes/itinerario/' .
                    $paquete->id;

                if (!Storage::exists($folderPathPdf)) {

                    Storage::makeDirectory(
                        $folderPathPdf,
                        0775,
                        true
                    );

                    @chmod(
                        storage_path(
                            'app/' . $folderPathPdf
                        ),
                        0775
                    );
                }

                $pdfFilename =
                    uniqid() .
                    '.' .
                    $pdf->getClientOriginalExtension();

                $pdf->storeAs(
                    $folderPathPdf,
                    $pdfFilename
                );

                $fullPdfPath =
                    storage_path(
                        'app/' .
                            $folderPathPdf .
                            '/' .
                            $pdfFilename
                    );

                @chmod(
                    $fullPdfPath,
                    0644
                );

                $paquete->pdf_itinerario = $pdfFilename;

                $paquete->save();
            }

            /*
            |--------------------------------------------------------------------------
            | GALERÍA
            |--------------------------------------------------------------------------
            */

            if ($request->hasFile('galeria')) {

                $galeriaFiles =
                    $request->file('galeria');

                $galeriaFolder =
                    'paquetes/' .
                    $paquete->id .
                    '/images';

                if (
                    !Storage::disk('public')
                        ->exists($galeriaFolder)
                ) {

                    Storage::disk('public')
                        ->makeDirectory(
                            $galeriaFolder
                        );

                    @chmod(
                        storage_path(
                            'app/public/' .
                                $galeriaFolder
                        ),
                        0775
                    );
                }

                foreach (
                    $galeriaFiles as $index => $img
                ) {

                    $imageName =
                        ($index + 1) .
                        '_' .
                        uniqid() .
                        '.' .
                        $img->getClientOriginalExtension();

                    Storage::disk('public')
                        ->putFileAs(
                            $galeriaFolder,
                            $img,
                            $imageName
                        );

                    @chmod(
                        storage_path(
                            'app/public/' .
                                $galeriaFolder .
                                '/' .
                                $imageName
                        ),
                        0644
                    );

                    $publicUrl =
                        '/storage/' .
                        $galeriaFolder .
                        '/' .
                        $imageName;

                    GaleriaPaquete::create([
                        'paquete_id' =>
                        $paquete->id,

                        'ruta_imagen' =>
                        $publicUrl,
                    ]);
                }
            }

            /*
            |--------------------------------------------------------------------------
            | SERVICIOS INCLUIDOS
            |--------------------------------------------------------------------------
            */

            if (
                $request->has(
                    'servicios_incluidos'
                )
            ) {

                foreach (
                    $request->servicios_incluidos
                    as $servicio
                ) {

                    $servicioData =
                        json_decode(
                            $servicio,
                            true
                        );

                    if (
                        is_array(
                            $servicioData
                        )
                    ) {

                        Incluye::create([
                            'paquete_id' =>
                            $paquete->id,

                            'descripcion' =>
                            $servicioData['descripcion'] ?? '',

                            'precio' =>
                            $servicioData['precio'] ?? 0,
                        ]);
                    }
                }
            }

            /*
            |--------------------------------------------------------------------------
            | SERVICIOS NO INCLUIDOS
            |--------------------------------------------------------------------------
            */

            if (
                $request->has(
                    'servicios_no_incluidos'
                )
            ) {

                foreach (
                    $request->servicios_no_incluidos
                    as $servicio
                ) {

                    NoIncluye::create([
                        'paquete_id' =>
                        $paquete->id,

                        'descripcion' =>
                        trim($servicio),
                    ]);
                }
            }

            /*
            |--------------------------------------------------------------------------
            | PUNTOS DEL MAPA
            |--------------------------------------------------------------------------
            */

            foreach (
                $request->puntos_mapa as $punto
            ) {

                MapaPunto::create([
                    'paquete_id' =>
                    $paquete->id,

                    'latitud' =>
                    $punto['latitud'],

                    'longitud' =>
                    $punto['longitud'],

                    'nombre' =>
                    $punto['nombre'] ?? null,

                    'descripcion' =>
                    $punto['descripcion'] ?? null,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | ITINERARIO
            |--------------------------------------------------------------------------
            */

            if (
                $request->has('itinerario')
            ) {

                foreach (
                    $request->itinerario as $item
                ) {

                    Itinerario::create([
                        'paquete_turistico_id' =>
                        $paquete->id,

                        'dia' =>
                        $item['dia'],

                        'fecha' =>
                        $item['fecha'],

                        'descripcion' =>
                        $item['descripcion'],
                    ]);
                }
            }

            /*
            |--------------------------------------------------------------------------
            | COMMIT
            |--------------------------------------------------------------------------
            */

            DB::commit();

            /*
            |--------------------------------------------------------------------------
            | RECARGAR RELACIONES
            |--------------------------------------------------------------------------
            */

            $paquete->load([
                'precios',
                'imagenes',
                'serviciosIncluidos',
                'serviciosNoIncluidos',
                'puntosMapa',
                'itinerario',
            ]);

            return response()->json([
                'message' =>
                'Paquete creado correctamente',

                'paquete' =>
                $paquete,
            ], 201);
        } catch (\Exception $e) {

            DB::rollBack();

            Log::error(
                'Error al crear paquete: ' .
                    $e->getMessage() .
                    ' en ' .
                    $e->getFile() .
                    ' línea ' .
                    $e->getLine()
            );

            return response()->json([
                'message' =>
                'Error al crear el paquete',

                'error' =>
                $e->getMessage(),
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
                    'fecha' => $i->fecha,
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
            'fecha' => 'required|date',
            'descripcion' => 'required|string',
        ]);

        $itinerario = Itinerario::findOrFail($id);
        $itinerario->dia = $request->dia;
        $itinerario->fecha = $request->fecha;
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
