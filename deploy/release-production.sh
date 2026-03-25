#!/usr/bin/env bash
set -euo pipefail
: "${ENV_FILE:=.env.production}"
: "${BACKUP_CMD:?set BACKUP_CMD}"
: "${BUILD_CMD:?set BUILD_CMD}"
: "${RESTART_CMD:?set RESTART_CMD}"
: "${SMOKE_CMD:?set SMOKE_CMD}"
: "${ROLLBACK_CMD:?set ROLLBACK_CMD}"
: "${WAIT_CMD:=true}"

./scripts/check-production-env.sh

echo '[1/6] backup'
BACKUP_RESULT=$(eval "$BACKUP_CMD")
echo "$BACKUP_RESULT"

echo '[2/6] migrate+build'
eval "$BUILD_CMD"

echo '[3/6] restart'
eval "$RESTART_CMD"

echo '[4/6] wait'
eval "$WAIT_CMD"

echo '[5/6] smoke'
if eval "$SMOKE_CMD"; then
  echo 'release-production: OK'
  exit 0
fi

echo '[6/6] smoke failed -> rollback'
eval "$ROLLBACK_CMD"
exit 1
