<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Каталог с поиском, фильтрами, сортировкой и постраничной навигацией.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('per_page', 12), 1), 48);

        $query = Product::query()
            ->with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->withSum('orderItems as sold_count', 'quantity')
            ->search($request->query('search'));

        if ($request->filled('category')) {
            $slug = $request->query('category');
            $query->whereHas('category', fn (Builder $inner) => $inner->where('slug', $slug));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->query('category_id'));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->query('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->query('max_price'));
        }

        if ($request->filled('size')) {
            $query->where('size', $request->query('size'));
        }

        if ($request->boolean('in_stock')) {
            $query->inStock();
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $this->applySort($query, (string) $request->query('sort', 'popular'));

        $products = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => ProductResource::collection($products->getCollection())->resolve(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Данные для панели фильтров каталога.
     */
    public function filters(): JsonResponse
    {
        return response()->json([
            'sizes' => Product::query()
                ->whereNotNull('size')
                ->distinct()
                ->orderBy('size')
                ->pluck('size')
                ->values(),
            'materials' => Product::query()
                ->whereNotNull('material')
                ->distinct()
                ->orderBy('material')
                ->pluck('material')
                ->values(),
            'price' => [
                'min' => (float) Product::query()->min('price'),
                'max' => (float) Product::query()->max('price'),
            ],
        ]);
    }

    /**
     * Карточка товара вместе с отзывами и похожими игрушками.
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $product = Product::query()
            ->with(['category', 'reviews' => fn ($query) => $query->with('user')->latest()])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('slug', $slug)
            ->firstOrFail();

        $user = $request->user();

        $related = Product::query()
            ->with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->limit(4)
            ->get();

        return response()->json([
            'data' => (new ProductResource($product))->resolve(),
            'related' => ProductResource::collection($related)->resolve(),
            'can_review' => $user ? $this->hasPurchased($user->id, $product->id) : false,
            'reviewed' => $user
                ? Review::where('user_id', $user->id)->where('product_id', $product->id)->exists()
                : false,
        ]);
    }

    /**
     * Отзывы конкретного товара.
     */
    public function reviews(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $reviews = $product->reviews()->with('user')->latest()->get();

        return response()->json([
            'data' => ReviewResource::collection($reviews)->resolve(),
        ]);
    }

    /**
     * Купил ли пользователь товар (для права на отзыв).
     */
    private function hasPurchased(int $userId, int $productId): bool
    {
        return Order::query()
            ->where('user_id', $userId)
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->whereHas('items', fn (Builder $query) => $query->where('product_id', $productId))
            ->exists();
    }

    /**
     * Сортировка каталога.
     */
    private function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('reviews_avg_rating')->orderByDesc('reviews_count'),
            'name' => $query->orderBy('name'),
            'new' => $query->orderByDesc('created_at'),
            default => $query->orderByDesc('sold_count')->orderByDesc('is_featured')->orderByDesc('created_at'),
        };
    }
}
