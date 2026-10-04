<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\UserResource;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Сводная статистика для главной страницы админ-панели.
     */
    public function stats(): JsonResponse
    {
        $revenue = (float) Order::query()
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->sum('total_price');

        $ordersCount = Order::count();
        $paidOrders = Order::query()->where('status', '!=', Order::STATUS_CANCELLED)->count();

        $lowStock = Product::query()
            ->with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('stock', '<=', 3)
            ->orderBy('stock')
            ->limit(6)
            ->get();

        $topProducts = Product::query()
            ->with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->withSum('orderItems as sold_count', 'quantity')
            ->orderByDesc('sold_count')
            ->limit(5)
            ->get();

        $recentOrders = Order::query()
            ->with(['user', 'items.product'])
            ->withCount('items')
            ->latest()
            ->limit(6)
            ->get();

        $recentReviews = Review::query()
            ->with(['user', 'product'])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'products' => Product::count(),
            'categories' => Category::count(),
            'orders' => $ordersCount,
            'users' => User::count(),
            'reviews' => Review::count(),
            'revenue' => round($revenue, 2),
            'orders_new' => Order::where('status', Order::STATUS_NEW)->count(),
            'orders_completed' => Order::where('status', Order::STATUS_COMPLETED)->count(),
            'average_check' => $paidOrders > 0 ? round($revenue / $paidOrders, 2) : 0,
            'low_stock_count' => Product::where('stock', '<=', 3)->count(),
            'low_stock' => ProductResource::collection($lowStock)->resolve(),
            'top_products' => ProductResource::collection($topProducts)->resolve(),
            'recent_orders' => OrderResource::collection($recentOrders)->resolve(),
            'recent_reviews' => ReviewResource::collection($recentReviews)->resolve(),
            'latest_users' => UserResource::collection(
                User::query()->withCount('orders')->latest()->limit(5)->get()
            )->resolve(),
            'statuses' => collect(Order::STATUS_LABELS)
                ->map(fn ($label, $status) => [
                    'status' => $status,
                    'label' => $label,
                    'count' => Order::where('status', $status)->count(),
                ])
                ->values(),
        ]);
    }
}
