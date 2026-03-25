#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
APP_ROOT="${APP_ROOT:-/opt/culi-commerce}"
ENV_FILE="${ENV_FILE:-$APP_ROOT/.env.production}"
NGINX_SITE_NAME="${NGINX_SITE_NAME:-culi-production.conf}"
NGINX_AVAILABLE="${NGINX_AVAILABLE:-/etc/nginx/sites-available/$NGINX_SITE_NAME}"
NGINX_ENABLED="${NGINX_ENABLED:-/etc/nginx/sites-enabled/$NGINX_SITE_NAME}"
STORE_DOMAIN="${STOREFRONT_DOMAIN:-}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-}"
STORE_CERT="${STOREFRONT_CERT:-}"
STORE_KEY="${STOREFRONT_KEY:-}"
ADMIN_CERT="${ADMIN_CERT:-}"
ADMIN_KEY="${ADMIN_KEY:-}"
STORE_SERVICE="${PROD_STOREFRONT_SERVICE:-culi-storefront-production}"
ADMIN_SERVICE="${PROD_ADMIN_SERVICE:-culi-admin-production}"
RUNTIME_USER="${RUNTIME_USER:-www-data}"
RUNTIME_GROUP="${RUNTIME_GROUP:-www-data}"
INSTALL_NGINX="${INSTALL_NGINX:-true}"
SYNC_APP="${SYNC_APP:-true}"
RUN_INSTALL="${RUN_INSTALL:-true}"
RUN_BUILD="${RUN_BUILD:-true}"
RUN_DB_MIGRATE="${RUN_DB_MIGRATE:-true}"
ENABLE_SERVICES="${ENABLE_SERVICES:-false}"
RESTART_NGINX="${RESTART_NGINX:-false}"
REMOVE_DEFAULT_SITE="${REMOVE_DEFAULT_SITE:-false}"

usage() {
  cat <<'EOF'
Usage:
  deploy/install-production-host.sh \
    --store-domain shop.example.com \
    --admin-domain admin.example.com \
    --store-cert /path/fullchain.pem \
    --store-key /path/privkey.pem \
    --admin-cert /path/fullchain.pem \
    --admin-key /path/privkey.pem \
    [--app-root /opt/culi-commerce] \
    [--env-file /opt/culi-commerce/.env.production] \
    [--enable-services] \
    [--restart-nginx]

Required inputs can come from args or env:
  STOREFRONT_DOMAIN, ADMIN_DOMAIN,
  STOREFRONT_CERT, STOREFRONT_KEY,
  ADMIN_CERT, ADMIN_KEY

This script prepares the production host from repo-side artifacts.
It does NOT claim production cutover success by itself.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --store-domain) STORE_DOMAIN="$2"; shift 2 ;;
    --admin-domain) ADMIN_DOMAIN="$2"; shift 2 ;;
    --store-cert) STORE_CERT="$2"; shift 2 ;;
    --store-key) STORE_KEY="$2"; shift 2 ;;
    --admin-cert) ADMIN_CERT="$2"; shift 2 ;;
    --admin-key) ADMIN_KEY="$2"; shift 2 ;;
    --app-root) APP_ROOT="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    --nginx-site-name) NGINX_SITE_NAME="$2"; NGINX_AVAILABLE="/etc/nginx/sites-available/$2"; NGINX_ENABLED="/etc/nginx/sites-enabled/$2"; shift 2 ;;
    --store-service) STORE_SERVICE="$2"; shift 2 ;;
    --admin-service) ADMIN_SERVICE="$2"; shift 2 ;;
    --runtime-user) RUNTIME_USER="$2"; shift 2 ;;
    --runtime-group) RUNTIME_GROUP="$2"; shift 2 ;;
    --skip-install) RUN_INSTALL=false; shift ;;
    --skip-build) RUN_BUILD=false; shift ;;
    --skip-db-migrate) RUN_DB_MIGRATE=false; shift ;;
    --skip-app-sync) SYNC_APP=false; shift ;;
    --no-install-nginx) INSTALL_NGINX=false; shift ;;
    --enable-services) ENABLE_SERVICES=true; shift ;;
    --restart-nginx) RESTART_NGINX=true; shift ;;
    --remove-default-site) REMOVE_DEFAULT_SITE=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage >&2; exit 1 ;;
  esac
done

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Run as root" >&2
    exit 1
  fi
}

