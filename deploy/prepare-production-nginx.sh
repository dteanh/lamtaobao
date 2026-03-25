#!/usr/bin/env bash
set -euo pipefail

TEMPLATE="${TEMPLATE:-deploy/nginx/production-tls.conf}"
OUT="${OUT:-}"
STOREFRONT_DOMAIN="${STOREFRONT_DOMAIN:-}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-}"
STOREFRONT_CERT="${STOREFRONT_CERT:-}"
STOREFRONT_KEY="${STOREFRONT_KEY:-}"
ADMIN_CERT="${ADMIN_CERT:-}"
ADMIN_KEY="${ADMIN_KEY:-}"
VERIFY_NGINX="${VERIFY_NGINX:-false}"

usage() {
  cat <<'EOF'
Usage:
  deploy/prepare-production-nginx.sh \
    --store-domain shop.example.com \
    --admin-domain admin.example.com \
    --store-cert /path/fullchain.pem \
    --store-key /path/privkey.pem \
    --admin-cert /path/fullchain.pem \
    --admin-key /path/privkey.pem \
    --out /etc/nginx/sites-available/culi-production.conf \
    [--verify-nginx]

Inputs can come from either args or env:
  STOREFRONT_DOMAIN, ADMIN_DOMAIN,
  STOREFRONT_CERT, STOREFRONT_KEY,
  ADMIN_CERT, ADMIN_KEY,
  TEMPLATE, OUT, VERIFY_NGINX
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --store-domain) STOREFRONT_DOMAIN="$2"; shift 2 ;;
    --admin-domain) ADMIN_DOMAIN="$2"; shift 2 ;;
    --store-cert) STOREFRONT_CERT="$2"; shift 2 ;;
    --store-key) STOREFRONT_KEY="$2"; shift 2 ;;
    --admin-cert) ADMIN_CERT="$2"; shift 2 ;;
    --admin-key) ADMIN_KEY="$2"; shift 2 ;;
    --template) TEMPLATE="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    --verify-nginx) VERIFY_NGINX=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage >&2; exit 1 ;;
  esac
done

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

reject_placeholder() {
  local label="$1"
  local value="$2"
  case "$value" in
    *example.com*|*CHANGE_ME*|__*__)
      echo "Unsafe placeholder still present in $label: $value" >&2
      exit 1
      ;;
  esac
}

require_nonempty TEMPLATE "$TEMPLATE"
require_nonempty OUT "$OUT"
require_nonempty STOREFRONT_DOMAIN "$STOREFRONT_DOMAIN"
require_nonempty ADMIN_DOMAIN "$ADMIN_DOMAIN"
require_nonempty STOREFRONT_CERT "$STOREFRONT_CERT"
require_nonempty STOREFRONT_KEY "$STOREFRONT_KEY"
require_nonempty ADMIN_CERT "$ADMIN_CERT"
require_nonempty ADMIN_KEY "$ADMIN_KEY"

require_file TEMPLATE "$TEMPLATE"
require_file STOREFRONT_CERT "$STOREFRONT_CERT"
require_file STOREFRONT_KEY "$STOREFRONT_KEY"
require_file ADMIN_CERT "$ADMIN_CERT"
require_file ADMIN_KEY "$ADMIN_KEY"

reject_placeholder STOREFRONT_DOMAIN "$STOREFRONT_DOMAIN"
reject_placeholder ADMIN_DOMAIN "$ADMIN_DOMAIN"

mkdir -p "$(dirname "$OUT")"

python3 - "$TEMPLATE" "$OUT" "$STOREFRONT_DOMAIN" "$ADMIN_DOMAIN" "$STOREFRONT_CERT" "$STOREFRONT_KEY" "$ADMIN_CERT" "$ADMIN_KEY" <<'PY'
from pathlib import Path
import sys

template, out, store_domain, admin_domain, store_cert, store_key, admin_cert, admin_key = sys.argv[1:9]
text = Path(template).read_text()
replacements = {
    '__STOREFRONT_DOMAIN__': store_domain,
    '__ADMIN_DOMAIN__': admin_domain,
    '__STOREFRONT_CERT__': store_cert,
    '__STOREFRONT_KEY__': store_key,
    '__ADMIN_CERT__': admin_cert,
    '__ADMIN_KEY__': admin_key,
}
for old, new in replacements.items():
    text = text.replace(old, new)
if '__' in text:
    raise SystemExit('Unresolved placeholder remains in rendered nginx config')
Path(out).write_text(text)
PY

if [ "$VERIFY_NGINX" = "true" ]; then
  TMPDIR=$(mktemp -d)
  trap 'rm -rf "$TMPDIR"' EXIT
  export OUT
  RENDERED_PATH=$(python3 - <<'PY'
from pathlib import Path
import os
print(Path(os.environ['OUT']).resolve())
PY
)
  cat > "$TMPDIR/nginx.conf" <<EOF
worker_processes  1;
events { worker_connections 1024; }
http {
  include $RENDERED_PATH;
}
EOF
  nginx -t -c "$TMPDIR/nginx.conf"
fi

echo "prepare-production-nginx: OK -> $OUT"
