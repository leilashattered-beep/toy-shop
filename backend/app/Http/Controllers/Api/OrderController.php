<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Заказы текущего пользователя.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['items.product'])
            ->withCount('items')
            ->where('user_id', $request->user()->id)
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->query('status')))
            ->latest()
            ->get();

        return response()->json([
            'data' => OrderResource::collection($orders)->resolve(),
        ]);
    }

    /**
     * Один заказ пользователя.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 404);

        $order->load(['items.product', 'user']);

        return response()->json([
            'data' => (new OrderResource($order))->resolve(),
        ]);
    }

    /**
     * Оформление заказа из корзины.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $requested = collect($request->input('items', []))
            ->groupBy('product_id')
            ->map(fn ($rows, $productId) => [
                'product_id' => (int) $productId,
                'quantity' => (int) collect($rows)->sum('quantity'),
            ])
            ->values();

        $order = DB::transaction(function () use ($request, $requested) {
            $products = Product::query()
                ->whereIn('id', $requested->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $total = 0.0;
            $lines = [];

            foreach ($requested as $row) {
                $product = $products->get($row['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => 'Один из товаров больше недоступен.',
                    ]);
                }

                if ($product->stock < $row['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "«{$product->name}»: в наличии только {$product->stock} шт.",
                    ]);
                }

                $total += (float) $product->price * $row['quantity'];
                $lines[] = [
                    'product' => $product,
                    'quantity' => $row['quantity'],
                ];
            }

            $order = Order::create([
                'user_id' => $request->user()?->id,
                'customer_name' => $request->string('name')->trim()->value(),
                'total_price' => $total,
                'status' => Order::STATUS_NEW,
                'address' => $request->string('address')->trim()->value(),
                'phone' => $request->string('phone')->trim()->value(),
                'comment' => $request->input('comment'),
            ]);

            foreach ($lines as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'quantity' => $line['quantity'],
                    'price' => $line['product']->price,
                ]);

                $line['product']->decrement('stock', $line['quantity']);
            }

            return $order;
        });

        return response()->json([
            'message' => 'Заказ оформлен.',
            'order' => (new OrderResource($order->load(['items.product', 'user'])))->resolve(),
        ], 201);
    }

    /**
     * Отмена заказа покупателем (пока он не отправлен).
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 404);

        if (! in_array($order->status, [Order::STATUS_NEW, Order::STATUS_PROCESSING], true)) {
            return response()->json([
                'message' => 'Этот заказ уже нельзя отменить — свяжитесь с менеджером.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            $order->load('items.product');

            foreach ($order->items as $item) {
                $item->product?->increment('stock', $item->quantity);
            }

            $order->update(['status' => Order::STATUS_CANCELLED]);
        });

        return response()->json([
            'message' => 'Заказ отменён.',
            'data' => (new OrderResource($order->fresh()->load(['items.product', 'user'])))->resolve(),
        ]);
    }
}
