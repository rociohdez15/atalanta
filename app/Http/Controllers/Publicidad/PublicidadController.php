<?php

namespace App\Http\Controllers\Publicidad;

use App\Mail\PublicidadMail;
use App\Models\Cliente;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;

class PublicidadController extends Controller
{
    public function enviar(Request $request)
    {
        $request->validate([
            'asunto' => 'required|string|max:255',
            'mensaje' => 'required|string',
        ]);

        try {
            // Obtener clientes con su usuario asociado
            $clientes = Cliente::with('user')
                ->whereHas('user', function ($q) {
                    $q->whereNotNull('email');
                })
                ->get();

            foreach ($clientes as $cliente) {
                if ($cliente->user && $cliente->user->email) {
                    // Enviar correo de inmediato
                    Mail::to($cliente->user->email)
                        ->send(new PublicidadMail($request->asunto, $request->mensaje));
                }
            }

            return response()->json([
                'message' => 'Publicidad enviada correctamente a todos los clientes'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ocurrió un error al enviar la publicidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
