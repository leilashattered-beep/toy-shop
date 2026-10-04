# Развёртывание Softy на VPS с панелью управления

Инструкция подходит для **ISPmanager, Plesk, FastPanel, aaPanel, HestiaCP, BrainyCP, VestaCP** —
меню называются по-разному, но шаги одинаковые.

Готовый архив для загрузки: **`softy-vps.zip`** (рядом с папкой проекта).
Внутри уже есть `backend/vendor` и собранный интерфейс `backend/public/spa`,
поэтому **composer и Node.js на сервере не обязательны**.

---

## Что нужно на VPS

| Компонент | Требование |
|---|---|
| PHP | 8.3 или новее (PHP-FPM) |
| Расширения PHP | `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl`, `zip`, `bcmath`, `xml`, `ctype`, `tokenizer` |
| База данных | MySQL 8 или MariaDB 10.6+ |
| Веб-сервер | Apache, Nginx или Nginx + Apache (как в панели) |

---

## Шаг 1. Создайте сайт в панели

Главное правило: **корень сайта — подкаталог `public`**, а не корень проекта.

| Панель | Что указать |
|---|---|
| ISPmanager | Сайты → Создать → «Каталог сайта» = `/var/www/softy/backend/public` |
| Plesk | Сайты → Добавить домен → «Корневой каталог документа» = `.../backend/public` |
| FastPanel | Сайты → Создать → «Директория» = `.../backend/public` |
| aaPanel | Website → Add site → Root directory = `.../backend/public` |
| HestiaCP | Web → Add domain → Custom document root = `.../backend/public` |

PHP выберите 8.3+ (в панели это отдельный селектор версии).

> Если корнем сайта сделать корень проекта, наружу попадут `.env`, `vendor` и исходники —
> так делать нельзя.

---

## Шаг 2. Создайте базу данных

1. Панель → **Базы данных** → создать БД (например `softy`), кодировка `utf8mb4`.
2. Создать пользователя БД и дать ему полные права на эту базу.
3. Запишите: имя базы, логин, пароль, хост (в панелях обычно `localhost`).

---

## Шаг 3. Загрузите файлы

1. Панель → **Файловый менеджер** (или SFTP/SSH) → каталог сайта, например `/var/www/softy`.
2. Загрузите `softy-vps.zip` и распакуйте. Должно получиться:

```
/var/www/softy/
├── backend/     ← корень сайта указывает на backend/public
├── frontend/    ← исходники React (на сервере не нужны, но пусть будут)
├── README.md
└── DEPLOY-VPS.md
```

3. При необходимости переименуйте каталог (`softy.ru` и т. п.) и поправьте путь в настройках домена.

---

## Шаг 4. Настройте `.env`

1. Скопируйте `backend/.env.production.example` → `backend/.env`.
2. Заполните:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=http://IP_ИЛИ_ДОМЕН
DB_DATABASE=softy
DB_USERNAME=пользователь_из_панели
DB_PASSWORD=пароль_из_панели
CORS_ALLOWED_ORIGINS=http://IP_ИЛИ_ДОМЕН
```

3. Сгенерируйте ключ приложения:

```bash
php artisan key:generate
```

---

## Шаг 5. Права на каталоги

Каталоги `storage` и `bootstrap/cache` должны быть доступны веб-серверу на запись:

```bash
chmod -R 775 storage bootstrap/cache
chown -R пользователь_сайта:пользователь_сайта storage bootstrap/cache
```

В ISPmanager/Plesk владельцем обычно должен быть пользователь сайта; в aaPanel/HestiaCP — `www-data`.

---

## Шаг 6. Миграции и администратор

Есть терминал/SSH в панели (обычно есть: «Терминал», «SSH-консоль», «Выполнить команду»):

```bash
cd /var/www/softy/backend
php artisan migrate --force
php artisan softy:admin admin@ваш-домен.ru --password=СильныйПароль
```

Команда `softy:admin` создаёт администратора или меняет пароль существующему —
**обязательно выполните её**, иначе останется демо-пароль `password`.

Можно просто запустить подготовленный скрипт, он сделает всё сразу:

```bash
cd /var/www/softy/backend
bash deploy.sh
```

Если PHP в панели не в PATH, укажите бинарник явно (узнать путь можно в настройках PHP в панели):

```bash
PHP_BIN=/opt/php8.3/bin/php bash deploy.sh
```

**Если терминала нет** — используйте «Планировщик задач / Cron» в панели:
создайте разовую задачу с командой

```
cd /var/www/softy/backend && php artisan migrate --force && php artisan softy:admin admin@ваш-домен.ru --password=СильныйПароль
```

запустите её вручную (кнопка «Выполнить») и удалите задачу.

---

## Шаг 7. Кэширование (продакшен)

```bash
cd /var/www/softy/backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