require_nonempty() {
  local name="$1"
  local value="$2"
  if [ -z "$value" ]; then
    echo "Missing required input: $name" >&2
    exit 1
  fi
}

require_file() {
  local label="$1"
  local path="$2"
  if [ ! -f "$path" ]; then
    echo "Missing file for $label: $path" >&2
    exit 1
  fi
}

install_nginx_if_missing() {
  if [ "$INSTALL_NGINX" != "true" ]; then
    return 0
  fi
  if ! command -v nginx >/dev/null 2>&1; then
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y nginx
  fi
  systemctl enable nginx
}

sync_app_tree() {
  if [ "$SYNC_APP" != "true" ]; then
    return 0
  fi
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
}

ensure_runtime_deps() {
  cd "$APP_ROOT"
  corepack enable
  if [ "$RUN_INSTALL" = "true" ]; then
    pnpm install --frozen-lockfile
  fi
}

validate_env_file() {
  require_file ENV_FILE "$ENV_FILE"
  (cd "$APP_ROOT" && ENV_FILE="$ENV_FILE" ./scripts/check-production-env.sh)
}

prepare_build() {
  cd "$APP_ROOT"
  ENV_FILE="$ENV_FILE" pnpm db:generate
  if [ "$RUN_DB_MIGRATE" = "true" ]; then
    ENV_FILE="$ENV_FILE" pnpm db:migrate:deploy
  fi
  if [ "$RUN_BUILD" = "true" ]; then
    ENV_FILE="$ENV_FILE" pnpm --filter @culi/storefront-default build
    ENV_FILE="$ENV_FILE" pnpm --filter @culi/admin build
  fi
}

render_nginx() {
  cd "$APP_ROOT"
  require_nonempty STOREFRONT_DOMAIN "$STORE_DOMAIN"
  require_nonempty ADMIN_DOMAIN "$ADMIN_DOMAIN"
  require_nonempty STOREFRONT_CERT "$STORE_CERT"
  require_nonempty STOREFRONT_KEY "$STORE_KEY"
  require_nonempty ADMIN_CERT "$ADMIN_CERT"
  require_nonempty ADMIN_KEY "$ADMIN_KEY"
  ./deploy/prepare-production-nginx.sh \
    --store-domain "$STORE_DOMAIN" \
    --admin-domain "$ADMIN_DOMAIN" \
    --store-cert "$STORE_CERT" \
    --store-key "$STORE_KEY" \
    --admin-cert "$ADMIN_CERT" \
    --admin-key "$ADMIN_KEY" \
    --out "$NGINX_AVAILABLE" \
    --verify-nginx
  ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
  if [ "$REMOVE_DEFAULT_SITE" = "true" ]; then
    rm -f /etc/nginx/sites-enabled/default
  fi
}

install_units() {
  install -m 644 "$APP_ROOT/deploy/systemd/culi-storefront-production.service" "/etc/systemd/system/$STORE_SERVICE.service"
  install -m 644 "$APP_ROOT/deploy/systemd/culi-admin-production.service" "/etc/systemd/system/$ADMIN_SERVICE.service"
  systemctl daemon-reload
}

fix_permissions() {
  mkdir -p "$APP_ROOT/.cache/corepack" "$APP_ROOT/.cache/pnpm"
  chown -R "$RUNTIME_USER:$RUNTIME_GROUP" "$APP_ROOT"
  chmod 755 "$APP_ROOT"
}

enable_services_if_requested() {
  if [ "$ENABLE_SERVICES" = "true" ]; then
    systemctl enable --now "$STORE_SERVICE" "$ADMIN_SERVICE"
  fi
  if [ "$RESTART_NGINX" = "true" ]; then
    systemctl restart nginx
  fi
}

summary() {
  cat <<EOF
install-production-host: OK
- app_root: $APP_ROOT
- env_file: $ENV_FILE
- nginx_available: $NGINX_AVAILABLE
- nginx_enabled: $NGINX_ENABLED
- storefront_service: $STORE_SERVICE
- admin_service: $ADMIN_SERVICE
- services_enabled: $ENABLE_SERVICES
- nginx_restarted: $RESTART_NGINX
NOTE: host bring-up prepared. This does not by itself prove production cutover success.
EOF
}

main() {
  require_root
  install_nginx_if_missing
  sync_app_tree
  ensure_runtime_deps
  validate_env_file
  prepare_build
  render_nginx
  install_units
  fix_permissions
  enable_services_if_requested
  summary
}

main "$@"
