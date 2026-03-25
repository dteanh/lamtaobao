# Production cutover checklist

## Pre-cutover
1. Confirm `.env.production` passed:
   - `ENV_FILE=.env.production ./scripts/check-production-env.sh`
2. Confirm DB backup path exists and has free space.
3. Confirm production artifacts are mapped and installed from repo:
   - `deploy/systemd/culi-storefront-production.service`
   - `deploy/systemd/culi-admin-production.service`
   - `deploy/nginx/production-tls.conf`
   - `deploy/prepare-production-nginx.sh`
   - `deploy/install-production-host.sh`
   - `deploy/enable-production-host.sh`
   - `deploy/backup-production.sh`
   - `deploy/rollback-production.sh`
4. Confirm TLS/domain already valid.

## Cutover
1. Run production release flow:
   - backup DB
   - migrate deploy
   - build
   - restart
   - smoke
2. Check:
   - `https://admin.example.com/api/system/health`
   - `https://shop.example.com/`
   - `systemctl status culi-storefront-production culi-admin-production`
   - `nginx -t`

## Revert
1. If smoke fails, rollback immediately using latest known-good backup.
2. Re-check:
   - admin health
   - storefront root
   - service status
3. Record:
   - failed release id/commit
   - backup id used for rollback
