<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Последние отзывы магазина (для главной страницы).
     */
    public function latest(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->integer('limit', 6), 1), 24);

        $reviews = Review::query()
            ->with(['user', 'product'])
            ->where('rating', '>=', 4)
            ->latest()
            ->limit($limit)
            ->get();

        if ($reviews->isEmpty()) {
            $reviews = Review::query()->with(['user', 'product'])->latest()->limit($limit)->get();
        }

        return response()->json([
            'data' => ReviewResource::collection($reviews)->resolve(),
        ]);
    }

    /**
     * Отзывы текущего пользователя.
     */
    public function mine(Request $request): JsonResponse
    {
        $reviews = Review::query()
            ->with('product')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => ReviewResource::collection($reviews)->resolve(),
        ]);
    }

    /**
     * Оставить отзыв о купленном товаре.
     */
    public function store(StoreReviewRequest $request, Product $product): JsonResponse
    {
        $user = $request->user();

        $purchased = Order::query()
            ->where('user_id', $user->id)
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->whereHas('items', fn (Builder $query) => $query->where('product_id', $product->id))
            ->exists();

        if (! $purchased) {
            return response()->json([
                'message' => 'Отзыв можно оставить только после покупки этой игрушки.',
            ], 403);
        }

        if (Review::where('user_id', $user->id)->where('product_id', $product->id)->exists()) {
            return response()->json([
                'message' => 'Вы уже оставляли отзыв об этой игрушке.',
            ], 422);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => (int) $request->integer('rating'),
            'text' => $request->string('text')->trim()->value(),
        ]);

        return response()->json([
            'message' => 'Спасибо за отзыв!',
            'data' => (new ReviewResource($review->load(['user', 'product'])))->resolve(),
        ], 201);
    }

    /**
     * Удаление отзыва: автор или администратор.
     */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && $review->user_id !== $user->id) {
            return response()->json([
                'message' => 'Можно удалять только свои отзывы.',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Отзыв удалён.',
        ]);
    }
}
