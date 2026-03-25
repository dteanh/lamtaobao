import type { CollectionPageData } from '@culi/theme-sdk/contracts';
import { mapProductDetail, mapProductSummary } from './mappers';
import { getPublishedProductBySlug, listPublishedProducts } from './repository';

export async function getCatalogCollection(input: { page?: number; pageSize?: number; categorySlug?: string }): Promise<CollectionPageData> {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 12;
  const result = await listPublishedProducts({ page, pageSize, categorySlug: input.categorySlug });

  return {
    title: input.categorySlug ? `Danh mục ${input.categorySlug}` : 'Tất cả sản phẩm',
    slug: input.categorySlug ?? 'all',
    items: result.items.map(mapProductSummary),
    pagination: {
      page,
      pageSize,
      totalItems: result.totalItems,
      totalPages: Math.max(1, Math.ceil(result.totalItems / pageSize)),
    },
    filters: {
      categories: [],
    },
  };
}

export async function getCatalogProductDetail(slug: string) {
  const product = await getPublishedProductBySlug(slug);
  if (!product) return null;
  return mapProductDetail(product);
}
