<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Все заказы магазина с фильтром по статусу и поиском.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('per_page', 10), 1), 100);

        $orders = Order::query()
            ->with(['user', 'items.product'])
            ->withCount('items')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->query('status')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = trim((string) $request->query('search'));
                $like = '%'.$term.'%';

                $query->where(function ($inner) use ($like, $term) {
                    $inner->where('customer_name', 'like', $like)
                        ->orWhere('phone', 'like', $like)
                        ->orWhere('address', 'like', $like)
                        ->orWhereHas('user', function ($userQuery) use ($like) {
                            $userQuery->where('name', 'like', $like)->orWhere('email', 'like', $like);
                        });

                    if (ctype_digit($term)) {
                        $inner->orWhere('id', (int) $term);
                    }
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'data' => OrderResource::collection($orders->getCollection())->resolve(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['items.product', 'user']);

        return response()->json([
            'data' => (new OrderResource($order))->resolve(),
        ]);
    }

    /**
     * Смена статуса заказа.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Order::STATUSES)],
        ], [], ['status' => 'статус']);

        $previous = $order->status;

        DB::transaction(function () use ($order, $validated, $previous) {
            // При отмене возвращаем товары на склад, при «возврате в работу» — списываем снова.
            if ($validated['status'] === Order::STATUS_CANCELLED && $previous !== Order::STATUS_CANCELLED) {
                $order->load('items.product');
                foreach ($order->items as $item) {
                    $item->product?->increment('stock', $item->quantity);
                }
            }

            if ($previous === Order::STATUS_CANCELLED && $validated['status'] !== Order::STATUS_CANCELLED) {
                $order->load('items.product');
                foreach ($order->items as $item) {
                    $item->product?->decrement('stock', $item->quantity);
                }
            }

            $order->update(['status' => $validated['status']]);
        });

        return response()->json([
            'message' => 'Статус заказа обновлён.',
            'data' => (new OrderResource($order->fresh()->load(['items.product', 'user'])))->resolve(),
        ]);
    }

    public function destroy(Order $order): JsonResponse
    {
        DB::transaction(function () use ($order) {
            if ($order->status !== Order::STATUS_CANCELLED) {
                $order->load('items.product');
                foreach ($order->items as $item) {
                    $item->product?->increment('stock', $item->quantity);
                }
            }

            $order->delete();
        });

        return response()->json([
            'message' => 'Заказ удалён.',
        ]);
    }
}
