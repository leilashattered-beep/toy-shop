<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'old_price' => $this->old_price !== null ? (float) $this->old_price : null,
            'image' => $this->image,
            'size' => $this->size,
            'material' => $this->material,
            'stock' => (int) $this->stock,
            'is_featured' => (bool) $this->is_featured,
            'rating' => round((float) ($this->reviews_avg_rating ?? 0), 1),
            'reviews_count' => (int) ($this->reviews_count ?? 0),
            'sold_count' => $this->when(isset($this->sold_count), fn () => (int) $this->sold_count),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
