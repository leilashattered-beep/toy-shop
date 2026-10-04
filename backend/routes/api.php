<?php

use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Публичный API магазина
|--------------------------------------------------------------------------
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
    'time' => now()->toIso8601String(),
]));

// Авторизация
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Каталог
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/filters', [ProductController::class, 'filters']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/{slug}/reviews', [ProductController::class, 'reviews']);

Route::get('/reviews/latest', [ReviewController::class, 'latest']);

// Оформление заказа (доступно и гостям, и авторизованным)
Route::post('/orders', [OrderController::class, 'store']);

/*
|--------------------------------------------------------------------------
| API для авторизованных пользователей
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);

    Route::get('/my/reviews', [ReviewController::class, 'mine']);
    Route::post('/products/{product:id}/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| API админ-панели (только администраторы)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminDashboardController::class, 'stats']);

    // Товары
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{product:id}', [AdminProductController::class, 'show']);
    Route::put('/products/{product:id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{product:id}', [AdminProductController::class, 'destroy']);
    Route::post('/products/{product:id}/image', [AdminProductController::class, 'uploadImage']);

    // Категории
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

    // Заказы
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
    Route::delete('/orders/{order}', [AdminOrderController::class, 'destroy']);

    // Пользователи
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);

    // Отзывы
    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy']);
});
