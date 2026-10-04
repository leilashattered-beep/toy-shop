# Softy — интернет-магазин мягких игрушек

Готовое веб-приложение: **React (SPA) + Laravel (API) + MySQL**.
Магазин с каталогом, корзиной, заказами, отзывами и отдельной админ-панелью.

```
softy/
├── backend/     Laravel 13 — API, миграции, сидеры, изображения товаров, собранный SPA
└── frontend/    React 18 + Vite — витрина и админ-панель
```

---

## 1. Установка зависимостей

Зависимости уже установлены (`backend/vendor`, `frontend/node_modules`).
Если нужно переустановить:

```powershell
# Backend
cd C:\Users\User\Desktop\softy\backend
composer install

# Frontend
cd C:\Users\User\Desktop\softy\frontend
npm install
```

Требования: **PHP 8.3+** (расширения `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `zip`, `curl`),
**Composer 2**, **Node.js 18+**, **MySQL 8** (или MariaDB 10.6+).

---

## 2. Создание и настройка базы MySQL

```sql
CREATE DATABASE softy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'softy'@'localhost' IDENTIFIED BY 'softy';
GRANT ALL PRIVILEGES ON softy.* TO 'softy'@'localhost';
FLUSH PRIVILEGES;
```

Через консоль OSPanel (кнопка «MySQL → Консоль») или через phpMyAdmin — достаточно выполнить
первую строку `CREATE DATABASE`, а в `.env` указать пользователя `root` с пустым паролем
(стандартные настройки OSPanel).

Таблицы создаются миграциями:

```powershell
cd C:\Users\User\Desktop\softy\backend
php artisan migrate:fresh --seed
```

Команда создаёт схему и заливает демо-данные (9 категорий, 15 игрушек, 5 пользователей,
9 заказов, отзывы).

### Структура базы

| Таблица | Поля | Связи |
|---|---|---|
| `users` | id, name, email, password, role, phone, address | → orders, → reviews |
| `categories` | id, name, slug, description | → products |
| `products` | id, category_id, name, slug, description, price, old_price, image, size, material, stock, is_featured | → categories, → order_items, → reviews |
| `orders` | id, user_id, customer_name, total_price, status, address, phone, comment, created_at | → users, → order_items |
| `order_items` | id, order_id, product_id, quantity, price | → orders, → products |
| `reviews` | id, user_id, product_id, rating, text, created_at | → users, → products |

Все связи реализованы внешними ключами (`ON DELETE CASCADE` / `SET NULL` / `RESTRICT`).

---

## 3. Настройка `.env`

Файл `backend/.env` уже создан и настроен для локальной разработки.
Основные параметры:

```dotenv
APP_URL=http://softy.local

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=softy
DB_USERNAME=softy       # для OSPanel обычно root
DB_PASSWORD=softy       # для OSPanel обычно пусто
```

Если БД называется иначе или другой пароль — поправьте значения и выполните:

```powershell
php artisan config:clear
```

---

## 4. Запуск Laravel

```powershell
cd C:\Users\User\Desktop\softy\backend
php artisan serve
```

API будет доступно на `http://127.0.0.1:8000` (проверка: `http://127.0.0.1:8000/api/health`).

Полезные команды:

```powershell
php artisan migrate:fresh --seed   # пересоздать базу с демо-данными
php artisan route:list --path=api  # список API-маршрутов
php artisan optimize:clear         # сбросить кэши
```

---

## 5. Запуск React

```powershell
cd C:\Users\User\Desktop\softy\frontend
npm run dev
```

Откройте `http://localhost:5173` — Vite проксирует `/api`, `/images`, `/storage`
на Laravel (адрес задаётся в `frontend/.env`, `VITE_PROXY_TARGET`).

Продакшен-сборка (кладётся в `backend/public/spa`, после неё сайт работает через OSPanel):

```powershell
npm run build
```

---

## 6. Открытие сайта через OSPanel

1. Установите OSPanel (OpenServer Panel), включите модули **PHP 8.3+**, **MySQL 8**, **Apache** (или Nginx).
2. Создайте домен: **Домены → Добавить**:
   - имя домена: `softy.local`
   - папка домена: `C:\Users\User\Desktop\softy\backend\public`
   - тип: Apache + PHP (или Nginx + PHP-FPM)
3. Перезапустите OSPanel — запись `127.0.0.1 softy.local` в `hosts` добавится автоматически.
4. Выполните миграции из консоли OSPanel (или обычного терминала):

   ```powershell
   cd C:\Users\User\Desktop\softy\backend
   php artisan migrate:fresh --seed
   ```

   Предварительно в `.env` укажите реквизиты MySQL из OSPanel (`DB_USERNAME=root`, `DB_PASSWORD=`).
5. Соберите фронтенд (один раз): `cd frontend; npm run build`.
6. Откройте **http://softy.local** — витрина, каталог и админ-панель работают через один домен:
   `/api/*` — Laravel API, остальные адреса — React-роутер.

Для живой разработки с OSPanel вместо сборки можно держать `npm run dev` и в
`frontend/.env` указать `VITE_PROXY_TARGET=http://softy.local`.

### Демо-доступы

| Роль | Логин | Пароль |
|---|---|---|
| Администратор | `admin@softy.local` | `password` |
| Покупатель | `buyer@softy.local` | `password` |

Покупатели: `maria@softy.local`, `igor@softy.local`, `olga@softy.local` — пароль `password`.

---

## Страницы сайта

**Витрина:** главная, каталог (поиск, фильтры по категориям/цене/размеру/наличию, сортировка,
пагинация), категории, страница товара с отзывами, корзина, оформление заказа, вход,
регистрация, личный кабинет, мои заказы, детали заказа, о магазине.

**Админ-панель (`/admin`):** статистика (товары, заказы, пользователи, отзывы, сумма заказов,
средний чек, остатки), товары (создание, редактирование, загрузка изображения, удаление,
быстрая смена цены и остатка), категории, заказы (смена статусов, удаление), отзывы, пользователи.

Статусы заказа: **Новый → В обработке → Отправлен → Выполнен / Отменён**.

---

## Развёртывание на VPS

Пошаговая инструкция для панелей управления (ISPmanager, Plesk, FastPanel, aaPanel, HestiaCP
и других) — в файле **[DEPLOY-VPS.md](DEPLOY-VPS.md)**. Готовый архив для загрузки через
файловый менеджер панели — `softy-vps.zip` (рядом с папкой проекта; внутри уже есть `vendor`
и собранный интерфейс, поэтому composer и Node.js на сервере не нужны).

Кратко, если ставите вручную и есть SSH:

1. Установите на сервере PHP 8.3 (fpm), MySQL 8, Nginx, Node.js.
2. Скопируйте проект (без `node_modules`), выполните `composer install --no-dev --optimize-autoloader`.
3. Создайте БД и настройте `.env`:

   ```dotenv
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=http://IP_СЕРВЕРА
   DB_HOST=127.0.0.1
   DB_DATABASE=softy
   DB_USERNAME=softy
   DB_PASSWORD=надёжный_пароль
   CORS_ALLOWED_ORIGINS=http://IP_СЕРВЕРА
   ```

4. `php artisan key:generate && php artisan migrate --force && php artisan db:seed --force`
   (сидер можно не запускать, если демо-данные не нужны).
5. `cd frontend && npm ci && npm run build` — собранная SPA попадёт в `backend/public/spa`.
6. Корень сайта в Nginx — каталог `backend/public`. Пример конфигурации:

   ```nginx
   server {
       listen 80;
       server_name 123.45.67.89;
       root /var/www/softy/backend/public;
       index index.php;

       location / { try_files $uri $uri/ /index.php?$query_string; }

       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/run/php/php8.3-fpm.sock;
       }

       location ~ /\.(?!well-known).* { deny all; }
   }
   ```

7. Права на запись: `chown -R www-data:www-data storage bootstrap/cache`.
8. Кэши продакшена: `php artisan config:cache && php artisan route:cache && php artisan view:cache`.

Фронтенд и API живут на одном домене, поэтому CORS не требуется.
Если React вынесен на отдельный домен — укажите его в `CORS_ALLOWED_ORIGINS`
и задайте `VITE_API_URL` при сборке фронтенда.
