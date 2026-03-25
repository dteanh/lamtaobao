#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
APP_ROOT="/opt/culi-commerce"
SSL_DIR="/etc/ssl/culi"
NGINX_AVAILABLE="/etc/nginx/sites-available/culi-staging.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/culi-staging.conf"
STORE_DOMAIN="staging.45.77.32.128.sslip.io"
ADMIN_DOMAIN="admin-staging.45.77.32.128.sslip.io"
STORE_CERT="$SSL_DIR/staging.fullchain.pem"
STORE_KEY="$SSL_DIR/staging.key.pem"
ADMIN_CERT="$SSL_DIR/admin-staging.fullchain.pem"
ADMIN_KEY="$SSL_DIR/admin-staging.key.pem"

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Run as root" >&2
    exit 1
  fi
}

install_nginx_if_missing() {
  if ! command -v nginx >/dev/null 2>&1; then
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y nginx
  fi
  systemctl enable nginx
}

sync_app() {
  mkdir -p "$APP_ROOT"
  rsync -a --delete \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.turbo' \
    --exclude '.secrets' \
    --exclude '.env.production' \
    --exclude 'deploy/certs' \
    "$WORKSPACE_ROOT/" "$APP_ROOT/"
  cd "$APP_ROOT"
  corepack enable
  pnpm install --frozen-lockfile
}

ensure_env_production() {
  cd "$APP_ROOT"
  if [ ! -f .env.production ]; then
    if [ ! -f .env ]; then
      echo ".env missing; cannot derive .env.production" >&2
      exit 1
    fi
    set -a
    . ./.env
    set +a
    cat > .env.production <<ENVEOF
NODE_ENV=production
DATABASE_URL="${DATABASE_URL:-}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-${ADMIN_SESSION_SECRET:-change-me}}"
ADMIN_SESSION_SECRET="${ADMIN_SESSION_SECRET:-${NEXTAUTH_SECRET:-change-me}}"
NEXTAUTH_URL="https://${STORE_DOMAIN}"
STOREFRONT_URL="https://${STORE_DOMAIN}"
ADMIN_URL="https://${ADMIN_DOMAIN}"
AUTH_TRUST_HOST="true"
COOKIE_SECURE="true"
TRUST_PROXY="true"
STOREFRONT_PORT="3000"
ADMIN_PORT="3001"
HOSTNAME="127.0.0.1"
ENVEOF
  fi
  chmod 600 .env.production
}

prepare_db_and_build() {
  cd "$APP_ROOT"
  ENV_FILE=.env.production pnpm db:generate
  if ! ENV_FILE=.env.production pnpm db:migrate:deploy; then
    ENV_FILE=.env.production ./scripts/prisma-baseline-existing-db.sh
  fi
  ENV_FILE=.env.production pnpm --filter @culi/storefront-default build
  ENV_FILE=.env.production pnpm --filter @culi/admin build
}

gen_or_copy_certs() {
  mkdir -p "$SSL_DIR"
  cd "$APP_ROOT"
  ./scripts/gen-staging-selfsigned-certs.sh
  install -m 644 deploy/certs/staging.fullchain.pem "$STORE_CERT"
  install -m 600 deploy/certs/staging.key.pem "$STORE_KEY"
  install -m 644 deploy/certs/admin-staging.fullchain.pem "$ADMIN_CERT"
  install -m 600 deploy/certs/admin-staging.key.pem "$ADMIN_KEY"
}

install_units_and_nginx() {
  install -m 644 "$APP_ROOT/deploy/systemd/culi-storefront-staging.service" /etc/systemd/system/culi-storefront-staging.service
  install -m 644 "$APP_ROOT/deploy/systemd/culi-admin-staging.service" /etc/systemd/system/culi-admin-staging.service
  install -m 644 "$APP_ROOT/deploy/systemd/culi-staging-backup.service" /etc/systemd/system/culi-staging-backup.service
  install -m 644 "$APP_ROOT/deploy/systemd/culi-staging-backup-prune.service" /etc/systemd/system/culi-staging-backup-prune.service
  install -m 644 "$APP_ROOT/deploy/systemd/culi-staging-backup.timer" /etc/systemd/system/culi-staging-backup.timer
  install -m 644 "$APP_ROOT/deploy/systemd/culi-staging-backup-prune.timer" /etc/systemd/system/culi-staging-backup-prune.timer
  install -m 644 "$APP_ROOT/deploy/nginx/staging-tls.conf" "$NGINX_AVAILABLE"
  ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl daemon-reload
}

fix_permissions() {
  mkdir -p "$APP_ROOT/.cache/corepack" "$APP_ROOT/.cache/pnpm"
  chown -R www-data:www-data "$APP_ROOT"
  chmod 755 "$APP_ROOT"
}

main() {
  require_root
  install_nginx_if_missing
  sync_app
  ensure_env_production
  prepare_db_and_build
  gen_or_copy_certs
  install_units_and_nginx
  fix_permissions
  echo "install-staging-host: OK"
}

main "$@"
