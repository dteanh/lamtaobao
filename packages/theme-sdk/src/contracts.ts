export type ThemeKey = 'default-commerce' | 'minimal-shop' | 'fashion-store' | 'electronics-store';

export type PageType = 'home' | 'collection' | 'product' | 'cart' | 'checkout' | 'content';
export type LayoutSlot = 'header' | 'announcement' | 'hero' | 'content' | 'sidebar' | 'footer';

export type MoneyValue = {
  amount: number;
  currency: string;
  formatted: string;
};

export type MediaAsset = {
  url: string;
  alt?: string;
};

export type SeoData = {
  title: string;
  description?: string;
  canonicalUrl?: string;
};

export type BreadcrumbItem = {
  title: string;
  href: string;
};

export type ProductSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: MediaAsset;
  price: {
    regular: MoneyValue;
    sale?: MoneyValue;
    active: MoneyValue;
  };
  badges: string[];
  stockStatus: 'in_stock' | 'out_of_stock' | 'backorder';
  categorySlugs: string[];
};

export type ProductDetail = ProductSummary & {
  descriptionHtml?: string;
  gallery: MediaAsset[];
  seo: SeoData;
  breadcrumbs: BreadcrumbItem[];
  categories: Array<{ id: string; slug: string; name: string }>;
  stock: {
    quantity: number;
    policy: 'deny_backorder' | 'allow_backorder';
  };
};

export type CollectionPageData = {
  title: string;
  slug: string;
  description?: string;
  items: ProductSummary[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  filters: {
    categories: Array<{ slug: string; name: string; count?: number }>;
  };
};

export type HomepageSection = {
  id: string;
  type: 'hero' | 'featuredProducts' | 'categoryGrid' | 'richText';
  headline?: string;
  body?: string;
  cta?: { label: string; href: string };
  products?: ProductSummary[];
  categories?: Array<{ id: string; slug: string; name: string; image?: MediaAsset }>;
};

export type MenuItem = {
  label: string;
  href: string;
  children?: MenuItem[];
};

export type SiteConfig = {
  siteName: string;
  logoUrl?: string;
  currency: string;
  contactEmail?: string;
  contactPhone?: string;
  defaultSeo: SeoData;
};

export type MenuConfig = {
  primary: MenuItem[];
  footer: MenuItem[];
};

export type FooterConfig = {
  columns: Array<{ title: string; links: MenuItem[] }>;
  copyright: string;
  socials?: Array<{ label: string; href: string }>;
};

export type CartSummary = {
  id: string;
  currency: string;
  items: Array<{
    id: string;
    productId: string;
    slug: string;
    title: string;
    quantity: number;
    unitPrice: MoneyValue;
    lineTotal: MoneyValue;
    image?: MediaAsset;
  }>;
  subtotal: MoneyValue;
  discountTotal: MoneyValue;
  shippingTotal: MoneyValue;
  total: MoneyValue;
};

export type CheckoutSummary = CartSummary & {
  paymentMethods: Array<{ code: 'COD' | 'MANUAL_BANK_TRANSFER'; label: string; description?: string }>;
};
