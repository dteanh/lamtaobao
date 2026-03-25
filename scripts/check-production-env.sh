#!/usr/bin/env bash
set -euo pipefail
: "${ENV_FILE:=.env.production}"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi
set -a
. "$ENV_FILE"
set +a
required=(DATABASE_URL STOREFRONT_URL ADMIN_URL NEXTAUTH_URL NEXTAUTH_SECRET ADMIN_SESSION_SECRET AUTH_TRUST_HOST COOKIE_SECURE TRUST_PROXY HOSTNAME STOREFRONT_PORT ADMIN_PORT)
for key in "${required[@]}"; do
  val="${!key:-}"
  if [ -z "$val" ]; then
    echo "Missing required env: $key" >&2
    exit 1
  fi
done
for key in DATABASE_URL STOREFRONT_URL ADMIN_URL NEXTAUTH_URL NEXTAUTH_SECRET ADMIN_SESSION_SECRET; do
  val="${!key:-}"
  case "$val" in
    *CHANGE_ME*|*example.com*) echo "Unsafe placeholder still present in $key" >&2; exit 1 ;;
  esac
done
if [ "${NODE_ENV:-}" != "production" ]; then
  echo "NODE_ENV must be production" >&2
  exit 1
fi
if [ "${HOSTNAME:-}" != "127.0.0.1" ]; then
  echo "HOSTNAME must stay 127.0.0.1 behind reverse proxy" >&2
  exit 1
fi
if [ "${COOKIE_SECURE:-}" != "true" ]; then
  echo "COOKIE_SECURE must be true" >&2
  exit 1
fi
if [ "${TRUST_PROXY:-}" != "true" ]; then
  echo "TRUST_PROXY must be true" >&2
  exit 1
fi
echo "check-production-env: OK"
