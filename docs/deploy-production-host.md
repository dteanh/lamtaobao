# Production host path runbook

Mục tiêu: gom toàn bộ production host path thành một luồng rõ ràng từ prepare -> install -> enable -> smoke -> rollback.

Tài liệu này **không** bịa production values. Chỉ chạy khi đã có input thật.

## 0) Inputs phải có trước
Điền trước theo:
- `docs/production-cutover-mapping-checklist.md`

Tối thiểu phải có thật:
- production host
- storefront domain
- admin domain
- TLS cert/key paths
- `.env.production`
- service names nếu khác default
- backup root / rollback target

## 1) Repo artifacts dùng trong flow này
### Nginx
- template: `deploy/nginx/production-tls.conf`
- render script: `deploy/prepare-production-nginx.sh`

### Host bring-up
- install/prepare: `deploy/install-production-host.sh`
- enable/start: `deploy/enable-production-host.sh`

### Services
- `deploy/systemd/culi-storefront-production.service`
- `deploy/systemd/culi-admin-production.service`

### Release / smoke / rollback
- release wrapper: `deploy/release-production.sh`
- build+migrate path: `scripts/release-production-grade.sh`
- env validation: `scripts/check-production-env.sh`
- smoke: `deploy/smoke-production.sh`
- backup: `deploy/backup-production.sh`
- backup verify: `deploy/backup-verify-production.sh`
- rollback: `deploy/rollback-production.sh`

## 2) Flow tổng
Thứ tự chuẩn:
1. prepare mapping inputs
2. validate `.env.production`
3. render nginx production config
4. install/prepare host artifacts
5. enable/start production services + nginx site
6. smoke checks
7. steady-state release path
8. rollback nếu smoke/release fail

---

## 3) Prepare mapping inputs
Ví dụ biến shell, thay bằng giá trị thật của production:

```bash
export APP_ROOT=/opt/culi-commerce
export ENV_FILE=/opt/culi-commerce/.env.production

export STOREFRONT_DOMAIN=__REAL_STOREFRONT_DOMAIN__
export ADMIN_DOMAIN=__REAL_ADMIN_DOMAIN__

export STOREFRONT_CERT=__REAL_STOREFRONT_CERT_PATH__
export STOREFRONT_KEY=__REAL_STOREFRONT_KEY_PATH__
export ADMIN_CERT=__REAL_ADMIN_CERT_PATH__
export ADMIN_KEY=__REAL_ADMIN_KEY_PATH__

export PROD_STOREFRONT_SERVICE=culi-storefront-production
export PROD_ADMIN_SERVICE=culi-admin-production
export PROD_NGINX_SERVICE=nginx
```

Nếu service names khác default, thay ngay ở đây.

---

## 4) Validate env trước khi đụng host path
```bash
ENV_FILE="$ENV_FILE" ./scripts/check-production-env.sh
```

Kỳ vọng:
- pass nếu `.env.production` đủ biến required
- fail nếu còn `CHANGE_ME` / `example.com`
- fail nếu `HOSTNAME != 127.0.0.1`
- fail nếu `COOKIE_SECURE != true` hoặc `TRUST_PROXY != true`

---

## 5) Render nginx production config
Render file production site config từ template:

```bash
./deploy/prepare-production-nginx.sh \
  --store-domain "$STOREFRONT_DOMAIN" \
  --admin-domain "$ADMIN_DOMAIN" \
  --store-cert "$STOREFRONT_CERT" \
  --store-key "$STOREFRONT_KEY" \
  --admin-cert "$ADMIN_CERT" \
  --admin-key "$ADMIN_KEY" \
  --out /etc/nginx/sites-available/culi-production.conf \
  --verify-nginx
```

Kỳ vọng:
- render xong file nginx production dùng thật
- `nginx -t` pass trong verify mode

---

## 6) Install / prepare host artifacts
Script này làm phần bring-up an toàn từ repo side:
- sync app
- install deps
- validate env
- db generate
- optional migrate deploy
- optional build
- render nginx
- install production systemd units
- fix permissions

Lệnh chuẩn:

```bash
sudo APP_ROOT="$APP_ROOT" \
ENV_FILE="$ENV_FILE" \
STOREFRONT_DOMAIN="$STOREFRONT_DOMAIN" \
ADMIN_DOMAIN="$ADMIN_DOMAIN" \
STOREFRONT_CERT="$STOREFRONT_CERT" \
STOREFRONT_KEY="$STOREFRONT_KEY" \
ADMIN_CERT="$ADMIN_CERT" \
ADMIN_KEY="$ADMIN_KEY" \
PROD_STOREFRONT_SERVICE="$PROD_STOREFRONT_SERVICE" \
PROD_ADMIN_SERVICE="$PROD_ADMIN_SERVICE" \
./deploy/install-production-host.sh
```

