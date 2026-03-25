#!/usr/bin/env bash
set -euo pipefail
mkdir -p deploy/certs
openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
  -keyout deploy/certs/staging.key.pem \
  -out deploy/certs/staging.fullchain.pem \
  -subj '/CN=staging.45.77.32.128.sslip.io' \
  -addext 'subjectAltName=DNS:staging.45.77.32.128.sslip.io'
openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
  -keyout deploy/certs/admin-staging.key.pem \
  -out deploy/certs/admin-staging.fullchain.pem \
  -subj '/CN=admin-staging.45.77.32.128.sslip.io' \
  -addext 'subjectAltName=DNS:admin-staging.45.77.32.128.sslip.io'
