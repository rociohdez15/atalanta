<?php
// ruta: /home/zanhywul/viajesatalanta.com/run_resenas.php

use Illuminate\Foundation\Application;

// Cargamos el bootstrap de Laravel
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Creamos el Kernel de consola
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Ejecutamos el comando Artisan
$status = $kernel->call('resenas:recordatorio');

// Opcional: imprimir la salida
echo $kernel->output();
