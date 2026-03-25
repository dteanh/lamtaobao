#!/usr/bin/env bash
set -euo pipefail
cd /root/.openclaw/workspace
set -a
[ -f .env ] && . ./.env
set +a
/usr/bin/pnpm cleanup:reservations >> /root/.openclaw/workspace/.reservation-cleanup.log 2>&1
