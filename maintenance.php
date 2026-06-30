<?php
// ruta: /home/zanhywul/viajesatalanta.com/maintenance.php

$file = __DIR__ . '/storage/framework/down';

$data = [
    'time' => time(),
    'message' => 'Mantenimiento',
    'retry' => 60, // opcional
    'secret' => 'mi-token-secreto',
];

file_put_contents($file, json_encode($data));
