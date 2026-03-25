#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${ENV_FILE:=.env.production}"
ENV_FILE="$ENV_FILE" pnpm install --frozen-lockfile
ENV_FILE="$ENV_FILE" pnpm db:generate
ENV_FILE="$ENV_FILE" pnpm db:migrate:deploy
ENV_FILE="$ENV_FILE" pnpm --filter @culi/storefront-default build
ENV_FILE="$ENV_FILE" pnpm --filter @culi/admin build