После **любого** изменения `.env` выполняйте `php artisan config:cache` заново,
иначе изменения не применятся.

---

## Шаг 8. SSL (HTTPS)

1. Панель → **SSL-сертификаты** → Let's Encrypt → выпустить для домена.
2. Включите перенаправление http → https.
3. Поменяйте в `.env`: `APP_URL=https://ваш-домен.ru` и
   `CORS_ALLOWED_ORIGINS=https://ваш-домен.ru`.
4. `php artisan config:cache`.

---

## Веб-сервер: нужно ли что-то дописывать

* **Apache** — ничего: файл `backend/public/.htaccess` уже настроен (Laravel сам
  отправляет все адреса в `index.php`, а `/api/*` обслуживается API).
* **Nginx** (и связка Nginx + Apache в ISPmanager/FastPanel) — в панели при создании сайта
  выберите шаблон **Laravel**, либо добавьте в конфиг сайта:

```nginx
root /var/www/softy/backend/public;
index index.php;

location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;  # путь подставьте свой, есть в панели
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}

location ~ /\.(?!well-known).* { deny all; }
```

---

## Что поменять сразу после установки

1. **Пароль администратора** — `php artisan softy:admin admin@ваш-домен.ru --password=...`
2. **`APP_DEBUG=false`** и `APP_ENV=production` (иначе ошибки видны посетителям).
3. Демо-данные (товары, заказы, отзывы) можно оставить как пример, а можно очистить:
   * удалить по одному в админ-панели, либо
   * `php artisan migrate:fresh --force` — создаст **пустую** базу без демо-данных,
     после чего заново создайте администратора командой `softy:admin`.
   * Демо-пользователи: `admin@softy.local`, `buyer@softy.local` (пароль `password`) —
     удалите их в разделе «Пользователи» админки.
4. Замените контакты в футере и на странице «О магазине» (`frontend/src/...`), если нужны свои.

---

## Обновление сайта

| Что изменилось | Что делать |
|---|---|
| Backend (PHP) | загрузить файлы, выполнить `php artisan migrate --force` (если есть миграции), затем `php artisan optimize:clear` |
| Frontend (React) | локально `npm run build` (сборка кладётся в `backend/public/spa`) и загрузить каталог `backend/public/spa` на сервер |
| `.env` | `php artisan config:cache` |

---

## Частые проблемы

| Симптом | Причина и решение |
|---|---|
| 403 или 404 на всех страницах | корень сайта не `backend/public` |
| Ошибка 500 сразу после загрузки | нет `APP_KEY` (`php artisan key:generate`), либо нет прав на `storage`/`bootstrap/cache` |
| «Не удалось подключиться к базе» | неверные `DB_*`; попробуйте `DB_HOST=localhost` вместо `127.0.0.1` (или наоборот) |
| Нет картинок и стилей | `APP_URL` не совпадает со схемой (http/https), в которой открыт сайт; после правки — `php artisan config:cache` |
| Не открывается админка | у пользователя роль `user`; создайте админа: `php artisan softy:admin ...` |
| Изменения в `.env` не применяются | забыли `php artisan config:cache` |
| Товар не сохраняется с картинкой | нет прав на запись в `public/uploads/products` |

---

## Если сайт должен работать по IP без домена

Просто укажите `APP_URL=http://IP-СЕРВЕРА` и добавьте тот же адрес в `CORS_ALLOWED_ORIGINS`.
Фронтенд обращается к API по относительному пути `/api`, поэтому менять его не нужно.
