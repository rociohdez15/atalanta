<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * @var array|string|null
     */
    protected $proxies = '*'; // confiar en todos los proxies

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers = 0x1F; // todos los X-Forwarded headers
}
