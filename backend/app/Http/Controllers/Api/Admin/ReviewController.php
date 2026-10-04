<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Все отзывы магазина.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('per_page', 12), 1), 100);

        $reviews = Review::query()
            ->with(['user', 'product'])
            ->when($request->filled('rating'), fn ($query) => $query->where('rating', (int) $request->integer('rating')))
            ->when($request->filled('product_id'), fn ($query) => $query->where('product_id', (int) $request->integer('product_id')))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'data' => ReviewResource::collection($reviews->getCollection())->resolve(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json([
            'message' => 'Отзыв удалён.',
        ]);
    }
}
