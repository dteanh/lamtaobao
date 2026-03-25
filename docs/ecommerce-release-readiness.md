# Ecommerce release-readiness

## What is done
- Admin auth/session/csrf flow working.
- Admin CRUD via UI + API for categories, products, coupons.
- Inventory readability improved on `/products` and `/products/[id]`:
  - state badges
  - quick filters
  - threshold gap sort
  - inventory summary/read path
- Storefront cart -> checkout -> order success working.
- Admin order lifecycle update working.
- Order payment operability minimum working:
  - order-level payment state
  - payment history/attempts
  - admin manual mark paid / failed / refunded
  - audit + requestId + csrf/auth path
- Customer order tracking working without full account system:
  - tokenized read-only tracking link after checkout
  - order lookup by `orderNumber + email`
  - progress timeline
  - status/payment badges
  - basic lookup abuse guard

## What is verified
- Browser E2E verified:
  - admin login
  - category/product/coupon CRUD via UI
  - storefront checkout success
  - admin order lifecycle update
  - admin inventory visibility/read path
  - customer order tracking link
  - customer lookup success
  - customer lookup failure blocked correctly
  - admin payment actions: paid / failed / refunded
- Script/doc verification done for production repo-side artifacts:
  - production nginx render
  - install/enable host scripts
  - backup / backup verify / rollback
  - production host runbook

## Intentionally out of scope
- Full customer account system
- Real payment gateway integration
- Warehouse / ledger / advanced inventory allocation
- Email delivery / magic links
- Full anti-abuse stack (captcha / WAF / device fingerprint)
- Real production cutover execution without final host/domain/secrets inputs

## Still needed for real production cutover
- Real production host/domain/TLS inputs
- Final `.env.production` secrets and DB URL
- Production service mapping on real host
- Final nginx render/install on real host
- Real backup + restore drill on production-like data
- Final smoke run on production domains
