#!/bin/bash
# Автонастройка проекта softy на Debian (nginx + PHP-FPM + MariaDB)
set -e

APP=/var/www/softy
SITE_IP=10.31.0.68
DB_PASS=$(openssl rand -hex 8)

echo "== 1. База данных =="
mariadb -e "CREATE DATABASE IF NOT EXISTS softy CHARACTER SET utf8mb4;"
mariadb -e "CREATE USER IF NOT EXISTS 'softy'@'localhost' IDENTIFIED BY '$DB_PASS';"
mariadb -e "ALTER USER 'softy'@'localhost' IDENTIFIED BY '$DB_PASS';"
mariadb -e "GRANT ALL ON softy.* TO 'softy'@'localhost'; FLUSH PRIVILEGES;"

echo "== 2. Файл .env =="
cd $APP/backend
cp -n .env.production.example .env
setenv() {
  if grep -q "^$1=" .env; then
    sed -i "s|^$1=.*|$1=$2|" .env
  else
    echo "$1=$2" >> .env
  fi
}
setenv APP_ENV production
setenv APP_DEBUG false
setenv APP_URL http://$SITE_IP
setenv DB_CONNECTION mysql
setenv DB_HOST 127.0.0.1
setenv DB_DATABASE softy
setenv DB_USERNAME softy
setenv DB_PASSWORD $DB_PASS
setenv CORS_ALLOWED_ORIGINS http://$SITE_IP

echo "== 3. Composer =="
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction

echo "== 4. Ключ и миграции =="
php artisan key:generate --force
php artisan migrate --force

echo "== 5. Права =="
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "== 6. Nginx =="
cat > /etc/nginx/sites-available/softy <<EOF
server {
    listen 80 default_server;
    server_name _;
    root $APP/backend/public;
    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
EOF
ln -sf /etc/nginx/sites-available/softy /etc/nginx/sites-enabled/softy
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart php8.4-fpm
systemctl restart nginx

echo ""
echo "ГОТОВО. Сайт: http://$SITE_IP"
