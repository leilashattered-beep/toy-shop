<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Веб-маршруты
|--------------------------------------------------------------------------
|
| Laravel отдаёт собранное React-приложение из public/spa.
| Сборка выполняется командой `npm run build` в каталоге frontend
| (Vite складывает результат в backend/public/spa).
|
*/

$serveSpa = function () {
    $index = public_path('spa/index.html');

    if (! File::exists($index)) {
        return response()->json([
            'message' => 'Фронтенд ещё не собран. Выполните `npm install && npm run build` в каталоге frontend.',
            'api' => url('/api/health'),
        ], 200);
    }

    return response()->file($index, ['Content-Type' => 'text/html; charset=UTF-8']);
};

Route::get('/', $serveSpa);

// Любой другой GET-адрес отдаёт React-роутер (SPA).
Route::fallback($serveSpa);
