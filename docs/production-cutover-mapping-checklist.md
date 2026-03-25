# Production cutover mapping checklist

Điền hết các ô dưới đây trước khi chạy production thật.

## 1) Host / runtime
- Host bring-up script: `deploy/install-production-host.sh`
- Host enable/start script: `deploy/enable-production-host.sh`
- Production host IP / name: `____________________________`
- SSH access path / operator: `____________________________`
- App root trên host: `/opt/culi-commerce` hoặc `____________________________`
- Runtime user/group: `www-data:www-data` hoặc `____________________________`
- Node version trên host: `____________________________`
- pnpm path trên host: `/usr/bin/pnpm` hoặc `____________________________`

## 2) Domains / routing
- Storefront production URL: `https://____________________________`
- Admin production URL: `https://____________________________`
- NEXTAUTH_URL: `https://____________________________`
- DNS A/AAAA đã trỏ đúng host: `yes / no`
- Reverse proxy dùng: `nginx / caddy / other: ____________________________`

## 3) TLS
- TLS mode: `Let's Encrypt / existing cert / LB-managed / other`
- Nginx production template source: `deploy/nginx/production-tls.conf`
- Nginx render script: `deploy/prepare-production-nginx.sh`
- Cert path storefront: `____________________________`
- Key path storefront: `____________________________`
- Cert path admin: `____________________________`
- Key path admin: `____________________________`
- HTTP->HTTPS redirect đã bật: `yes / no`

## 4) Services
- Storefront service template: `deploy/systemd/culi-storefront-production.service`
- Admin service template: `deploy/systemd/culi-admin-production.service`
- Storefront service name: `culi-storefront-production` hoặc `____________________________`
- Admin service name: `culi-admin-production` hoặc `____________________________`
- Nginx service name: `nginx` hoặc `____________________________`
- PostgreSQL service name: `postgresql` hoặc `____________________________`

## 5) Environment / secrets
- `.env.production` location: `____________________________`
- DATABASE_URL: `postgresql://____________________________`
- NEXTAUTH_SECRET: `SET / MISSING`
- ADMIN_SESSION_SECRET: `SET / MISSING`
- AUTH_TRUST_HOST: `true / false`
- COOKIE_SECURE: `true / false`
- TRUST_PROXY: `true / false`
- HOSTNAME: `127.0.0.1 / other: ____________________________`
- STOREFRONT_PORT: `3000 / other: ____________________________`
- ADMIN_PORT: `3001 / other: ____________________________`
- LOG_LEVEL: `info / warn / error / other: ____________________________`

## 6) Database posture
- DB type/version: `____________________________`
- DB host: `____________________________`
- Fresh DB hay existing DB baseline: `fresh / existing-baseline`
- Nếu existing-baseline: đã chạy đúng 1 lần `scripts/prisma-baseline-existing-db.sh`: `yes / no`
- Migration deploy path xác nhận: `pnpm db:migrate:deploy`

## 7) Backup / rollback
- Backup root: `/opt/culi-backups` hoặc `____________________________`
- Backup script production: `./deploy/backup-production.sh` hoặc `____________________________`
- Backup verify script production: `./deploy/backup-verify-production.sh latest` hoặc `____________________________`
- Rollback script production: `./deploy/rollback-production.sh latest` hoặc `____________________________`
- DB dump file name: `production.sql` hoặc `____________________________`
- Backup retention keep count: `____________________________`
- Off-host backup target: `S3 / rsync / snapshot / other: ____________________________`
- Đã verify restore drill hoặc backup verify: `yes / no`

## 8) Production reverse proxy mapping
### Storefront
- public host: `____________________________`
- upstream: `127.0.0.1:____________________________`

### Admin
- public host: `____________________________`
- upstream: `127.0.0.1:____________________________`

## 9) Final cutover command mapping
```bash
ENV_FILE=.env.production \
BACKUP_CMD='____________________________' \
BUILD_CMD='ENV_FILE=.env.production ./scripts/release-production-grade.sh' \
RESTART_CMD='systemctl restart ____________________________ ____________________________' \
SMOKE_CMD='PROD_STOREFRONT_URL=https://____________________________ PROD_ADMIN_URL=https://____________________________ ./deploy/smoke-production.sh' \
ROLLBACK_CMD='____________________________' \
./deploy/release-production.sh
```

## 10) Go / no-go gate
- `ENV_FILE=.env.production ./scripts/check-production-env.sh` pass: `yes / no`
- `nginx -t` pass: `yes / no`
- production services enabled + active: `yes / no`
- smoke URLs reachable: `yes / no`
- latest backup id recorded: `yes / no`
- operator rollback owner assigned: `yes / no`
