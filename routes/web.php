<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Topbar\MensajesController;


Route::get('/{any}', function () {
    return view('welcome'); // Nombre de tu blade sin la extensión
})->where('any', '.*');

Route::post('/auth/login', [AuthController::class, 'login']);