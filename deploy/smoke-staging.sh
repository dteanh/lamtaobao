#!/usr/bin/env bash
set -euo pipefail

STORE_URL="${STORE_URL:-https://staging.45.77.32.128.sslip.io}"
ADMIN_URL="${ADMIN_URL:-https://admin-staging.45.77.32.128.sslip.io}"
CURL_FLAGS=(-kfsS)

echo '[1/8] admin health json'
ADMIN_HEALTH=$(curl "${CURL_FLAGS[@]}" "$ADMIN_URL/api/system/health")
echo "$ADMIN_HEALTH"

echo '[2/8] admin /login headers'
curl -kfsSI "$ADMIN_URL/login" | sed -n '1,12p'

echo '[3/8] admin /login body marker'
LOGIN_HTML=$(curl "${CURL_FLAGS[@]}" "$ADMIN_URL/login")
printf '%s\n' "$LOGIN_HTML" | grep -q 'Admin login'

echo '[4/8] admin /api/admin/csrf json'
CSRF_JSON=$(curl "${CURL_FLAGS[@]}" "$ADMIN_URL/api/admin/csrf")
printf '%s\n' "$CSRF_JSON"
printf '%s\n' "$CSRF_JSON" | grep -q 'token'

echo '[5/8] storefront / headers'
curl -kfsSI "$STORE_URL/" | sed -n '1,12p'

echo '[6/8] storefront /cart headers'
curl -kfsSI "$STORE_URL/cart" | sed -n '1,12p'

echo '[7/8] storefront /checkout headers'
curl -kfsSI "$STORE_URL/checkout" | sed -n '1,12p'

echo '[8/8] service status'
systemctl is-active culi-storefront-staging culi-admin-staging nginx

echo 'smoke-staging: OK'
