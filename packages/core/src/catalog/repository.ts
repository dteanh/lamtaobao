import { prisma } from '@culi/db';
import type { ProductRecord } from './types';

const productInclude = {
  images: {
    orderBy: { position: 'asc' as const },
    select: { url: true, alt: true, position: true },
  },
  inventory: {
    select: { quantity: true, reserved: true, policy: true, lowStockLevel: true },
  },
  categories: {
    include: {
      category: {
        select: { id: true, slug: true, name: true },
      },
    },
  },
} as const;

function mapDbProductToRecord(product: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  currency: string;
  price: { toString(): string };
  salePrice: { toString(): string } | null;
  images: Array<{ url: string; alt: string | null; position: number }>;
  inventory: { quantity: number; reserved: number; policy: 'DENY_BACKORDER' | 'ALLOW_BACKORDER'; lowStockLevel: number | null } | null;
  categories: Array<{ category: { id: string; slug: string; name: string } }>;
}): ProductRecord {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    excerpt: product.excerpt,
    description: product.description,
    status: product.status,
    currency: product.currency,
    price: product.price.toString(),
    salePrice: product.salePrice ? product.salePrice.toString() : null,
    images: product.images,
    inventory: product.inventory,
    categories: product.categories,
  };
}

export async function listPublishedProducts(params: { page: number; pageSize: number; categorySlug?: string }) {
  const where = {
    status: 'PUBLISHED' as const,
    ...(params.categorySlug
      ? {
          categories: {
            some: {
              category: {
                slug: params.categorySlug,
              },
            },
          },
        }
      : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items: items.map(mapDbProductToRecord), totalItems };
}

export async function getPublishedProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: productInclude,
  });

  return product ? mapDbProductToRecord(product) : null;
}
