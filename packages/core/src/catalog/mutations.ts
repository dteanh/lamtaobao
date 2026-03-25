import { prisma } from '@culi/db';

export async function createProduct(input: {
  title: string;
  slug: string;
  price: number;
  salePrice?: number;
  excerpt?: string;
  description?: string;
  categoryIds?: string[];
  imageUrl?: string;
  stockQuantity?: number;
  lowStockLevel?: number;
}) {
  return prisma.product.create({
    data: {
      title: input.title,
      slug: input.slug,
      price: input.price,
      salePrice: input.salePrice,
      excerpt: input.excerpt,
      description: input.description,
      status: 'PUBLISHED',
      currency: 'VND',
      images: input.imageUrl ? { create: [{ url: input.imageUrl, alt: input.title, position: 0 }] } : undefined,
      inventory: { create: { quantity: input.stockQuantity ?? 0, lowStockLevel: input.lowStockLevel } },
      categories: input.categoryIds?.length ? { create: input.categoryIds.map((categoryId) => ({ categoryId })) } : undefined,
    },
    include: { images: true },
  }).then(async (product) => {
    if (product.images[0]) {
      await prisma.product.update({ where: { id: product.id }, data: { featuredImageId: product.images[0].id } });
    }
    return product;
  });
}

export async function updateProduct(input: {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number;
  excerpt?: string;
  description?: string;
  categoryIds?: string[];
  imageUrl?: string;
  stockQuantity?: number;
  lowStockLevel?: number;
}) {
  await prisma.product.update({ where: { id: input.id }, data: { title: input.title, slug: input.slug, price: input.price, salePrice: input.salePrice, excerpt: input.excerpt, description: input.description } });
  await prisma.inventory.upsert({
    where: { productId: input.id },
    update: { quantity: input.stockQuantity ?? 0, lowStockLevel: input.lowStockLevel },
    create: { productId: input.id, quantity: input.stockQuantity ?? 0, lowStockLevel: input.lowStockLevel },
  });
  await prisma.productCategory.deleteMany({ where: { productId: input.id } });
  if (input.categoryIds?.length) {
    await prisma.productCategory.createMany({ data: input.categoryIds.map((categoryId) => ({ productId: input.id, categoryId })), skipDuplicates: true });
  }
  if (input.imageUrl) {
    const image = await prisma.productImage.create({ data: { productId: input.id, url: input.imageUrl, alt: input.title, position: 0 } });
    await prisma.product.update({ where: { id: input.id }, data: { featuredImageId: image.id } });
  }
  return prisma.product.findUnique({ where: { id: input.id }, include: { inventory: true, categories: { include: { category: true } }, images: true } });
}

export async function deleteProduct(id: string) {
  await prisma.productCategory.deleteMany({ where: { productId: id } });
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.inventory.deleteMany({ where: { productId: id } });
  return prisma.product.delete({ where: { id } });
}
