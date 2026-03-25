FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
RUN pnpm db:generate
RUN pnpm --filter @culi/storefront-default build
RUN pnpm --filter @culi/admin build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app /app
COPY --from=build /app/apps/storefront-default/.next /app/apps/storefront-default/.next
COPY --from=build /app/apps/admin/.next /app/apps/admin/.next
EXPOSE 3000 3001
CMD ["bash", "-lc", "echo 'Use explicit command: pnpm --filter @culi/storefront-default start or pnpm --filter @culi/admin start'"]
