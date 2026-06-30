<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\AuthJwt;
use App\Http\Middleware\ForceCanonicalDomain;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        api: __DIR__.'/../routes/api.php',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // CORS para web y api
        $middleware->web(append: \Illuminate\Http\Middleware\HandleCors::class);
        $middleware->api(append: \Illuminate\Http\Middleware\HandleCors::class);

        // 👉 Alias de middleware personalizado
        $middleware->alias([
            'auth.jwt' => AuthJwt::class,
            'admin' => IsAdmin::class,
        ]);

        // 🔹 Middleware global para forzar canonical
        $middleware->append(ForceCanonicalDomain::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
