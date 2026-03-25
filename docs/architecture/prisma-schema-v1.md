# Prisma Schema v1 Notes

## Included entities
- users
- customer_profiles
- addresses
- products
- product_images
- categories
- product_categories
- inventory
- carts
- cart_items
- orders
- order_items
- payments
- coupons
- pages
- settings
- themes
- theme_configs

## Prepared extension points
- product_variants
- attributes
- reviews
- media
- menu_items
- posts
- shipments
- audit_logs

## Phase 1 choices
- Product type starts with `simple` while reserving enum for `variant_parent` later.
- Cart supports guest via token and optional customer linkage.
- Orders snapshot pricing fields directly to keep order history immutable.
- Theme configs stored per theme key and optional scope.
- Settings use scoped key/value JSON for flexible site config without WP-style meta sprawl.
