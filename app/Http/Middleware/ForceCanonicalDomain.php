<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceCanonicalDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        // Obtener host y esquema actual
        $host = $request->getHost();
        $isHttps = $request->isSecure();

        // Solo aplicar redirección si estamos en producción
        if (app()->environment() === 'production') {
            $canonicalHost = parse_url(config('app.url'), PHP_URL_HOST);
            $canonicalScheme = parse_url(config('app.url'), PHP_URL_SCHEME) ?: 'https';

            // Redirigir solo si el host o esquema es diferente del canonical
            if ($host !== $canonicalHost || ($isHttps && $canonicalScheme === 'http') || (!$isHttps && $canonicalScheme === 'https')) {
                return redirect()->to(
                    $canonicalScheme . '://' . $canonicalHost . $request->getRequestUri(),
                    301
                );
            }
        }

        // En local o entornos distintos a producción, no redirigir
        return $next($request);
    }
}
