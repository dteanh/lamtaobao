import { prisma } from '@culi/db';

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      _count: {
        select: { products: true },
      },
    },
  });
}
