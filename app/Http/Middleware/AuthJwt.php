<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthJwt
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->cookie('access_token');

            if (!$token) {
                return response()->json(['message' => 'No autenticado'], 401);
            }

            $user = JWTAuth::setToken($token)->authenticate();

            if (!$user) {
                return response()->json(['message' => 'Usuario no válido'], 401);
            }

            // 👉 MUY IMPORTANTE
            $request->merge(['user' => $user]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        return $next($request);
    }
}
