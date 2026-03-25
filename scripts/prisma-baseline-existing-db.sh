#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${ENV_FILE:=.env.production}"
set -a
. "$ENV_FILE"
set +a
pnpm --filter @culi/db exec prisma migrate resolve --applied 0001_init --schema prisma/schema.prisma
pnpm --filter @culi/db exec prisma migrate deploy --schema prisma/schema.prisma
