<?php

namespace App\Http\Controllers\Administradores;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;


class AdministradoresController extends Controller
{
    // Obtener todos los admins
    public function obtenerAdmins()
    {
        // Aquí asumo que tienes un campo 'rol' que distingue a los admins
        $admins = User::where('rol', 'ADMIN')->get();
        return response()->json($admins);
    }

    // Buscar usuario por id o email
    public function buscarUsuario(Request $request)
    {
        $input = $request->input('input');

        if (is_numeric($input)) {
            $usuario = User::find($input);
        } else {
            $usuario = User::where('email', $input)->first();
        }

        if ($usuario) {
            return response()->json($usuario);
        } else {
            return response()->json(['message' => 'No se encontraron resultados.'], 404);
        }
    }

    // Eliminar admin por id
    public function eliminarAdmin($id)
    {
        try {
            $usuario = User::findOrFail($id);
            $usuario->delete();
            return response()->json(['message' => 'Administrador eliminado correctamente']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar el administrador'], 500);
        }
    }

public function editarEmail(Request $request, $id)
{
    $data = $request->only(['email', 'password']); // Solo tomamos email y password

    $request->validate([
        'email' => 'required|email|unique:users,email,' . $id,
        'password' => 'nullable|string|min:6',
    ]);

    $usuario = User::find($id);
    if (!$usuario) {
        return response()->json(['message' => 'Usuario no encontrado'], 404);
    }

    $usuario->email = $data['email'];

    if (!empty($data['password'])) {
        $usuario->password = bcrypt($data['password']);
    }

    $usuario->save();

    return response()->json([
        'id' => $usuario->id,
        'email' => $usuario->email,
    ]);
}

    // Comprobar si existe admin con email dado
    public function existeAdmin(Request $request)
    {
        $email = $request->input('email');
        $exists = User::where('email', $email)->exists();
        return response()->json(['exists' => $exists]);
    }

    // Alta nuevo admin
    public function altaAdmin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'El correo electrónico ya está en uso o datos inválidos.'], 400);
        }

        $nuevoAdmin = new User();
        $nuevoAdmin->email = $request->email;
        $nuevoAdmin->password = Hash::make($request->password);
        $nuevoAdmin->name = $request->query('name');
        $nuevoAdmin->rol = 'ADMIN';
        $nuevoAdmin->save();

        return response()->json(['message' => 'Administrador creado correctamente']);
    }
}
