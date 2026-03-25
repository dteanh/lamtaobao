#!/usr/bin/env bash
set -euo pipefail

STORE_SERVICE="${PROD_STOREFRONT_SERVICE:-culi-storefront-production}"
ADMIN_SERVICE="${PROD_ADMIN_SERVICE:-culi-admin-production}"
NGINX_SERVICE="${PROD_NGINX_SERVICE:-nginx}"
NGINX_SITE_NAME="${NGINX_SITE_NAME:-culi-production.conf}"
NGINX_AVAILABLE="${NGINX_AVAILABLE:-/etc/nginx/sites-available/$NGINX_SITE_NAME}"
NGINX_ENABLED="${NGINX_ENABLED:-/etc/nginx/sites-enabled/$NGINX_SITE_NAME}"
STOP_PORT_3000="${STOP_PORT_3000:-true}"
STOP_PORT_3001="${STOP_PORT_3001:-true}"
RELOAD_NGINX="${RELOAD_NGINX:-false}"
RESTART_NGINX="${RESTART_NGINX:-true}"
RUN_SMOKE="${RUN_SMOKE:-false}"
PROD_STOREFRONT_URL="${PROD_STOREFRONT_URL:-}"
PROD_ADMIN_URL="${PROD_ADMIN_URL:-}"

usage() {
  cat <<'EOF'
Usage:
  deploy/enable-production-host.sh \
    [--store-service culi-storefront-production] \
    [--admin-service culi-admin-production] \
    [--nginx-site-name culi-production.conf] \
    [--restart-nginx | --reload-nginx] \
    [--run-smoke --store-url https://shop.example.com --admin-url https://admin.example.com]

Optional env inputs:
  PROD_STOREFRONT_SERVICE, PROD_ADMIN_SERVICE, PROD_NGINX_SERVICE,
  NGINX_SITE_NAME, NGINX_AVAILABLE, NGINX_ENABLED,
  PROD_STOREFRONT_URL, PROD_ADMIN_URL,
  RUN_SMOKE, RESTART_NGINX, RELOAD_NGINX,
  STOP_PORT_3000, STOP_PORT_3001

This script enables/starts the production host path from repo-side artifacts.
It does NOT claim production is live-successful unless separate smoke checks pass.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --store-service) STORE_SERVICE="$2"; shift 2 ;;
    --admin-service) ADMIN_SERVICE="$2"; shift 2 ;;
    --nginx-service) NGINX_SERVICE="$2"; shift 2 ;;
    --nginx-site-name) NGINX_SITE_NAME="$2"; NGINX_AVAILABLE="/etc/nginx/sites-available/$2"; NGINX_ENABLED="/etc/nginx/sites-enabled/$2"; shift 2 ;;
    --store-url) PROD_STOREFRONT_URL="$2"; shift 2 ;;
    --admin-url) PROD_ADMIN_URL="$2"; shift 2 ;;
    --run-smoke) RUN_SMOKE=true; shift ;;
    --reload-nginx) RELOAD_NGINX=true; RESTART_NGINX=false; shift ;;
    --restart-nginx) RESTART_NGINX=true; RELOAD_NGINX=false; shift ;;
    --no-stop-3000) STOP_PORT_3000=false; shift ;;
    --no-stop-3001) STOP_PORT_3001=false; shift ;;
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

require_file() {
  local label="$1"
  local path="$2"
  if [ ! -f "$path" ]; then
    echo "Missing file for $label: $path" >&2
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

prepare_nginx_site() {
  require_file NGINX_AVAILABLE "$NGINX_AVAILABLE"
  ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
  nginx -t
}

stop_conflicting_ports_if_requested() {
  if [ "$STOP_PORT_3000" = "true" ]; then
    fuser -k 3000/tcp || true
  fi
  if [ "$STOP_PORT_3001" = "true" ]; then
    fuser -k 3001/tcp || true
  fi
}

start_services() {
  systemctl daemon-reload
  systemctl enable --now "$STORE_SERVICE" "$ADMIN_SERVICE"
}

reload_or_restart_nginx() {
  if [ "$RELOAD_NGINX" = "true" ]; then
    systemctl reload "$NGINX_SERVICE"
  elif [ "$RESTART_NGINX" = "true" ]; then
    systemctl restart "$NGINX_SERVICE"
  fi
}

run_optional_smoke() {
  if [ "$RUN_SMOKE" != "true" ]; then
    return 0
  fi
  require_nonempty PROD_STOREFRONT_URL "$PROD_STOREFRONT_URL"
  require_nonempty PROD_ADMIN_URL "$PROD_ADMIN_URL"
  PROD_STOREFRONT_URL="$PROD_STOREFRONT_URL" PROD_ADMIN_URL="$PROD_ADMIN_URL" ./deploy/smoke-production.sh
}

summary() {
  cat <<EOF
enable-production-host: OK
- storefront_service: $STORE_SERVICE
- admin_service: $ADMIN_SERVICE
- nginx_site_enabled: $NGINX_ENABLED
- nginx_action: $( [ "$RELOAD_NGINX" = "true" ] && echo reload || [ "$RESTART_NGINX" = "true" ] && echo restart || echo none )
- smoke_ran: $RUN_SMOKE
NOTE: enable/start path completed. This does not by itself prove production live success.
EOF
}

main() {
  require_root
  prepare_nginx_site
  stop_conflicting_ports_if_requested
  start_services
  reload_or_restart_nginx
  run_optional_smoke
  summary
}

main "$@"
