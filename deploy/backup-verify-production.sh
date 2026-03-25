#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-/opt/culi-backups}"
ARG="${1:-latest}"
PROD_STOREFRONT_SERVICE="${PROD_STOREFRONT_SERVICE:-culi-storefront-production}"
PROD_ADMIN_SERVICE="${PROD_ADMIN_SERVICE:-culi-admin-production}"
PROD_NGINX_SITE="${PROD_NGINX_SITE:-/etc/nginx/sites-available/culi-production.conf}"
DB_DUMP_NAME="${DB_DUMP_NAME:-production.sql}"

resolve_src() {
  case "$ARG" in
    latest) readlink -f "$BACKUP_ROOT/latest" ;;
    /*) readlink -f "$ARG" ;;
    *) readlink -f "$BACKUP_ROOT/$ARG" ;;
  esac
}

SRC="$(resolve_src)"
if [ -z "$SRC" ] || [ ! -d "$SRC" ]; then
  echo "Backup source not found: $ARG" >&2
  exit 1
fi

ID="$(basename "$SRC")"
ID_FILE="$SRC/backup.id"
SQL_FILE="$SRC/db/$DB_DUMP_NAME"
ENV_FILE="$SRC/config/.env.production"
NGINX_FILE="$SRC/config/$(basename "$PROD_NGINX_SITE")"
SVC1="$SRC/config/$PROD_STOREFRONT_SERVICE.service"
SVC2="$SRC/config/$PROD_ADMIN_SERVICE.service"
CERT_DIR="$SRC/config/ssl-culi"
APP_DIR="$SRC/app/culi-commerce"

[ -f "$ID_FILE" ] || { echo "Missing backup id file: $ID_FILE" >&2; exit 1; }
[ -f "$SQL_FILE" ] || { echo "Missing SQL dump: $SQL_FILE" >&2; exit 1; }
[ -s "$SQL_FILE" ] || { echo "Empty SQL dump: $SQL_FILE" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Missing env backup: $ENV_FILE" >&2; exit 1; }
[ -f "$NGINX_FILE" ] || { echo "Missing nginx backup: $NGINX_FILE" >&2; exit 1; }
[ -f "$SVC1" ] || { echo "Missing storefront service backup: $SVC1" >&2; exit 1; }
[ -f "$SVC2" ] || { echo "Missing admin service backup: $SVC2" >&2; exit 1; }
[ -d "$CERT_DIR" ] || { echo "Missing TLS backup dir: $CERT_DIR" >&2; exit 1; }
[ -d "$APP_DIR" ] || { echo "Missing app backup dir: $APP_DIR" >&2; exit 1; }

grep -qx "$ID" "$ID_FILE" || { echo "backup.id mismatch: expected $ID" >&2; exit 1; }
grep -q '^DATABASE_URL=' "$ENV_FILE" || { echo "DATABASE_URL missing in $ENV_FILE" >&2; exit 1; }
grep -q '^NEXTAUTH_SECRET=' "$ENV_FILE" || { echo "NEXTAUTH_SECRET missing in $ENV_FILE" >&2; exit 1; }
grep -q '^ADMIN_SESSION_SECRET=' "$ENV_FILE" || { echo "ADMIN_SESSION_SECRET missing in $ENV_FILE" >&2; exit 1; }
grep -q 'server_name ' "$NGINX_FILE" || { echo "server_name missing in $NGINX_FILE" >&2; exit 1; }
grep -q "Description=Culi Storefront Production" "$SVC1" || { echo "Unexpected storefront service artifact: $SVC1" >&2; exit 1; }
grep -q "Description=Culi Admin Production" "$SVC2" || { echo "Unexpected admin service artifact: $SVC2" >&2; exit 1; }
head -n 5 "$SQL_FILE" >/dev/null

echo "backup-verify-production: OK $SRC"
