#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="${BACKUP_ROOT:-/opt/culi-backups}"
if [ ! -d "$BACKUP_ROOT" ]; then
  echo "No backup root: $BACKUP_ROOT" >&2
  exit 1
fi

find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d | sort -r | while read -r dir; do
  id=$(basename "$dir")
  sql="$dir/db/staging.sql"
  envf="$dir/config/.env.production"
  size=$( [ -f "$sql" ] && du -h "$sql" | awk '{print $1}' || echo '-' )
  has_env=$( [ -f "$envf" ] && echo yes || echo no )
  has_id=$( [ -f "$dir/backup.id" ] && echo yes || echo no )
  latest_mark=$( [ "$(readlink -f "$BACKUP_ROOT/latest" 2>/dev/null || true)" = "$(readlink -f "$dir")" ] && echo latest || echo '' )
  printf '%s\t%s\tsql:%s\tenv:%s\tid:%s\t%s\n' "$id" "$dir" "$size" "$has_env" "$has_id" "$latest_mark"
done
