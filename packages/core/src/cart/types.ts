import type { CartSummary } from '@culi/theme-sdk/contracts';

export type CartLineRecord = {
  id: string;
  quantity: number;
  unitPrice: string;
  product: {
    id: string;
    slug: string;
    title: string;
    featuredImage?: { url: string; alt: string | null } | null;
  };
};

export type CartRecord = {
  id: string;
  token: string;
  currency: string;
  couponCode: string | null;
  items: CartLineRecord[];
};

export type CartMutationInput = {
  token: string;
  productId: string;
  quantity: number;
};

export type CartSummaryResult = CartSummary;
