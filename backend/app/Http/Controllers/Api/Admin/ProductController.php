<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Таблица товаров для админ-панели.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('per_page', 10), 1), 100);

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

        if ($request->filled('low_stock')) {
            $query->where('stock', '<=', (int) $request->integer('low_stock'));
        }

        $products = $query->orderByDesc('id')->paginate($perPage)->withQueryString();

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

    public function show(Product $product): JsonResponse
    {
        $product->load('category')->loadCount('reviews')->loadAvg('reviews', 'rating');

        return response()->json([
            'data' => (new ProductResource($product))->resolve(),
        ]);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $data = $this->payload($request);
        $product = Product::create($data);

        return response()->json([
            'message' => 'Товар добавлен.',
            'data' => (new ProductResource($product->load('category')))->resolve(),
        ], 201);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $data = $this->payload($request, $product);
        $product->update($data);

        return response()->json([
            'message' => 'Товар обновлён.',
            'data' => (new ProductResource(
                $product->fresh()->load('category')->loadCount('reviews')->loadAvg('reviews', 'rating')
            ))->resolve(),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Товар удалён.',
        ]);
    }

    /**
     * Загрузка изображения товара в public/uploads/products.
     */
    public function uploadImage(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg', 'max:4096'],
        ], [], ['image' => 'изображение']);

        $file = $request->file('image');
        $name = Str::slug($product->slug ?: $product->name).'-'.Str::random(6).'.'.$file->getClientOriginalExtension();

        $file->move(public_path('uploads/products'), $name);

        $product->update(['image' => '/uploads/products/'.$name]);

        return response()->json([
            'message' => 'Изображение обновлено.',
            'image' => $product->image,
            'data' => (new ProductResource($product->fresh()->load('category')))->resolve(),
        ]);
    }

    /**
     * Нормализация входных данных товара.
     */
    private function payload(ProductRequest $request, ?Product $product = null): array
    {
        $slug = $request->filled('slug')
            ? Str::slug($request->string('slug')->value())
            : ($product?->slug ?: Product::makeUniqueSlug($request->string('name')->value(), $product?->id));

        return [
            'category_id' => (int) $request->integer('category_id'),
            'name' => $request->string('name')->trim()->value(),
            'slug' => $slug,
            'description' => $request->string('description')->trim()->value(),
            'price' => (float) $request->input('price'),
            'old_price' => $request->filled('old_price') ? (float) $request->input('old_price') : null,
            'image' => $request->input('image') ?: $product?->image,
            'size' => $request->input('size'),
            'material' => $request->input('material'),
            'stock' => (int) $request->integer('stock'),
            'is_featured' => $request->boolean('is_featured'),
        ];
    }
}
