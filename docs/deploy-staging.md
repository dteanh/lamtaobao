# Staging deploy

Mục tiêu: staging trước, chưa mở public production full.

## Domain staging chốt
- Storefront: `staging.45.77.32.128.sslip.io`
- Admin: `admin-staging.45.77.32.128.sslip.io`

## Runtime staging
- Node 22 + pnpm 10
- PostgreSQL riêng cho staging
- 2 Next.js processes:
  - storefront → `127.0.0.1:3000`
  - admin → `127.0.0.1:3001`
- Reverse proxy: Nginx
- TLS terminate ở Nginx

## Env staging
```bash
cp .env.production.example .env.production
```
Điền thật:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_SESSION_SECRET`
- `STOREFRONT_URL=https://staging.45.77.32.128.sslip.io`
- `ADMIN_URL=https://admin-staging.45.77.32.128.sslip.io`
- `NEXTAUTH_URL=https://staging.45.77.32.128.sslip.io`

## Migration state đã chốt
- Prisma migration lock đã đúng provider `postgresql`
- Release path chuẩn **không dùng `db:push`**
- `db:push` chỉ còn giá trị dev/recovery thủ công, không thuộc deploy path chuẩn

## 1) Fresh DB flow
Dùng khi DB mới hoàn toàn, chưa có schema/app data.

```bash
ENV_FILE=.env.production pnpm install --frozen-lockfile
ENV_FILE=.env.production pnpm db:generate
ENV_FILE=.env.production pnpm db:migrate:deploy
ENV_FILE=.env.production pnpm --filter @culi/storefront-default build
ENV_FILE=.env.production pnpm --filter @culi/admin build
```

Hoặc:
```bash
ENV_FILE=.env.production ./scripts/release-production-grade.sh
```

## 2) Existing DB flow (baseline once)
Dùng đúng 1 lần nếu DB staging/prod đã từng được tạo bằng `db:push` hoặc schema thủ công.

```bash
ENV_FILE=.env.production ./scripts/prisma-baseline-existing-db.sh
```

Script này sẽ:
- mark `0001_init` là applied
- chạy `prisma migrate deploy`

Sau khi baseline xong, **mọi release sau đó quay về flow chuẩn**.

## 3) Steady-state release flow (đường chuẩn duy nhất)
Đây là flow duy nhất sau khi hệ đã vào quỹ đạo:

```bash
ENV_FILE=.env.production ./scripts/release-production-grade.sh
sudo systemctl restart culi-storefront-staging culi-admin-staging
./deploy/smoke-staging.sh
```

Tóm tắt ngắn:
- migrate deploy
- build
- restart
- smoke

## Start/runtime
Runtime live đang do systemd quản lý:
- `culi-storefront-staging`
- `culi-admin-staging`

2 app bind loopback only:
- `127.0.0.1:3000`
- `127.0.0.1:3001`

## Health checks sau release
```bash
curl -fsS https://admin-staging.45.77.32.128.sslip.io/api/system/health
curl -fsSI https://staging.45.77.32.128.sslip.io/
```