Nếu muốn chỉ prepare host mà chưa migrate/build:

```bash
sudo APP_ROOT="$APP_ROOT" \
ENV_FILE="$ENV_FILE" \
STOREFRONT_DOMAIN="$STOREFRONT_DOMAIN" \
ADMIN_DOMAIN="$ADMIN_DOMAIN" \
STOREFRONT_CERT="$STOREFRONT_CERT" \
STOREFRONT_KEY="$STOREFRONT_KEY" \
ADMIN_CERT="$ADMIN_CERT" \
ADMIN_KEY="$ADMIN_KEY" \
./deploy/install-production-host.sh \
  --skip-db-migrate \
  --skip-build
```

Lưu ý:
- script này **không tự claim production live success**

---

## 7) Enable / start production host path
Script này làm:
- enable nginx site
- `nginx -t`
- optional kill old listeners 3000/3001
- daemon-reload
- enable/start app services
- reload/restart nginx
- optional smoke

Lệnh chuẩn:

```bash
sudo PROD_STOREFRONT_SERVICE="$PROD_STOREFRONT_SERVICE" \
PROD_ADMIN_SERVICE="$PROD_ADMIN_SERVICE" \
PROD_NGINX_SERVICE="$PROD_NGINX_SERVICE" \
./deploy/enable-production-host.sh --restart-nginx
```

Nếu đã có production URL thật và muốn chạy smoke ngay:

```bash
sudo PROD_STOREFRONT_SERVICE="$PROD_STOREFRONT_SERVICE" \
PROD_ADMIN_SERVICE="$PROD_ADMIN_SERVICE" \
PROD_NGINX_SERVICE="$PROD_NGINX_SERVICE" \
PROD_STOREFRONT_URL="https://$STOREFRONT_DOMAIN" \
PROD_ADMIN_URL="https://$ADMIN_DOMAIN" \
./deploy/enable-production-host.sh \
  --restart-nginx \
  --run-smoke
```

---

## 8) Smoke checks
Smoke riêng bằng artifact chính thức:

```bash
PROD_STOREFRONT_URL="https://$STOREFRONT_DOMAIN" \
PROD_ADMIN_URL="https://$ADMIN_DOMAIN" \
./deploy/smoke-production.sh
```

Script smoke hiện check:
1. admin health json
2. admin `/login` headers
3. admin `/login` body marker
4. admin `/api/admin/csrf`
5. storefront `/` headers
6. storefront `/cart` headers
7. storefront `/checkout` headers
8. systemd services active

---

## 9) Steady-state release path
Sau khi host path đã lên đúng, release chuẩn production dùng đúng wrapper này:

```bash
ENV_FILE="$ENV_FILE" \
BACKUP_CMD='./deploy/backup-production.sh' \
BUILD_CMD='ENV_FILE=/opt/culi-commerce/.env.production ./scripts/release-production-grade.sh' \
RESTART_CMD='systemctl restart culi-storefront-production culi-admin-production' \
SMOKE_CMD='PROD_STOREFRONT_URL=https://__REAL_STOREFRONT_DOMAIN__ PROD_ADMIN_URL=https://__REAL_ADMIN_DOMAIN__ ./deploy/smoke-production.sh' \
ROLLBACK_CMD='./deploy/rollback-production.sh latest' \
./deploy/release-production.sh
```

Trước khi chạy, thay:
- `__REAL_STOREFRONT_DOMAIN__`
- `__REAL_ADMIN_DOMAIN__`
- service names nếu khác default

---

## 10) Rollback path
Nếu smoke fail hoặc release fail:

```bash
./deploy/rollback-production.sh latest
```

Hoặc chỉ định backup id/path cụ thể:

```bash
./deploy/rollback-production.sh 20260325-120000
```

Rollback hiện làm:
- stop app services
- restore app tree
- restore `.env.production`
- restore production systemd units nếu có trong backup
- restore nginx site config nếu có trong backup
- restore TLS dir nếu có trong backup
- drop/create lại DB rồi restore SQL dump
- start lại services

---

## 11) Go / no-go gate ngắn
Chỉ nên cutover khi 5 dòng này đều rõ:
1. `.env.production` pass `scripts/check-production-env.sh`
2. `prepare-production-nginx.sh --verify-nginx` pass
3. production services installed đúng tên
4. smoke URLs là domain thật, không còn placeholder
5. backup + rollback path đã chạy được ít nhất ở mức verify nội bộ

---

## 12) Cái gì tài liệu này chưa claim
Tài liệu này **không** tự khẳng định:
- DNS đã đúng
- TLS đã valid public
- production cutover đã thành công
- off-host backup đã an toàn

Mấy thứ đó chỉ được chốt khi đã có input thật và smoke/release pass thật.
