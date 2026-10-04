<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'text',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    /** Автор отзыва. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Товар, о котором отзыв. */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeLatestFirst(Builder $query): Builder
    {
        return $query->orderByDesc('created_at');
    }
}
