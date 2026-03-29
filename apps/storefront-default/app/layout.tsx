import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <title>삼양 서브큐몰 | 신뢰와 속도의 식자재 플랫폼</title>
        <style>{`
          * { box-sizing: border-box; }
          html, body { max-width: 100%; overflow-x: hidden; }

          @media (max-width: 768px) {
            .site-shell-main,
            .site-page-frame,
            .site-shell-header > div,
            .site-shell-footer > div,
            .home-page-section > div,
            .page-section-title > div {
              width: 100% !important;
              min-width: 0 !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              padding-left: 16px !important;
              padding-right: 16px !important;
            }

            .site-shell-main,
            .site-page-frame,
            .home-page-main {
              min-width: 0 !important;
            }

            .site-shell-header .desktop-only,
            .site-shell-footer .desktop-only,
            .home-page-main .desktop-only {
              display: none !important;
            }

            .site-shell-header .mobile-stack,
            .site-shell-footer .mobile-stack,
            .home-page-main .mobile-stack {
              display: block !important;
            }

            .site-shell-header > a {
              line-height: 1.45 !important;
              padding: 10px 16px !important;
              font-size: 13px !important;
            }

            .site-shell-header input {
              width: 100% !important;
              min-width: 0 !important;
              height: 46px !important;
              padding-left: 18px !important;
              padding-right: 52px !important;
              font-size: 13px !important;
            }

            .site-shell-header form,
            .site-shell-header nav,
            .site-shell-header ul,
            .site-shell-footer ul {
              max-width: 100%;
            }

            .home-hero-grid,
            .home-featured-grid,
            .home-promo-grid,
            .home-best-grid,
            .site-footer-top,
            .site-footer-middle,
            .site-footer-bottom,
            .header-main-row,
            .header-nav-row,
            .quick-menu-grid {
              display: grid !important;
              grid-template-columns: minmax(0, 1fr) !important;
              gap: 16px !important;
            }

            .header-main-row,
            .header-nav-row {
              height: auto !important;
            }

            .header-main-row {
              padding: 18px 0 14px !important;
            }

            .header-main-row > div,
            .header-nav-row > div,
            .header-nav-row > details {
              width: 100% !important;
            }

            .header-nav-row {
              padding: 14px 0 !important;
            }

            .header-nav-row > div {
              gap: 14px !important;
              padding-left: 0 !important;
              flex-wrap: wrap !important;
              font-size: 14px !important;
            }

            .site-shell-header details,
            .site-shell-header summary {
              width: 100% !important;
            }

            .site-shell-header summary {
              justify-content: space-between !important;
              padding: 0 16px !important;
              border: 1px solid #e5e7eb !important;
              border-right: 1px solid #e5e7eb !important;
              background: #fafafa !important;
            }

            .site-shell-header .mega-panel {
              position: static !important;
              width: 100% !important;
              grid-template-columns: minmax(0, 1fr) !important;
              box-shadow: none !important;
              padding: 18px 16px !important;
              gap: 18px !important;
            }

            .site-shell-header .mega-panel ul {
              grid-template-columns: minmax(0, 1fr) !important;
            }

            .home-page-main h1 {
              font-size: 34px !important;
              line-height: 1.1 !important;
            }

            .home-page-main h2 {
              font-size: 28px !important;
              line-height: 1.2 !important;
            }

            .home-page-main p,
            .home-page-main span,
            .site-shell-footer,
            .site-shell-header {
              word-break: keep-all;
            }

            .home-hero-card-main,
            .home-hero-card-side,
            .home-promo-card,
            .home-product-card {
              min-height: 0 !important;
              padding: 24px 20px !important;
            }

            .home-hero-card-main {
              grid-template-columns: minmax(0, 1fr) !important;
            }

            .home-hero-card-side,
            .home-promo-card {
              grid-template-columns: minmax(0, 1fr) !important;
            }

            .home-visual-art,
            .desktop-art {
              display: none !important;
            }

            .home-product-list,
            .home-best-list {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 18px !important;
            }

            .quick-menu-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .quick-menu-grid a {
              padding: 12px 8px !important;
            }

            .quick-menu-grid a > div {
              width: 84px !important;
              height: 84px !important;
              margin-bottom: 10px !important;
            }

            .site-shell-footer {
              padding-top: 0 !important;
            }

            .site-shell-footer > div > div,
            .site-shell-footer details,
            .site-shell-footer summary {
              width: 100% !important;
            }

            .site-shell-footer summary {
              min-width: 0 !important;
            }

            .flow-two-col,
            .product-detail-grid,
            .cart-layout,
            .checkout-layout,
            .order-lookup-layout,
            .order-detail-layout,
            .category-grid,
            .thumb-grid,
            .checkout-fields,
            .order-meta-grid,
            .order-item-line {
              grid-template-columns: minmax(0, 1fr) !important;
            }

            .category-grid,
            .thumb-grid {
              gap: 16px !important;
            }

            .cart-line {
              grid-template-columns: 96px minmax(0, 1fr) !important;
              gap: 14px !important;
              align-items: start !important;
            }

            .cart-line > :nth-child(3),
            .cart-line > :nth-child(4) {
              grid-column: 1 / -1 !important;
            }

            .order-item-line > :nth-child(2),
            .order-item-line > :nth-child(3) {
              grid-column: 1 / -1 !important;
              text-align: left !important;
            }

            .product-title {
              font-size: 30px !important;
              line-height: 1.2 !important;
            }

            .product-price-strong {
              font-size: 30px !important;
            }

            .product-form {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .product-form input,
            .product-form button {
              width: 100% !important;
            }

            .order-success-panel,
            .summary-box,
            .form-card,
            .mobile-form-card,
            .mobile-summary-box,
            .mobile-stock-box {
              padding: 20px !important;
            }

            .mobile-category-title {
              font-size: 16px !important;
              line-height: 1.4 !important;
              min-height: 0 !important;
            }

            .mobile-price-strong {
              font-size: 20px !important;
            }

            .mobile-inline-form {
              display: grid !important;
              grid-template-columns: minmax(0, 1fr) !important;
              gap: 8px !important;
            }

            .mobile-inline-form input,
            .mobile-inline-form button {
              width: 100% !important;
            }

            .cta-stack {
              display: grid !important;
              grid-template-columns: minmax(0, 1fr) !important;
              gap: 10px !important;
            }

            .cta-stack a,
            .cta-stack button {
              width: 100% !important;
              min-width: 0 !important;
            }
          }

          @media (max-width: 480px) {
            .site-shell-main,
            .site-page-frame,
            .site-shell-header > div,
            .site-shell-footer > div,
            .home-page-section > div,
            .page-section-title > div {
              padding-left: 12px !important;
              padding-right: 12px !important;
            }

            .home-page-main h1 {
              font-size: 29px !important;
            }

            .home-page-main h2 {
              font-size: 23px !important;
            }

            .home-product-list,
            .home-best-list,
            .quick-menu-grid {
              grid-template-columns: minmax(0, 1fr) !important;
            }

            .home-hero-card-main,
            .home-hero-card-side,
            .home-promo-card {
              padding: 20px 16px !important;
            }
          }
        `}</style>
      </head>
      <body
        style={{
          fontFamily: 'Pretendard, system-ui, sans-serif',
          margin: 0,
          background: '#f5f6f8',
          color: '#111827',
        }}
      >
        {children}
      </body>
    </html>
  );
}
