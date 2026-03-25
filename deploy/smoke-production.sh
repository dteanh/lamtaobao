#!/usr/bin/env bash
set -euo pipefail
: "${PROD_STOREFRONT_URL:?set PROD_STOREFRONT_URL}"
: "${PROD_ADMIN_URL:?set PROD_ADMIN_URL}"
: "${PROD_STOREFRONT_SERVICE:=culi-storefront-production}"
: "${PROD_ADMIN_SERVICE:=culi-admin-production}"
: "${PROD_NGINX_SERVICE:=nginx}"

echo '[1/8] admin health json'
ADMIN_HEALTH=$(curl -fsS "$PROD_ADMIN_URL/api/system/health")
echo "$ADMIN_HEALTH"

echo '[2/8] admin /login headers'
curl -fsSI "$PROD_ADMIN_URL/login" | sed -n '1,12p'

echo '[3/8] admin /login body marker'
LOGIN_HTML=$(curl -fsS "$PROD_ADMIN_URL/login")
printf '%s\n' "$LOGIN_HTML" | grep -q 'Admin login'

echo '[4/8] admin /api/admin/csrf json'
CSRF_JSON=$(curl -fsS "$PROD_ADMIN_URL/api/admin/csrf")
printf '%s\n' "$CSRF_JSON" | grep -q 'token'

echo '[5/8] storefront / headers'
curl -fsSI "$PROD_STOREFRONT_URL/" | sed -n '1,12p'

echo '[6/8] storefront /cart headers'
curl -fsSI "$PROD_STOREFRONT_URL/cart" | sed -n '1,12p'

echo '[7/8] storefront /checkout headers'
curl -fsSI "$PROD_STOREFRONT_URL/checkout" | sed -n '1,12p'

echo '[8/8] service status'
systemctl is-active "$PROD_STOREFRONT_SERVICE" "$PROD_ADMIN_SERVICE" "$PROD_NGINX_SERVICE"

echo 'smoke-production: OK'
