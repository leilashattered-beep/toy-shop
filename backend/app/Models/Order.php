<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_NEW = 'new';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_SHIPPED = 'shipped';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    /** Список статусов заказа. */
    public const STATUSES = [
        self::STATUS_NEW,
        self::STATUS_PROCESSING,
        self::STATUS_SHIPPED,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
    ];

    /** Русские подписи статусов. */
    public const STATUS_LABELS = [
        self::STATUS_NEW => 'Новый',
        self::STATUS_PROCESSING => 'В обработке',
        self::STATUS_SHIPPED => 'Отправлен',
        self::STATUS_COMPLETED => 'Выполнен',
        self::STATUS_CANCELLED => 'Отменён',
    ];

    protected $fillable = [
        'user_id',
        'customer_name',
        'total_price',
        'status',
        'address',
        'phone',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
        ];
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }

    /** Покупатель. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Позиции заказа. */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
