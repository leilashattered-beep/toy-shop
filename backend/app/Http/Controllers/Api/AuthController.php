<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Регистрация покупателя.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->string('name')->trim()->value(),
            'email' => $request->string('email')->lower()->trim()->value(),
            'phone' => $request->input('phone'),
            'password' => $request->string('password')->value(),
            'role' => User::ROLE_USER,
        ]);

        $token = $user->createToken('softy-spa')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Вход в аккаунт.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->lower()->trim()->value())->first();

        if (! $user || ! Hash::check($request->string('password')->value(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Неверный email или пароль.',
            ]);
        }

        $token = $user->createToken('softy-spa')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Текущий пользователь.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadCount(['orders', 'reviews']);

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Выход — удаляем текущий токен.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Вы вышли из аккаунта.',
        ]);
    }

    /**
     * Обновление профиля.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'name' => $request->string('name')->trim()->value(),
            'email' => $request->string('email')->lower()->trim()->value(),
            'phone' => $request->input('phone'),
            'address' => $request->input('address'),
        ]);

        return response()->json([
            'message' => 'Профиль обновлён.',
            'user' => new UserResource($user->fresh()->loadCount(['orders', 'reviews'])),
        ]);
    }

    /**
     * Смена пароля.
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['password' => $request->string('password')->value()]);

        // Все прочие токены становятся недействительными.
        $user->tokens()->where('id', '!=', $user->currentAccessToken()?->id)->delete();

        return response()->json([
            'message' => 'Пароль изменён.',
        ]);
    }
}
