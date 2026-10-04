<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CreateAdmin extends Command
{
    /**
     * Создаёт администратора или меняет пароль существующему.
     */
    protected $signature = 'softy:admin
        {email : Email администратора}
        {--password= : Пароль. Если не указать — будет сгенерирован}
        {--name= : Имя администратора}';

    protected $description = 'Создать администратора Softy или обновить его пароль';

    public function handle(): int
    {
        $email = Str::lower(trim((string) $this->argument('email')));
        $password = (string) ($this->option('password') ?: Str::password(12));
        $name = (string) ($this->option('name') ?: 'Администратор Softy');

        $validator = Validator::make(
            ['email' => $email, 'password' => $password, 'name' => $name],
            [
                'email' => ['required', 'email', 'max:150'],
                'password' => ['required', 'string', 'min:8', 'max:100'],
                'name' => ['required', 'string', 'min:2', 'max:100'],
            ],
            [
                'email.required' => 'Укажите email администратора.',
                'email.email' => 'Некорректный email.',
                'email.max' => 'Email слишком длинный (максимум 150 символов).',
                'password.required' => 'Укажите пароль.',
                'password.min' => 'Пароль должен быть не короче 8 символов.',
                'password.max' => 'Пароль слишком длинный (максимум 100 символов).',
                'name.required' => 'Укажите имя администратора.',
                'name.min' => 'Имя слишком короткое.',
                'name.max' => 'Имя слишком длинное.',
            ]
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->update([
                'name' => $name,
                'password' => $password,
                'role' => User::ROLE_ADMIN,
            ]);
            $this->info("Пароль обновлён. Пользователь {$email} теперь администратор.");
        } else {
            User::create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'role' => User::ROLE_ADMIN,
            ]);
            $this->info("Администратор {$email} создан.");
        }

        $this->newLine();
        $this->line('  Логин:  '.$email);
        $this->line('  Пароль: '.$password);
        $this->newLine();
        $this->warn('Сохраните пароль — он больше не будет показан.');

        return self::SUCCESS;
    }
}
