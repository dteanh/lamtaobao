#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/culi-commerce}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/culi-backups}"
ARG="${1:-latest}"
PROD_STOREFRONT_SERVICE="${PROD_STOREFRONT_SERVICE:-culi-storefront-production}"
PROD_ADMIN_SERVICE="${PROD_ADMIN_SERVICE:-culi-admin-production}"
PROD_NGINX_SERVICE="${PROD_NGINX_SERVICE:-nginx}"
PROD_NGINX_SITE="${PROD_NGINX_SITE:-/etc/nginx/sites-available/culi-production.conf}"
PROD_SSL_DIR="${PROD_SSL_DIR:-/etc/ssl/culi}"
DB_DUMP_NAME="${DB_DUMP_NAME:-production.sql}"

resolve_src() {
  case "$ARG" in
    latest) readlink -f "$BACKUP_ROOT/latest" ;;
    /*) readlink -f "$ARG" ;;
    *) readlink -f "$BACKUP_ROOT/$ARG" ;;
  esac
}

SRC="$(resolve_src)"
if [ -z "$SRC" ] || [ ! -e "$SRC" ]; then
  echo "Backup source not found: $ARG" >&2
  exit 1
fi

ENV_FILE="$SRC/config/.env.production"
if [ ! -f "$ENV_FILE" ]; then
  echo "Backup env missing: $ENV_FILE" >&2
  exit 1
fi
DATABASE_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | sed 's/^DATABASE_URL=//' | sed 's/^"//' | sed 's/"$//')
DB_DUMP_URL=$(printf "%s" "$DATABASE_URL" | sed -E 's/[?&]schema=[^&]*//g' | sed -E 's/\?$//')
if [ -z "$DATABASE_URL" ]; then
  echo 'DATABASE_URL missing in backup env' >&2
  exit 1
fi
SQL_FILE="$SRC/db/$DB_DUMP_NAME"
if [ ! -s "$SQL_FILE" ]; then
  echo "Backup SQL missing: $SQL_FILE" >&2
  exit 1
fi

systemctl stop "$PROD_STOREFRONT_SERVICE" "$PROD_ADMIN_SERVICE" || true
rsync -a --delete --exclude node_modules --exclude .cache "$SRC/app/culi-commerce/" "$APP_ROOT/"
cp "$SRC/config/.env.production" "$APP_ROOT/.env.production"
[ -f "$SRC/config/$PROD_STOREFRONT_SERVICE.service" ] && cp "$SRC/config/$PROD_STOREFRONT_SERVICE.service" "/etc/systemd/system/$PROD_STOREFRONT_SERVICE.service"
[ -f "$SRC/config/$PROD_ADMIN_SERVICE.service" ] && cp "$SRC/config/$PROD_ADMIN_SERVICE.service" "/etc/systemd/system/$PROD_ADMIN_SERVICE.service"
systemctl daemon-reload
NGINX_BACKUP_FILE="$SRC/config/$(basename "$PROD_NGINX_SITE")"
[ -f "$NGINX_BACKUP_FILE" ] && cp "$NGINX_BACKUP_FILE" "$PROD_NGINX_SITE"
if [ -d "$SRC/config/ssl-culi" ]; then
  rm -rf "$PROD_SSL_DIR"
  cp -a "$SRC/config/ssl-culi" "$PROD_SSL_DIR"
fi
export DB_DUMP_URL
DB_META=$(python3 - <<'PY2'
from urllib.parse import urlsplit, urlunsplit
import os
url = os.environ['DB_DUMP_URL']
parts = urlsplit(url)
name = parts.path.rsplit('/', 1)[-1]
base = urlunsplit((parts.scheme, parts.netloc, '/postgres', parts.query, parts.fragment))
print(base)
print(name)
PY2
)
DB_BASE_URL=$(printf "%s" "$DB_META" | sed -n '1p')
DB_NAME=$(printf "%s" "$DB_META" | sed -n '2p')
psql "$DB_BASE_URL" -c "DROP DATABASE IF EXISTS \"$DB_NAME\" WITH (FORCE);" >/dev/null
psql "$DB_BASE_URL" -c "CREATE DATABASE \"$DB_NAME\";" >/dev/null
psql "$DB_DUMP_URL" < "$SQL_FILE" >/dev/null
chown -R www-data:www-data "$APP_ROOT"
systemctl restart "$PROD_NGINX_SERVICE"
fuser -k 3000/tcp || true
fuser -k 3001/tcp || true
systemctl enable --now "$PROD_STOREFRONT_SERVICE" "$PROD_ADMIN_SERVICE"
echo "rollback-production: OK from $SRC"
