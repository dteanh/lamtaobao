import type { CollectionPageData } from '@culi/theme-sdk/contracts';
import { getCategorySummaries } from '../categories/service';
import { mapProductDetail, mapProductSummary } from './mappers';
import { getPublishedProductBySlug, listPublishedProducts } from './repository';

export async function getCatalogCollection(input: { page?: number; pageSize?: number; categorySlug?: string }): Promise<CollectionPageData> {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 12;
  const [result, categories] = await Promise.all([
    listPublishedProducts({ page, pageSize, categorySlug: input.categorySlug }),
    getCategorySummaries(),
  ]);

  const activeCategory = input.categorySlug ? categories.find((category) => category.slug === input.categorySlug) : null;

  return {
    title: activeCategory?.name ?? (input.categorySlug ? `Danh mục ${input.categorySlug}` : 'Tất cả sản phẩm'),
    slug: input.categorySlug ?? 'all',
    description: activeCategory?.description,
    items: result.items.map(mapProductSummary),
    pagination: {
      page,
      pageSize,
      totalItems: result.totalItems,
      totalPages: Math.max(1, Math.ceil(result.totalItems / pageSize)),
    },
    filters: {
      categories: categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        count: category.count,
      })),
    },
  };
}

export async function getCatalogProductDetail(slug: string) {
  const product = await getPublishedProductBySlug(slug);
  if (!product) return null;
  return mapProductDetail(product);
}
