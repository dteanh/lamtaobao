# Local setup

## 1. Prepare env
Copy `.env.example` to `.env` and set a real Postgres URL:

```bash
cp .env.example .env
```

## 2. Install
```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm install
```

## 3. Generate Prisma client
```bash
pnpm db:generate
```

## 4. Apply schema to local Postgres
```bash
pnpm db:push
```
_or_
```bash
pnpm db:migrate
```

## 5. Seed demo data
```bash
pnpm db:seed
```

## 6. Run apps
```bash
pnpm --filter @culi/storefront-default dev
pnpm --filter @culi/admin dev
```

- storefront: `http://localhost:3000`
- admin: `http://localhost:3001`

## Current demo scope
- storefront home/category/product pages wired to core services
- cart page
- checkout page
- order success page
- admin products/categories/orders basic management pages
- Prisma schema/migration SQL/seed ready
