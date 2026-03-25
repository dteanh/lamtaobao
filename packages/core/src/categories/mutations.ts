import { prisma } from '@culi/db';

export async function createCategory(input: { name: string; slug: string; description?: string }) {
  return prisma.category.create({ data: { name: input.name, slug: input.slug, description: input.description } });
}

export async function updateCategory(input: { id: string; name: string; slug: string; description?: string }) {
  return prisma.category.update({ where: { id: input.id }, data: { name: input.name, slug: input.slug, description: input.description } });
}

export async function deleteCategory(id: string) {
  await prisma.productCategory.deleteMany({ where: { categoryId: id } });
  return prisma.category.delete({ where: { id } });
}
