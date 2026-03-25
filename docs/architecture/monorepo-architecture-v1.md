# Monorepo Architecture v1

## Structure

- `apps/admin`: admin panel, auth entry, product/category/order/settings management.
- `apps/storefront-default`: default storefront theme app consuming normalized contracts.
- `apps/storefront-minimal`: placeholder second storefront/theme app proving multi-theme direction.
- `packages/core`: UI-independent commerce business modules and application services.
- `packages/db`: Prisma schema, DB client, repositories, migrations, seed.
- `packages/theme-sdk`: normalized theme contract v1, registry, storefront data shapes.
- `packages/ui`: shared presentational components only, no business rules.
- `packages/config`: env parsing, app config, feature flags.
- `packages/integrations`: storage/payment/shipping adapters abstractions.

## Boundaries

### Core
- Owns use-cases, validation orchestration, business rules.
- Talks to repositories/interfaces, never to React UI.
- Returns DTOs/contracts for apps/theme layer.

### DB
- Owns Prisma schema and repository implementations.
- No React/UI code.
- No theme-specific shaping.

### Theme SDK
- Owns normalized storefront contracts:
  - product summary/detail
  - collection/category data
  - cart summary
  - checkout summary
  - homepage sections
  - site/menu/footer config
- Themes/apps render these shapes, not raw Prisma models.

### Apps
- Compose routes, auth, actions, views.
- Call core services.
- Must not bypass core to place business logic in components.

## Data flow

`DB/Prisma -> repository -> core service -> theme-sdk normalized DTO -> storefront/admin route/component`

## Module boundaries in core

- `catalog`: products, listing, product detail assembly
- `categories`: category tree, assignment
- `pricing`: active price, sale price, totals primitives
- `inventory`: stock state and reservation hooks
- `cart`: cart mutation/query
- `checkout`: checkout validation and order draft creation
- `orders`: order creation and admin order query
- `customers`: guest/customer identity abstraction
- `content`: pages/home sections/settings content
- `themes`: active theme + theme config resolution
- `seo`: normalized SEO metadata building
- `payments`: payment method abstraction (phase 1: COD/manual bank)
- `shipping`: shipping method abstraction (phase 1: flat/manual)

## Phase 1 decisions

- Single database, multi-app monorepo.
- Theme switching foundation via `themes` + `theme_configs` tables and `theme-sdk` registry.
- Admin/storefront can read via shared core services; direct DB access reserved for infra/repositories.
- Product variants prepared in schema later; phase 1 ships simple products first.
