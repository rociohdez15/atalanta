<?php

namespace App\Http\Controllers\Resenas;

use App\Models\Resena;
use App\Models\Reserva;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use App\Models\Cliente;
use Tymon\JWTAuth\Facades\JWTAuth;

class ResenaController extends Controller
{
    // Listar todas las reseñas (con paginación opcional)
    public function index(Request $request)
    {
        $perPage = $request->query('perPage', 10);

        $reseñas = Resena::select(
            'resenas.*',
            'clientes.nombre',
            'clientes.apellidos'
        )
            ->join('clientes', 'resenas.cliente_id', '=', 'clientes.id')
            ->orderBy('resenas.fecha', 'desc')
            ->paginate($perPage);

        return $reseñas;
    }

    public function vencidas(Request $request)
    {
        try {

            $token = $request->cookie('access_token');

            if (!$token) {
                return response()->json(['error' => 'Token no proporcionado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            $cliente = Cliente::where('usuario_id', $user->id)->first();

            if (!$cliente) {
                return response()->json(['error' => 'Cliente no encontrado'], 404);
            }

            $hoy = Carbon::today();


            $reservasVencidas = $cliente->reservas()
                ->with('paquete')
                ->whereDoesntHave('resena2')
                ->where(function ($q) use ($hoy) {


                    // 🔵 Paquetes normales
                    $q->where(function ($sub) use ($hoy) {

                        $sub->where('paquete_id', '!=', 0)
                            ->whereHas('paquete', function ($p) use ($hoy) {
                                $p->whereDate('fecha_fin', '<', $hoy);
                            });
                    });


                    // 🟡 Paquetes personalizados
                    $q->orWhere(function ($sub) use ($hoy) {

                        $sub->where('paquete_id', 0)
                            ->whereDate('fecha_fin', '<', $hoy);
                    });
                })
                ->get();



            $resultado = $reservasVencidas->map(function ($reserva) {


                // 🔵 Normal
                if ($reserva->paquete_id != 0 && $reserva->paquete) {

                    return [
                        'reserva_id' => $reserva->id,
                        'paquete_id' => $reserva->paquete->id,
                        'nombre'     => $reserva->paquete->nombre,
                        'foto'       => $reserva->paquete->foto,
                        'fecha_fin'  => $reserva->paquete->fecha_fin,
                    ];
                }


                // 🟡 Personalizado
                return [
                    'reserva_id' => $reserva->id,
                    'paquete_id' => 0,
                    'nombre'     => $reserva->destino,
                    'foto'       => null,
                    'fecha_fin'  => $reserva->fecha_fin,
                ];
            });


            return response()->json($resultado);
        } catch (\Exception $e) {

            return response()->json([
                'error' => 'Error interno: ' . $e->getMessage()
            ], 500);
        }
    }
    public function store(Request $request)
    {
        try {

            // 🔐 Usuario autenticado por cookie JWT
            $token = $request->cookie('access_token');

            if (!$token) {
                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }


            $user = JWTAuth::setToken($token)->authenticate();


            $cliente = Cliente::where('usuario_id', $user->id)->first();


            if (!$cliente) {
                return response()->json([
                    'error' => 'Cliente no encontrado'
                ], 404);
            }



            $request->validate([

                'reserva_id' => 'required|exists:reservas,id',

                // acepta paquetes normales y personalizados (0)
                'paquete_id' => 'required|integer',

                'estrellas'  => 'required|integer|min:1|max:5',

                'texto'      => 'required|string|max:2000',

            ]);



            // Evitar duplicados
            $existe = Resena::where(
                'reserva_id',
                $request->reserva_id
            )->exists();


            if ($existe) {

                return response()->json([
                    'message' => 'Ya existe una reseña para esta reserva'
                ], 409);
            }



            $reserva = Reserva::find($request->reserva_id);



            if (!$reserva) {

                return response()->json([
                    'error' => 'Reserva no encontrada'
                ], 404);
            }



            // Si es personalizado guardamos 0
            $paqueteId = $reserva->paquete_id;



            $resena = Resena::create([

                'cliente_id' => $cliente->id,

                'reserva_id' => $reserva->id,

                'paquete_id' => $paqueteId,

                'num_estrellas' => $request->estrellas,

                'fecha' => Carbon::today(),

                'foto_cliente' =>
                'https://cdn-icons-png.flaticon.com/512/758/758771.png',

                'texto' => $request->texto,

            ]);



            return response()->json([

                'message' => 'Reseña guardada correctamente',

                'resena' => $resena

            ], 201);
        } catch (\Exception $e) {


            return response()->json([

                'error' => $e->getMessage()

            ], 500);
        }
    }

    public function pendientes(Request $request)
    {
        $perPage = $request->query('perPage', 10);

        $token = $request->cookie('access_token');
        if (!$token) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $user = JWTAuth::setToken($token)->authenticate();

        $cliente = Cliente::where('usuario_id', $user->id)->first();
        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        $reservas = Reserva::with(['paquete', 'cliente2.user'])
            ->where('cliente_id', $cliente->id)
            ->whereDoesntHave('resena2')
            ->where(function ($q) {

                // 🔵 NORMALES (sin whereHas para evitar errores ocultos)
                $q->where(function ($sub) {
                    $sub->where('paquete_id', '!=', 0)
                        ->whereHas('paquete', function ($p) {
                            $p->whereDate('fecha_fin', '<', now());
                        });
                });

                // 🟡 PERSONALIZADOS
                $q->orWhere(function ($sub) {
                    $sub->where('paquete_id', 0)
                        ->whereDate('fecha_fin', '<', now());
                });
            })
            ->orderBy('fecha_fin', 'desc')
            ->paginate($perPage);

        return response()->json($reservas);
    }


    public function misResenas(Request $request)
    {
        $cliente = $request->user(); // 👈 ESTA es la clave

        if (!$cliente) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $clienteId = $cliente->id;

        return Resena::where('cliente_id', $cliente->id)
            ->select('id', 'reserva_id', 'paquete_id', 'num_estrellas', 'texto', 'fecha')
            ->get();
    }

    // Mostrar una reseña concreta
    public function show($id)
    {
        return Resena::findOrFail($id);
    }

    // Actualizar una reseña
    public function update(Request $request, $id)
    {
        $reseña = Resena::findOrFail($id);

        $validated = $request->validate([
            'cliente_id' => 'integer',
            'paquete_id' => 'integer',
            'num_estrellas' => 'integer|min:1|max:5',
            'fecha' => 'date',
            'foto_cliente' => 'nullable|url',
            'texto' => 'string',
        ]);

        $reseña->update($validated);

        return $reseña;
    }

    // Borrar una reseña
    public function destroy($id)
    {
        $reseña = Resena::findOrFail($id);
        $reseña->delete();
        return response()->json(['message' => 'Resena eliminada correctamente']);
    }

    public function listado(Request $request)
    {
        $perPage = $request->query('perPage', 10);

        $resenas = Resena::select(
            'resenas.id',
            'resenas.num_estrellas',
            'resenas.texto',
            'resenas.fecha',
            'clientes.nombre as cliente_nombre',
            'clientes.apellidos as cliente_apellidos',
            'paquetes_turisticos.nombre as paquete_nombre'
        )
            ->join('clientes', 'resenas.cliente_id', '=', 'clientes.id')
            ->join('paquetes_turisticos', 'resenas.paquete_id', '=', 'paquetes_turisticos.id')
            ->orderBy('resenas.fecha', 'desc')
            ->paginate($perPage);

        return response()->json($resenas);
    }
}
