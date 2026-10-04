<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Список категорий с количеством товаров.
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories)->resolve(),
        ]);
    }

    /**
     * Одна категория по slug.
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::query()
            ->withCount('products')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data' => (new CategoryResource($category))->resolve(),
        ]);
    }
}
