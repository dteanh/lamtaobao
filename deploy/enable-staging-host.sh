#!/usr/bin/env bash
set -euo pipefail

fuser -k 3000/tcp || true
fuser -k 3001/tcp || true
systemctl daemon-reload
systemctl enable --now culi-storefront-staging
systemctl enable --now culi-admin-staging
systemctl restart nginx
sleep 3

curl -kfsS https://admin-staging.45.77.32.128.sslip.io/api/system/health
curl -kfsSI https://staging.45.77.32.128.sslip.io/ | sed -n '1,8p'
