#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/culi-commerce}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/culi-backups}"
ARG="${1:-latest}"

resolve_src() {
  case "$ARG" in
    latest)
      readlink -f "$BACKUP_ROOT/latest"
      ;;
    /*)
      readlink -f "$ARG"
      ;;
    *)
      readlink -f "$BACKUP_ROOT/$ARG"
      ;;
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

systemctl stop culi-storefront-staging culi-admin-staging || true
rsync -a --delete --exclude node_modules --exclude .cache "$SRC/app/culi-commerce/" "$APP_ROOT/"
cp "$SRC/config/.env.production" "$APP_ROOT/.env.production"
cp "$SRC/config/culi-storefront-staging.service" /etc/systemd/system/culi-storefront-staging.service
cp "$SRC/config/culi-admin-staging.service" /etc/systemd/system/culi-admin-staging.service
systemctl daemon-reload
cp "$SRC/config/culi-staging.conf" /etc/nginx/sites-available/culi-staging.conf
rm -rf /etc/ssl/culi
cp -a "$SRC/config/ssl-culi" /etc/ssl/culi
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
psql "$DB_DUMP_URL" < "$SRC/db/staging.sql" >/dev/null
chown -R www-data:www-data "$APP_ROOT"
systemctl restart nginx
fuser -k 3000/tcp || true
fuser -k 3001/tcp || true
systemctl enable --now culi-storefront-staging culi-admin-staging
sleep 3
./deploy/smoke-staging.sh

echo "rollback-staging: OK from $SRC"
