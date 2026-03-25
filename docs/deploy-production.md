# Production deploy

Mục tiêu: đường lên production tối thiểu, sạch, không lẫn staging.

## Production principles
- Deploy chuẩn chỉ có một đường:
  - backup DB
  - migrate deploy
  - build
  - restart
  - smoke
  - rollback nếu fail
- Không dùng `db:push` trong production deploy path.
- App runtime phải bind loopback only sau reverse proxy.

## Repo artifacts
- systemd:
  - `deploy/systemd/culi-storefront-production.service`
  - `deploy/systemd/culi-admin-production.service`
- nginx:
  - `deploy/nginx/production-tls.conf`
  - `deploy/prepare-production-nginx.sh`
- host bring-up:
  - `deploy/install-production-host.sh`
  - `deploy/enable-production-host.sh`
- backup / rollback:
  - `deploy/backup-production.sh`
  - `deploy/backup-verify-production.sh`
  - `deploy/rollback-production.sh`

## Flows

### 1) Fresh DB
DB mới hoàn toàn, chưa có schema/app data:
```bash
ENV_FILE=.env.production ./scripts/check-production-env.sh
ENV_FILE=.env.production ./scripts/release-production-grade.sh
```

### 2) Existing DB baseline once
Nếu production DB từng bị tạo bằng `db:push` / schema thủ công:
```bash
ENV_FILE=.env.production ./scripts/prisma-baseline-existing-db.sh
```
Làm đúng 1 lần. Sau đó mọi release quay về flow chuẩn.

### 3) Steady-state release (đường chuẩn duy nhất)
Điền production mapping thật trước khi chạy:
- domain / TLS paths trong `deploy/nginx/production-tls.conf`
- service names nếu khác default
- `.env.production`

```bash
ENV_FILE=.env.production \
BACKUP_CMD='./deploy/backup-production.sh' \
BUILD_CMD='ENV_FILE=.env.production ./scripts/release-production-grade.sh' \
RESTART_CMD='systemctl restart culi-storefront-production culi-admin-production' \
SMOKE_CMD='PROD_STOREFRONT_URL=https://shop.example.com PROD_ADMIN_URL=https://admin.example.com ./deploy/smoke-production.sh' \
ROLLBACK_CMD='./deploy/rollback-production.sh latest' \
./deploy/release-production.sh
```

## Fail-fast expectations
- `.env.production` thiếu REQUIRED vars → stop ngay
- còn `CHANGE_ME` / `example.com` → stop ngay
- `NODE_ENV!=production` → stop ngay
- `HOSTNAME!=127.0.0.1` → stop ngay
- `COOKIE_SECURE!=true` / `TRUST_PROXY!=true` → stop ngay

## Current release summary
Production-ready release discipline cần giữ đúng thứ tự:
- backup DB
- migrate deploy
- build
- restart
- smoke
- rollback nếu fail
