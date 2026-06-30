<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Cliente;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use App\Http\Controllers\Controller;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use App\Mail\NuevaContrasenaMail;
use Tymon\JWTAuth\Exceptions\JWTException;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only(['email', 'password']);
        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if (!$user) {
            return response()->json(['error' => 'La cuenta con la que intentas iniciar sesión no existe.'], 404);
        }

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'La contraseña es incorrecta.'], 401);
        }

        // Actualizar la última conexión
        $user->ultima_conexion = now();
        $user->save();


        JWTAuth::factory()->setTTL(60);

        // Cookies HttpOnly
        $cookieAccess = cookie('access_token', $token, 60, null, null, true, true, false, 'Strict');


        $cookieRefresh = null;
        if ($request->input('remember', false)) {
            // Generar refresh token para "remember me" (7 días)
            $refreshToken = Str::random(64);
            $user->refresh_token = hash('sha256', $refreshToken);
            $user->save();

            $cookieRefresh = cookie('refresh_token', $refreshToken, 60 * 24 * 7, null, null, true, true, false, 'Strict');
        }

        $response = response()->json([
            'rol' => $user->rol ?? 'USER',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ])->cookie($cookieAccess);

        if ($cookieRefresh) {
            $response->withCookie($cookieRefresh);
        }

        return $response;
    }


    public function me(Request $request)
    {
        // Leer token de la cookie HttpOnly
        $token = $request->cookie('access_token');

        if (!$token) {
            // ❌ No hay token → 401
            return response()->json(['message' => 'No autenticado'], 401);
        }

        try {
            // Autenticar usuario con el token
            $user = JWTAuth::setToken($token)->authenticate();

            if (!$user) {
                return response()->json(['message' => 'Usuario no encontrado'], 401);
            }

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'rol' => $user->rol,
                ],
            ]);
        } catch (JWTException $e) {
            // Token inválido o expirado → 401
            return response()->json(['message' => 'Token inválido o expirado'], 401);
        }
    }



    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre'          => 'required|string|max:255',
            'apellidos'       => 'required|string|max:255',
            'dni'             => 'required|string|regex:/^\d{8}[A-Za-z]$/|unique:clientes,dni',
            'direccion'       => 'required|string|max:255',
            'telefono'        => 'required|string|max:20',
            'fechaNacimiento' => 'required|date|before:-18 years',
            'email'           => 'required|string|email|max:255|unique:users,email',
            'password'        => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
            'rgpd_aceptado'   => 'required|accepted', // debe ser true/1/"on"
        ], [
            'dni.regex'            => 'El DNI debe tener 8 números seguidos de una letra.',
            'dni.unique'           => 'Ya existe una cuenta registrada con este DNI.',
            'email.unique'         => 'Ya existe una cuenta registrada con este correo electrónico.',
            'password.regex'       => 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.',
            'fechaNacimiento.before' => 'Debes ser mayor de 18 años.',
            'rgpd_aceptado.required' => 'Debes aceptar la política de privacidad.',
            'rgpd_aceptado.accepted' => 'Debes aceptar la política de privacidad.',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Validar letra real del DNI
        $dni = strtoupper($request->dni);
        $numero = substr($dni, 0, 8);
        $letra = substr($dni, -1);
        $letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        $letraCorrecta = $letras[$numero % 23];

        if ($letra !== $letraCorrecta) {
            return response()->json([
                'error' => ['dni' => ['El DNI proporcionado no es válido.']]
            ], 422);
        }

        // Validar dominio de email
        $domain = explode('@', $request->email)[1] ?? '';
        if (!checkdnsrr($domain, 'MX')) {
            return response()->json([
                'error' => ['email' => ['La dirección de correo electrónico proporcionada no existe.']]
            ], 422);
        }

        // Crear usuario
        $user = User::create([
            'name'     => $request->nombre,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'rol'      => 'USER',
        ]);

        // Crear cliente con datos RGPD
        Cliente::create([
            'nombre'          => $request->nombre,
            'apellidos'       => $request->apellidos,
            'dni'             => $request->dni,
            'direccion'       => $request->direccion,
            'telefono'        => $request->telefono,
            'fecha_nacimiento' => $request->fechaNacimiento,
            'usuario_id'      => $user->id,
            'rgpd_aceptado'   => true,
            'rgpd_fecha'      => now(),
            'rgpd_version'    => 'v1.0',
        ]);

        Mail::to($user->email)->send(new WelcomeMail($user->name));

        return response()->json(['message' => 'Usuario registrado con éxito.'], 201);
    }

    public function registerCliente(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre'          => 'required|string|max:255',
            'apellidos'       => 'required|string|max:255',
            'dni'             => 'required|string|regex:/^\d{8}[A-Za-z]$/|unique:clientes,dni',
            'direccion'       => 'required|string|max:255',
            'telefono'        => 'required|string|max:20',
            'fechaNacimiento' => 'required|date|before:-18 years',
            'email'           => 'nullable|string|email|max:255|unique:users,email',
            'password'        => [
                'nullable',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
            // En el panel admin no se exige casilla, pero se registra igualmente
        ], [
            'dni.regex'              => 'El DNI debe tener 8 números seguidos de una letra.',
            'dni.unique'             => 'Ya existe una cuenta registrada con este DNI.',
            'email.unique'           => 'Ya existe una cuenta registrada con este correo electrónico.',
            'password.regex'         => 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.',
            'fechaNacimiento.before' => 'Debes ser mayor de 18 años.',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Validar letra real del DNI
        $dni = strtoupper($request->dni);
        $numero = substr($dni, 0, 8);
        $letra = substr($dni, -1);
        $letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        $letraCorrecta = $letras[$numero % 23];

        if ($letra !== $letraCorrecta) {
            return response()->json([
                'error' => ['dni' => ['El DNI proporcionado no es válido.']]
            ], 422);
        }

        // Validar email solo si se proporcionó
        if ($request->email) {
            $domain = explode('@', $request->email)[1] ?? '';
            if (!checkdnsrr($domain, 'MX')) {
                return response()->json([
                    'error' => ['email' => ['La dirección de correo electrónico proporcionada no existe.']]
                ], 422);
            }
        }

        // Crear user solo si hay email + password
        $user = null;
        if ($request->email) {
            $user = User::create([
                'name'     => $request->nombre,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'rol'      => 'USER',
            ]);
        }

        // Crear cliente — admin registra en nombre del cliente,
        // se guarda sin consentimiento explícito del propio usuario
        Cliente::create([
            'nombre'           => $request->nombre,
            'apellidos'        => $request->apellidos,
            'dni'              => $request->dni,
            'direccion'        => $request->direccion,
            'telefono'         => $request->telefono,
            'fecha_nacimiento' => $request->fechaNacimiento,
            'usuario_id'       => $user?->id,
            'rgpd_aceptado'    => false,   // el cliente no ha aceptado por sí mismo
            'rgpd_fecha'       => null,
            'rgpd_version'     => null,
        ]);

        if ($user) {
            Mail::to($user->email)->send(new WelcomeMail($user->name));
        }

        return response()->json(['message' => 'Cliente registrado con éxito.'], 201);
    }


    public function olvidaste(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'No existe un usuario con ese correo.'], 404);
        }

        $nuevaContrasena = Str::random(10);
        $user->password = Hash::make($nuevaContrasena);
        $user->save();

        Mail::to($user->email)->send(new NuevaContrasenaMail($user->name, $nuevaContrasena));

        return response()->json(['message' => 'Se ha enviado una nueva contraseña al correo.']);
    }

    public function logout(Request $request)
    {
        try {
            $token = $request->cookie('access_token');
            $refreshToken = $request->cookie('refresh_token');

            if ($token) {
                JWTAuth::setToken($token)->invalidate(); // invalida el access token
            }

            // Limpiar refresh token en base de datos
            if ($refreshToken) {
                $user = User::where('refresh_token', hash('sha256', $refreshToken))->first();
                if ($user) {
                    $user->refresh_token = null;
                    $user->save();
                }
            }

            // Limpiar cookies
            $cookieAccess = cookie()->forget('access_token');
            $cookieRefresh = cookie()->forget('refresh_token');

            return response()->json(['message' => 'Sesión cerrada correctamente'])
                ->withCookie($cookieAccess)
                ->withCookie($cookieRefresh);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al cerrar sesión'], 500);
        }
    }


    public function refresh(Request $request)
    {
        $refreshToken = $request->cookie('refresh_token');

        if (!$refreshToken) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Buscar usuario con refresh_token válido
        $user = User::where('refresh_token', hash('sha256', $refreshToken))->first();

        if (!$user) {
            return response()->json(['error' => 'Refresh token inválido'], 401);
        }

        // Generar nuevo JWT (access token)
        $token = auth('api')->login($user);
        JWTAuth::factory()->setTTL(60); // 60 minutos

        $cookieAccess = cookie(
            'access_token',
            $token,
            60, // minutos
            null,
            null,
            true,  // secure
            true,  // httpOnly
            false,
            'Strict'
        );

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->rol,
            ],
        ])->cookie($cookieAccess);
    }
}
