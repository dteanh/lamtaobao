import { listCategories } from './repository';

export async function getCategorySummaries() {
  const categories = await listCategories();
  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description ?? undefined,
    count: category._count.products,
  }));
}
