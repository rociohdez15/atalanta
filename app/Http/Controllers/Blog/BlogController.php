<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Entrada;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\Request;
use App\Models\LikeEntrada;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;


class BlogController extends Controller
{
    public function index(Request $request)
    {
        $pageSize = $request->input('size', 3);

        $entradas = Entrada::withCount('likes')
            ->orderBy('fecha_publicacion', 'desc')
            ->paginate($pageSize);

        return response()->json([
            'content' => $entradas->items(),
            'totalPages' => $entradas->lastPage(),
        ]);
    }

    public function show($id)
    {
        $entrada = Entrada::withCount('likes')->findOrFail($id);

        return response()->json($entrada);
    }

    public function toggle(Request $request)
    {
        try {
            /** ✅ USUARIO DESDE EL MIDDLEWARE */
            $user = $request->user;

            Log::info('Toggle LikeEntrada llamado', [
                'user_id' => optional($user)->id,
                'entrada_id' => $request->entrada_id
            ]);

            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $request->validate([
                'entrada_id' => 'required|exists:entradas,id'
            ]);

            $like = LikeEntrada::where('usuario_id', $user->id)
                ->where('entrada_id', $request->entrada_id)
                ->first();

            if ($like) {
                $like->delete();

                return response()->json(['message' => 'Like eliminado']);
            }

            // Crear like
            LikeEntrada::create([
                'usuario_id' => $user->id,
                'entrada_id' => $request->entrada_id,
                'fecha' => now()->toDateString()
            ]);

            // Obtener cliente del usuario
            $cliente = DB::table('clientes')
                ->where('usuario_id', $user->id)
                ->first();

            if (!$cliente) {
                return response()->json([
                    'error' => 'Cliente no encontrado para el usuario'
                ], 400);
            }

            DB::table('notificaciones')->insert([
                'tipo' => 'like',
                'cliente_id' => $cliente->id,
                'fecha' => now(),
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['message' => 'Like añadido']);
        } catch (\Throwable $e) {
            Log::error('Error en toggle LikeEntrada', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }
    public function count($entradaId)
    {
        $count = LikeEntrada::where('entrada_id', $entradaId)->count();
        return response()->json(['likes' => $count]);
    }

    public function likedByUser($entradaId, Request $request)
    {
        $user = $request->user; // 🔹 obtenido del middleware JWT
        if (!$user) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $liked = LikeEntrada::where('entrada_id', $entradaId)
            ->where('usuario_id', $user->id)
            ->exists();

        return response()->json(['liked' => $liked]);
    }

    public function obtenerEntradas()
    {
        return Entrada::all();
    }

    public function eliminar($id)
    {
        $entrada = Entrada::find($id);

        if (!$entrada) {
            return response()->json(['message' => 'Entrada no encontrada'], 404);
        }

        // Eliminar archivo del sistema si existe
        // Ruta del directorio completo de la entrada
        $directorio = 'public/blog/' . $entrada->id;

        // Eliminar el directorio completo con todas las imágenes
        if (Storage::exists($directorio)) {
            Storage::deleteDirectory($directorio);
        }

        $entrada->delete();

        return response()->json(['message' => 'Entrada eliminada correctamente'], 200);
    }

    public function editar(Request $request, $id)
    {
        $request->validate([
            'titulo' => 'required|string',
            'fecha_publicacion' => 'required|date',
            'contenido' => 'required|string',
            'imagen' => 'nullable|image|max:2048',
        ]);

        $entrada = Entrada::findOrFail($id);

        $entrada->titulo = $request->input('titulo');
        $entrada->fecha_publicacion = $request->input('fecha_publicacion');
        $entrada->contenido = $request->input('contenido');

        if ($request->hasFile('imagen')) {
            // Elimina archivo anterior si existe
            if ($entrada->imagen_destacada) {
                $rutaAnterior = storage_path("app/public/blog/{$entrada->id}/" . $entrada->imagen_destacada);
                if (file_exists($rutaAnterior)) {
                    unlink($rutaAnterior);
                }
            }

            // Guarda la nueva imagen
            $file = $request->file('imagen');
            $path = $file->store("public/blog/{$entrada->id}");

            // Actualiza el nombre o ruta en el modelo
            $entrada->imagen_destacada = basename($path);
        }


        $entrada->save();

        return response()->json($entrada);
    }

    public function buscar(Request $request)
    {
        $input = $request->input('query');

        if (!$input) {
            // Si no hay input, devolver todas las entradas o vacías
            return response()->json(Entrada::all());
        }

        // Si el input es numérico, buscar por id exacto o por título (like)
        if (is_numeric($input)) {
            $entradas = Entrada::where('id', $input)
                ->orWhere('titulo', 'like', "%{$input}%")
                ->get();
        } else {
            // Si no es numérico, buscar solo por título LIKE
            $entradas = Entrada::where('titulo', 'like', "%{$input}%")->get();
        }

        return response()->json($entradas);
    }

    public function agregar(Request $request)
    {
        try {
            // Obtener token de la cookie
            $token = $request->cookie('access_token');
            if (!$token) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Autenticar usuario con JWT
            $user = JWTAuth::setToken($token)->authenticate();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Validación básica de campos
            $validated = $request->validate([
                'titulo' => 'required|string|max:255',
                'contenido' => 'required|string',
                'imagen_destacada' => 'required|image|max:2048', // máximo 2MB
            ]);

            // Fecha actual
            $fechaActual = Carbon::now();

            // Crear entrada sin imagen primero
            $entrada = Entrada::create([
                'titulo' => $validated['titulo'],
                'fecha_publicacion' => $fechaActual,
                'contenido' => $validated['contenido'],
                'imagen_destacada' => null,
                'autor_id' => $user->id,
            ]);

            // Guardar imagen en storage/app/public/blog/{id}/
            if ($request->hasFile('imagen_destacada')) {
                $file = $request->file('imagen_destacada');
                $rutaCompleta = storage_path("app/public/blog/{$entrada->id}");

                if (!file_exists($rutaCompleta)) {
                    mkdir($rutaCompleta, 0755, true);
                }

                $nombreImagen = time() . '_' . $file->getClientOriginalName();
                $file->move($rutaCompleta, $nombreImagen);

                // Actualizar entrada con nombre de la imagen
                $entrada->imagen_destacada = $nombreImagen;
                $entrada->save();
            }

            return response()->json([
                'message' => 'Entrada creada correctamente',
                'entrada' => $entrada,
            ], 201);
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['error' => 'Token expirado'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['error' => 'Token inválido'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        } catch (\Exception $e) {
            Log::error('Error en agregar entrada: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear la entrada',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
