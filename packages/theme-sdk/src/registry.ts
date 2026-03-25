import type { FooterConfig, MenuConfig, SiteConfig, ThemeKey } from './contracts';

export type RegisteredTheme = {
  key: ThemeKey;
  label: string;
  app: 'storefront-default' | 'storefront-minimal';
  supports: string[];
  defaults: {
    site: SiteConfig;
    menu: MenuConfig;
    footer: FooterConfig;
  };
};

export const themeRegistry: Record<string, RegisteredTheme> = {
  'default-commerce': {
    key: 'default-commerce',
    label: 'Default Commerce',
    app: 'storefront-default',
    supports: ['home', 'collection', 'product', 'cart', 'checkout'],
    defaults: {
      site: {
        siteName: 'Culi Commerce',
        currency: 'VND',
        defaultSeo: {
          title: 'Culi Commerce',
          description: 'Default commerce storefront',
        },
      },
      menu: { primary: [], footer: [] },
      footer: { columns: [], copyright: '© Culi Commerce' },
    },
  },
  'minimal-shop': {
    key: 'minimal-shop',
    label: 'Minimal Shop',
    app: 'storefront-minimal',
    supports: ['home', 'collection', 'product'],
    defaults: {
      site: {
        siteName: 'Minimal Shop',
        currency: 'VND',
        defaultSeo: {
          title: 'Minimal Shop',
          description: 'Minimal storefront placeholder',
        },
      },
      menu: { primary: [], footer: [] },
      footer: { columns: [], copyright: '© Minimal Shop' },
    },
  },
};
