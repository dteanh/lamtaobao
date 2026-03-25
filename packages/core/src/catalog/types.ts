export type ProductRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  currency: string;
  price: string;
  salePrice: string | null;
  images: Array<{ url: string; alt: string | null; position: number }>;
  inventory: { quantity: number; reserved: number; policy: 'DENY_BACKORDER' | 'ALLOW_BACKORDER'; lowStockLevel?: number | null } | null;
  categories: Array<{ category: { id: string; slug: string; name: string } }>;
};

export type CatalogListInput = {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
};
