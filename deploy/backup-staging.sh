#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/culi-commerce}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/culi-backups}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
TARGET="$BACKUP_ROOT/$STAMP"
ENV_FILE="$APP_ROOT/.env.production"
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
cp /etc/systemd/system/culi-storefront-staging.service "$TARGET/config/culi-storefront-staging.service"
cp /etc/systemd/system/culi-admin-staging.service "$TARGET/config/culi-admin-staging.service"
cp /etc/nginx/sites-available/culi-staging.conf "$TARGET/config/culi-staging.conf"
cp -a /etc/ssl/culi "$TARGET/config/ssl-culi"
rsync -a "$APP_ROOT/" "$TARGET/app/culi-commerce/" --delete --exclude node_modules --exclude .cache --exclude .next --exclude deploy/certs
pg_dump "$DB_DUMP_URL" > "$TARGET/db/staging.sql"
ln -sfn "$TARGET" "$BACKUP_ROOT/latest"

echo "$TARGET"
