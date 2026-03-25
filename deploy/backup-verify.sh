#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-/opt/culi-backups}"
ARG="${1:-latest}"
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

ID=$(basename "$SRC")
ID_FILE="$SRC/backup.id"
SQL_FILE="$SRC/db/staging.sql"
ENV_FILE="$SRC/config/.env.production"
NGINX_FILE="$SRC/config/culi-staging.conf"
SVC1="$SRC/config/culi-storefront-staging.service"
SVC2="$SRC/config/culi-admin-staging.service"
CERT_DIR="$SRC/config/ssl-culi"
APP_DIR="$SRC/app/culi-commerce"

[ -f "$ID_FILE" ]
[ -f "$SQL_FILE" ]
[ -s "$SQL_FILE" ]
[ -f "$ENV_FILE" ]
[ -f "$NGINX_FILE" ]
[ -f "$SVC1" ]
[ -f "$SVC2" ]
[ -d "$CERT_DIR" ]
[ -d "$APP_DIR" ]

grep -qx "$ID" "$ID_FILE"
grep -q '^DATABASE_URL=' "$ENV_FILE"
grep -q 'server_name staging.45.77.32.128.sslip.io' "$NGINX_FILE"
grep -q 'Description=Culi Storefront Staging' "$SVC1"
grep -q 'Description=Culi Admin Staging' "$SVC2"
head -n 5 "$SQL_FILE" >/dev/null

echo "backup-verify: OK $SRC"
