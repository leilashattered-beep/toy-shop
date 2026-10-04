#!/usr/bin/env bash
#
# Деплой Softy на VPS.
# Запуск из каталога backend:  bash deploy.sh
#
# Что делает:
#   1) при отсутствии vendor ставит зависимости через composer;
#   2) при отсутствии .env создаёт его из .env.production.example и генерирует ключ;
#   3) выставляет права на storage и bootstrap/cache;
#   4) выполняет миграции;
#   5) собирает кэши конфигурации, маршрутов и шаблонов.
#
# Если PHP на сервере не в PATH, укажите путь явно:
#   PHP_BIN=/opt/php8.3/bin/php bash deploy.sh

set -euo pipefail

PHP_BIN="${PHP_BIN:-php}"
cd "$(dirname "$0")"

echo "==> Softy deploy"
$PHP_BIN -v | head -n 1

if ! command -v "$PHP_BIN" >/dev/null 2>&1; then
  echo "Не найден PHP ($PHP_BIN). Укажите путь: PHP_BIN=/usr/bin/php8.3 bash deploy.sh" >&2
  exit 1
fi

if [ ! -d vendor ]; then
  echo "==> Устанавливаю зависимости composer"
  if command -v composer >/dev/null 2>&1; then
    composer install --no-dev --optimize-autoloader --no-interaction
  else
    echo "Composer не найден, а каталог vendor отсутствует." >&2
    echo "Загрузите архив с vendor/ или установите composer." >&2
    exit 1
  fi
fi

if [ ! -f .env ]; then
  echo "==> Создаю .env из .env.production.example"
  cp .env.production.example .env
  $PHP_BIN artisan key:generate --force
  echo
  echo "!!! Откройте .env, укажите DB_DATABASE, DB_USERNAME, DB_PASSWORD, APP_URL"
  echo "!!! и запустите скрипт ещё раз: bash deploy.sh"
  exit 0
fi

echo "==> Каталоги хранения и права"
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "==> Миграции базы данных"
$PHP_BIN artisan migrate --force

echo "==> Кэширование"
$PHP_BIN artisan optimize:clear
$PHP_BIN artisan config:cache
$PHP_BIN artisan route:cache
$PHP_BIN artisan view:cache

echo
echo "Готово!"
echo "Создайте администратора:"
echo "  $PHP_BIN artisan softy:admin admin@ваш-домен.ru --password=СильныйПароль"
