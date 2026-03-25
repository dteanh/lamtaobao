import type { ProductDetail, ProductSummary } from '@culi/theme-sdk/contracts';
import { formatMoney, resolveActivePrice } from '../pricing/money';
import type { ProductRecord } from './types';

function toNumber(value: string | null | undefined) {
  return value ? Number(value) : 0;
}

export function mapProductSummary(record: ProductRecord): ProductSummary {
  const regular = toNumber(record.price);
  const sale = record.salePrice ? toNumber(record.salePrice) : undefined;
  const active = resolveActivePrice(regular, sale);
  const quantity = record.inventory?.quantity ?? 0;
  const policy = record.inventory?.policy ?? 'DENY_BACKORDER';

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt ?? undefined,
    featuredImage: record.images[0] ? { url: record.images[0].url, alt: record.images[0].alt ?? undefined } : undefined,
    price: {
      regular: formatMoney(regular, record.currency),
      sale: sale ? formatMoney(sale, record.currency) : undefined,
      active: formatMoney(active, record.currency),
    },
    badges: sale ? ['sale'] : [],
    stockStatus: quantity > 0 ? 'in_stock' : policy === 'ALLOW_BACKORDER' ? 'backorder' : 'out_of_stock',
    categorySlugs: record.categories.map((item: ProductRecord['categories'][number]) => item.category.slug),
  };
}

export function mapProductDetail(record: ProductRecord): ProductDetail {
  const summary = mapProductSummary(record);

  return {
    ...summary,
    descriptionHtml: record.description ?? undefined,
    gallery: record.images.map((image: ProductRecord['images'][number]) => ({ url: image.url, alt: image.alt ?? undefined })),
    seo: {
      title: record.title,
      description: record.excerpt ?? undefined,
    },
    breadcrumbs: [
      { title: 'Trang chủ', href: '/' },
      ...record.categories.map((item: ProductRecord['categories'][number]) => ({ title: item.category.name, href: `/categories/${item.category.slug}` })),
      { title: record.title, href: `/products/${record.slug}` },
    ],
    categories: record.categories.map((item: ProductRecord['categories'][number]) => item.category),
    stock: {
      quantity: record.inventory?.quantity ?? 0,
      policy: record.inventory?.policy === 'ALLOW_BACKORDER' ? 'allow_backorder' : 'deny_backorder',
    },
  };
}
