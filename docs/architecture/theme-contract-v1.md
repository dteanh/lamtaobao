# Theme Contract v1

## Page types
- `home`
- `collection`
- `product`
- `cart`
- `checkout`
- `content`

## Layout slots
- `header`
- `announcement`
- `hero`
- `content`
- `sidebar`
- `footer`

## Normalized shapes

### ProductSummary
- `id`
- `slug`
- `title`
- `excerpt`
- `featuredImage`
- `price`
- `badges`
- `stockStatus`
- `categorySlugs`

### ProductDetail
- `id`
- `slug`
- `title`
- `descriptionHtml`
- `gallery`
- `price`
- `stock`
- `seo`
- `breadcrumbs`
- `categories`

### CollectionPageData
- `title`
- `slug`
- `description`
- `items: ProductSummary[]`
- `pagination`
- `filters` (prepared, phase 1 minimal)

### HomepageSection
- `type`: `hero | featuredProducts | categoryGrid | richText`
- `id`
- `headline`
- `body`
- `cta`
- `products`
- `categories`

### Menu/Footer/Site config
- `siteConfig`: site name, logo, default SEO, contact info, currency
- `menuConfig`: primary menu items, footer menu items
- `footerConfig`: columns, copyright, socials

## Rules
- Themes consume only normalized contracts from `packages/theme-sdk`.
- Themes must not depend on Prisma types.
- Themes may change presentation/layout only.
- Business rules stay in core.

## Registry keys
- `default-commerce`
- `minimal-shop`
- reserved: `fashion-store`, `electronics-store`
