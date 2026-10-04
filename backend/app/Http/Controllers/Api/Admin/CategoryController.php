<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
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

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create([
            'name' => $request->string('name')->trim()->value(),
            'slug' => $this->makeSlug($request->input('slug'), $request->string('name')->value()),
            'description' => $request->input('description'),
            'sort_order' => (int) $request->integer('sort_order', 0),
        ]);

        return response()->json([
            'message' => 'Категория создана.',
            'data' => (new CategoryResource($category->loadCount('products')))->resolve(),
        ], 201);
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $slug = $request->filled('slug')
            ? Str::slug($request->string('slug')->value())
            : $category->slug;

        $category->update([
            'name' => $request->string('name')->trim()->value(),
            'slug' => $this->makeSlug($slug, $request->string('name')->value(), $category->id),
            'description' => $request->input('description'),
            'sort_order' => (int) $request->integer('sort_order', $category->sort_order),
        ]);

        return response()->json([
            'message' => 'Категория обновлена.',
            'data' => (new CategoryResource($category->fresh()->loadCount('products')))->resolve(),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Нельзя удалить категорию, пока в ней есть товары. Перенесите или удалите их.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Категория удалена.',
        ]);
    }

    /**
     * Уникальный slug для категории.
     */
    private function makeSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $name) ?: 'category';
        $result = $base;
        $index = 2;

        while (
            Category::query()
                ->where('slug', $result)
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->exists()
        ) {
            $result = $base.'-'.$index++;
        }

        return $result;
    }
}
