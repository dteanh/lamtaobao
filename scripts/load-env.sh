#!/usr/bin/env sh
set -a
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
if [ -n "${ENV_FILE:-}" ] && [ -f "$ENV_FILE" ]; then
  . "$ENV_FILE"
elif [ -n "${ENV_FILE:-}" ] && [ -f "$WORKSPACE_ROOT/$ENV_FILE" ]; then
  . "$WORKSPACE_ROOT/$ENV_FILE"
elif [ -f "$WORKSPACE_ROOT/.env" ]; then
  . "$WORKSPACE_ROOT/.env"
fi
set +a
exec "$@"
