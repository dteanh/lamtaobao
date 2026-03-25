#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-/opt/culi-backups}"
KEEP="${1:-${KEEP:-5}}"

if ! printf '%s' "$KEEP" | grep -Eq '^[0-9]+$'; then
  echo "KEEP must be an integer" >&2
  exit 1
fi

mkdir -p "$BACKUP_ROOT"
mapfile -t DIRS < <(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r)
COUNT=${#DIRS[@]}

echo "backup-prune: found $COUNT backups, keep $KEEP"
if [ "$COUNT" -le "$KEEP" ]; then
  echo 'backup-prune: nothing to prune'
  exit 0
fi

for dir in "${DIRS[@]:KEEP}"; do
  rm -rf "$BACKUP_ROOT/$dir"
  echo "pruned: $BACKUP_ROOT/$dir"
done

echo 'backup-prune: OK'
