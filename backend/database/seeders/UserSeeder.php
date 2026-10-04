<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = env('SOFTY_ADMIN_EMAIL', 'admin@softy.local');
        $adminPassword = env('SOFTY_ADMIN_PASSWORD', 'password');
        $buyerEmail = env('SOFTY_DEMO_EMAIL', 'buyer@softy.local');
        $buyerPassword = env('SOFTY_DEMO_PASSWORD', 'password');

        User::create([
            'name' => 'Администратор Softy',
            'email' => $adminEmail,
            'password' => $adminPassword,
            'role' => User::ROLE_ADMIN,
            'phone' => '+7 (900) 000-00-01',
            'address' => 'г. Курган, ул. Плюшевая, 1',
        ]);

        User::create([
            'name' => 'Анна Иванова',
            'email' => $buyerEmail,
            'password' => $buyerPassword,
            'role' => User::ROLE_USER,
            'phone' => '+7 (900) 123-45-67',
            'address' => 'г. Курган, ул. Мягкая, д. 12, кв. 5',
        ]);

        User::create([
            'name' => 'Мария Петрова',
            'email' => 'maria@softy.local',
            'password' => 'password',
            'role' => User::ROLE_USER,
            'phone' => '+7 (900) 222-33-44',
            'address' => 'г. Санкт-Петербург, Невский пр., д. 40, кв. 8',
        ]);

        User::create([
            'name' => 'Игорь Смирнов',
            'email' => 'igor@softy.local',
            'password' => 'password',
            'role' => User::ROLE_USER,
            'phone' => '+7 (900) 555-66-77',
            'address' => 'г. Казань, ул. Уютная, д. 7',
        ]);

        User::create([
            'name' => 'Ольга Кузнецова',
            'email' => 'olga@softy.local',
            'password' => 'password',
            'role' => User::ROLE_USER,
            'phone' => '+7 (900) 888-99-00',
            'address' => 'г. Екатеринбург, ул. Обнимашек, д. 3, кв. 21',
        ]);
    }
}
