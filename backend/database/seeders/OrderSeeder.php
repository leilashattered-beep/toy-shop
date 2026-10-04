<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $orders = [
            [
                'user' => 'buyer@softy.local',
                'status' => Order::STATUS_COMPLETED,
                'days_ago' => 26,
                'address' => 'г. Курган, ул. Мягкая, д. 12, кв. 5',
                'phone' => '+7 (900) 123-45-67',
                'comment' => 'Пожалуйста, подарочная упаковка',
                'items' => [['bear-bublik', 1], ['cat-murchik', 1]],
            ],
            [
                'user' => 'buyer@softy.local',
                'status' => Order::STATUS_SHIPPED,
                'days_ago' => 9,
                'address' => 'г. Курган, ул. Мягкая, д. 12, кв. 5',
                'phone' => '+7 (900) 123-45-67',
                'comment' => null,
                'items' => [['pillow-cloud', 1]],
            ],
            [
                'user' => 'buyer@softy.local',
                'status' => Order::STATUS_NEW,
                'days_ago' => 1,
                'address' => 'г. Курган, ул. Мягкая, д. 12, кв. 5',
                'phone' => '+7 (900) 123-45-67',
                'comment' => 'Позвонить за час до доставки',
                'items' => [['capybara-kapi', 1]],
            ],
            [
                'user' => 'maria@softy.local',
                'status' => Order::STATUS_COMPLETED,
                'days_ago' => 18,
                'address' => 'г. Санкт-Петербург, Невский пр., д. 40, кв. 8',
                'phone' => '+7 (900) 222-33-44',
                'comment' => null,
                'items' => [['fox-ryzhik', 1], ['bunny-puh', 1]],
            ],
            [
                'user' => 'maria@softy.local',
                'status' => Order::STATUS_COMPLETED,
                'days_ago' => 6,
                'address' => 'г. Санкт-Петербург, Невский пр., д. 40, кв. 8',
                'phone' => '+7 (900) 222-33-44',
                'comment' => null,
                'items' => [['axolotl-aksel', 1]],
            ],
            [
                'user' => 'igor@softy.local',
                'status' => Order::STATUS_COMPLETED,
                'days_ago' => 12,
                'address' => 'г. Казань, ул. Уютная, д. 7',
                'phone' => '+7 (900) 555-66-77',
                'comment' => 'Для подарка',
                'items' => [['dino-dino', 1], ['bear-mint', 1]],
            ],
            [
                'user' => 'igor@softy.local',
                'status' => Order::STATUS_PROCESSING,
                'days_ago' => 3,
                'address' => 'г. Казань, ул. Уютная, д. 7',
                'phone' => '+7 (900) 555-66-77',
                'comment' => null,
                'items' => [['mini-bear-tishka', 2]],
            ],
            [
                'user' => 'olga@softy.local',
                'status' => Order::STATUS_CANCELLED,
                'days_ago' => 5,
                'address' => 'г. Екатеринбург, ул. Обнимашек, д. 3, кв. 21',
                'phone' => '+7 (900) 888-99-00',
                'comment' => 'Отменила, нашла другую игрушку',
                'items' => [['turtle-timka', 1]],
            ],
            [
                'user' => 'olga@softy.local',
                'status' => Order::STATUS_COMPLETED,
                'days_ago' => 21,
                'address' => 'г. Екатеринбург, ул. Обнимашек, д. 3, кв. 21',
                'phone' => '+7 (900) 888-99-00',
                'comment' => null,
                'items' => [['mini-capybara-pip', 3], ['sloth-sonya', 1]],
            ],
        ];

        $users = User::pluck('id', 'email');
        $products = Product::get()->keyBy('slug');

        foreach ($orders as $data) {
            $createdAt = now()->subDays($data['days_ago']);
            $total = 0.0;
            $lines = [];

            foreach ($data['items'] as [$slug, $quantity]) {
                $product = $products->get($slug);
                if (! $product) {
                    continue;
                }

                $total += (float) $product->price * $quantity;
                $lines[] = ['product' => $product, 'quantity' => $quantity];
            }

            $order = Order::create([
                'user_id' => $users[$data['user']] ?? null,
                'customer_name' => User::where('email', $data['user'])->value('name') ?? 'Покупатель',
                'total_price' => $total,
                'status' => $data['status'],
                'address' => $data['address'],
                'phone' => $data['phone'],
                'comment' => $data['comment'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            foreach ($lines as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'quantity' => $line['quantity'],
                    'price' => $line['product']->price,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                if ($data['status'] !== Order::STATUS_CANCELLED) {
                    $line['product']->decrement('stock', $line['quantity']);
                }
            }
        }
    }
}
