<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Список пользователей магазина.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->withCount(['orders', 'reviews'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $like = '%'.trim((string) $request->query('search')).'%';
                $query->where(fn ($inner) => $inner->where('name', 'like', $like)->orWhere('email', 'like', $like));
            })
            ->when($request->filled('role'), fn ($query) => $query->where('role', $request->query('role')))
            ->latest()
            ->get();

        return response()->json([
            'data' => UserResource::collection($users)->resolve(),
        ]);
    }

    /**
     * Смена роли пользователя.
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in([User::ROLE_USER, User::ROLE_ADMIN])],
        ], [], ['role' => 'роль']);

        if ($request->user()->id === $user->id && $validated['role'] !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Нельзя снять роль администратора с самого себя.',
            ], 422);
        }

        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => 'Роль обновлена.',
            'data' => (new UserResource($user->fresh()->loadCount(['orders', 'reviews'])))->resolve(),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Нельзя удалить собственную учётную запись.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Пользователь удалён.',
        ]);
    }
}
