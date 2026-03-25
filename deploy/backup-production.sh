#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/culi-commerce}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/culi-backups}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
TARGET="$BACKUP_ROOT/$STAMP"
ENV_FILE="${ENV_FILE:-$APP_ROOT/.env.production}"
PROD_STOREFRONT_SERVICE="${PROD_STOREFRONT_SERVICE:-culi-storefront-production}"
PROD_ADMIN_SERVICE="${PROD_ADMIN_SERVICE:-culi-admin-production}"
PROD_NGINX_SITE="${PROD_NGINX_SITE:-/etc/nginx/sites-available/culi-production.conf}"
PROD_SSL_DIR="${PROD_SSL_DIR:-/etc/ssl/culi}"
DB_DUMP_NAME="${DB_DUMP_NAME:-production.sql}"
mkdir -p "$TARGET"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

DATABASE_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | sed 's/^DATABASE_URL=//' | sed 's/^"//' | sed 's/"$//')
DB_DUMP_URL=$(printf "%s" "$DATABASE_URL" | sed -E 's/[?&]schema=[^&]*//g' | sed -E 's/\?$//')
if [ -z "$DATABASE_URL" ]; then
  echo 'DATABASE_URL missing in .env.production' >&2
  exit 1
fi

mkdir -p "$TARGET/app" "$TARGET/config" "$TARGET/db"

echo "$STAMP" > "$TARGET/backup.id"
cp "$ENV_FILE" "$TARGET/config/.env.production"
[ -f "/etc/systemd/system/$PROD_STOREFRONT_SERVICE.service" ] && cp "/etc/systemd/system/$PROD_STOREFRONT_SERVICE.service" "$TARGET/config/$PROD_STOREFRONT_SERVICE.service"
[ -f "/etc/systemd/system/$PROD_ADMIN_SERVICE.service" ] && cp "/etc/systemd/system/$PROD_ADMIN_SERVICE.service" "$TARGET/config/$PROD_ADMIN_SERVICE.service"
[ -f "$PROD_NGINX_SITE" ] && cp "$PROD_NGINX_SITE" "$TARGET/config/$(basename "$PROD_NGINX_SITE")"
[ -d "$PROD_SSL_DIR" ] && cp -a "$PROD_SSL_DIR" "$TARGET/config/ssl-culi"
rsync -a "$APP_ROOT/" "$TARGET/app/culi-commerce/" --delete --exclude node_modules --exclude .cache --exclude .next --exclude deploy/certs
pg_dump "$DB_DUMP_URL" > "$TARGET/db/$DB_DUMP_NAME"
ln -sfn "$TARGET" "$BACKUP_ROOT/latest"

echo "$TARGET"
