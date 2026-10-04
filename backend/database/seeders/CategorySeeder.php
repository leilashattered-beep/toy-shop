<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Плюшевые медведи', 'slug' => 'bears', 'description' => 'Классические мишки из мягкого плюша', 'sort_order' => 1],
            ['name' => 'Плюшевые коты', 'slug' => 'cats', 'description' => 'Мурчащие котики и кошечки', 'sort_order' => 2],
            ['name' => 'Капибары', 'slug' => 'capybaras', 'description' => 'Самые спокойные и обнимательные', 'sort_order' => 3],
            ['name' => 'Зайчики', 'slug' => 'bunnies', 'description' => 'Длинноухие друзья для малышей', 'sort_order' => 4],
            ['name' => 'Лисята', 'slug' => 'foxes', 'description' => 'Рыжие хитрецы с пушистым хвостом', 'sort_order' => 5],
            ['name' => 'Динозавры', 'slug' => 'dinosaurs', 'description' => 'Доисторические, но очень добрые', 'sort_order' => 6],
            ['name' => 'Аксолотли', 'slug' => 'axolotls', 'description' => 'Розовые улыбающиеся аксолотли', 'sort_order' => 7],
            ['name' => 'Игрушки-подушки', 'slug' => 'pillows', 'description' => 'Большие игрушки, на которых можно спать', 'sort_order' => 8],
            ['name' => 'Мини-игрушки', 'slug' => 'minis', 'description' => 'Маленькие подарки и брелоки', 'sort_order' => 9],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
