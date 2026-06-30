<?php

namespace App\Http\Controllers\Topbar;

use App\Models\FormularioContacto;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactoMail;

class MensajesController extends Controller
{
    public function obtenerMensajes()
    {
        $mensajes = FormularioContacto::orderBy('is_read')->get();

        return response()->json($mensajes);
    }


    public function marcarComoLeido(Request $request)
    {
        $mensaje = FormularioContacto::find($request->id);

        if (!$mensaje) {
            return response()->json(['error' => 'Mensaje no encontrado'], 404);
        }

        $mensaje->is_read = 1;
        $mensaje->save();

        return response()->noContent(); // 204
    }

    public function obtenerMensajePorId($id)
    {
        $mensaje = FormularioContacto::find($id);

        if (!$mensaje) {
            return response()->json(['error' => 'Mensaje no encontrado'], 404);
        }

        return response()->json($mensaje);
    }

    public function buscarMensajes(Request $request)
    {
        $input = $request->input('input');

        if (is_numeric($input)) {
            $mensajes = FormularioContacto::where('id', $input)->get();
        } else {
            $mensajes = FormularioContacto::where('nombre', 'LIKE', "%$input%")
                ->orWhere('email', 'LIKE', "%$input%")
                ->get();
        }

        return response()->json($mensajes);
    }

    public function eliminarMensaje($id)
    {
        $mensaje = FormularioContacto::find($id);

        if (!$mensaje) {
            return response()->json(['error' => 'Mensaje no encontrado'], 404);
        }

        try {
            $mensaje->delete();
            return response()->json(['message' => 'Mensaje eliminado correctamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar el mensaje'], 500);
        }
    }

    public function agregar(Request $request)
    {
        $validated = $request->validate([
            'nombre'        => 'required|string|max:255',
            'email'         => 'required|email|max:255',
            'mensaje'       => 'required|string',
            'rgpd_aceptado' => 'required|accepted',
        ], [
            'rgpd_aceptado.required' => 'Debes aceptar la política de privacidad.',
            'rgpd_aceptado.accepted' => 'Debes aceptar la política de privacidad.',
        ]);

        FormularioContacto::create([
            'nombre'        => $validated['nombre'],
            'email'         => $validated['email'],
            'mensaje'       => $validated['mensaje'],
            'is_read'       => 0,
            'fecha'         => now()->toDateString(),
            'rgpd_aceptado' => true,
            'rgpd_fecha'    => now(),
        ]);

        Mail::to('info@viajesatalanta.com')
            ->send(new ContactoMail(
                $validated['nombre'],
                $validated['email'],
                $validated['mensaje']
            ));

        return response()->json([
            'message' => 'Mensaje guardado y enviado correctamente'
        ], 201);
    }
}
