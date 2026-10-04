<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            ['buyer@softy.local', 'bear-bublik', 5, 'Бублик просто чудо! Огромный, мягкий, шов аккуратный. Дочка не выпускает его из рук уже месяц.', 20],
            ['buyer@softy.local', 'cat-murchik', 4, 'Котик очень милый, но хотелось бы чуть побольше. Плюш приятный, не сыпется.', 18],
            ['buyer@softy.local', 'pillow-cloud', 5, 'Подушка-облако — лучшее приобретение. Спина перестала болеть за чтением, а кот спит на ней постоянно.', 6],
            ['maria@softy.local', 'fox-ryzhik', 5, 'Лиса восхитительная: хвост пушистый, окрас яркий. Пришла в красивой коробке с лентой.', 15],
            ['maria@softy.local', 'bunny-puh', 5, 'Зайчик очень нежный, ушки можно завязать. Ребёнок сам его укладывает спать.', 14],
            ['maria@softy.local', 'axolotl-aksel', 4, 'Аксолотль забавный и розовый, ровно как на фото. Чуть мягче, чем ожидала.', 4],
            ['igor@softy.local', 'dino-dino', 5, 'Динозавр супер! Сын называет его Дино и берёт в садик. Шипы мягкие, не мешают.', 10],
            ['igor@softy.local', 'bear-mint', 4, 'Мятный мишка красивого оттенка, бант держится. Немного помялся в дороге, но расправился.', 9],
            ['olga@softy.local', 'mini-capybara-pip', 5, 'Заказывала три мини-капибары в подарок коллегам — все в восторге!', 19],
            ['olga@softy.local', 'sloth-sonya', 5, 'Ленивец невероятно уютный, лапки длинные, сидит на полке как живой.', 17],
        ];

        $users = User::pluck('id', 'email');
        $products = Product::pluck('id', 'slug');

        foreach ($reviews as [$email, $slug, $rating, $text, $daysAgo]) {
            if (! isset($users[$email], $products[$slug])) {
                continue;
            }

            Review::create([
                'user_id' => $users[$email],
                'product_id' => $products[$slug],
                'rating' => $rating,
                'text' => $text,
                'created_at' => now()->subDays($daysAgo),
                'updated_at' => now()->subDays($daysAgo),
            ]);
        }
    }
}
