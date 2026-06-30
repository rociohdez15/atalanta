<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->cookie('access_token'); // o $request->bearerToken() si usas header Authorization
            if (!$token) {
                return response()->json(['message' => 'No autenticado, token ausente'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            if (!$user) {
                return response()->json(['message' => 'No autenticado, usuario no encontrado'], 401);
            }

            if ($user->rol !== 'ADMIN') {
                return response()->json(['message' => 'Acceso denegado'], 403);
            }

            // Pasar usuario autenticado a la request
            $request->merge(['user' => $user]);

        } catch (TokenExpiredException $e) {
            return response()->json(['message' => 'Token expirado'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'Token inválido'], 401);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error de autenticación', 'error' => $e->getMessage()], 401);
        }

        return $next($request);
    }
}
