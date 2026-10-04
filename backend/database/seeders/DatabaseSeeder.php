<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    /**
     * Демонстрационные данные магазина Softy.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        Review::truncate();
        OrderItem::truncate();
        Order::truncate();
        Product::truncate();
        Category::truncate();
        User::truncate();

        Schema::enableForeignKeyConstraints();

        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
            ReviewSeeder::class,
        ]);

        $this->command?->info('Демо-данные Softy загружены.');
        $this->command?->info('Админ: '.env('SOFTY_ADMIN_EMAIL', 'admin@softy.local').' / '.env('SOFTY_ADMIN_PASSWORD', 'password'));
        $this->command?->info('Покупатель: '.env('SOFTY_DEMO_EMAIL', 'buyer@softy.local').' / '.env('SOFTY_DEMO_PASSWORD', 'password'));
    }
}
