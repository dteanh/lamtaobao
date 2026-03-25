# Staging cutover / revert checklist

## Cutover
1. `sudo ./deploy/install-staging-host.sh`
2. `sudo ./deploy/enable-staging-host.sh`
   - script sẽ kill process cũ trên `3000/3001` trước khi handoff sang systemd
3. Check:
   - `curl -kfsS https://admin-staging.45.77.32.128.sslip.io/api/system/health`
   - `curl -kI https://staging.45.77.32.128.sslip.io/`
4. Confirm systemd:
   - `systemctl status culi-storefront-staging`
   - `systemctl status culi-admin-staging`
5. Confirm Nginx:
   - `nginx -t`

## Revert
1. `systemctl stop culi-storefront-staging culi-admin-staging`
2. `rm -f /etc/nginx/sites-enabled/culi-staging.conf`
3. `systemctl reload nginx`
4. If needed restore prior app dir/config from backup or redeploy previous commit into `/opt/culi-commerce`
