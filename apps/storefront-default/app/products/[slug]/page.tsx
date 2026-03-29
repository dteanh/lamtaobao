export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getCatalogProductDetail } from '@culi/core/catalog';
import { addToCartAction } from '../../actions';
import { SitePageFrame } from '../../_components/site-shell';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProductDetail(slug);

  if (!product) {
    notFound();
  }

  return (
    <SitePageFrame title={product.title} description={product.categories[0]?.name ?? '브랜드'}>
      <section className="home-page-section" style={{ paddingTop: 24 }}>
        <div style={{ width: 1472, margin: '0 auto' }}>
          <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 18 }}>
            {product.breadcrumbs.map((item, index) => (
              <span key={item.href}>
                {index > 0 ? ' / ' : ''}
                <a href={item.href} style={{ color: '#6b7280', textDecoration: 'none' }}>{item.title}</a>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="home-page-section" style={{ paddingTop: 12 }}>
        <div className="product-detail-grid" style={{ width: 1472, margin: '0 auto', display: 'grid', gridTemplateColumns: '720px 1fr', gap: 56 }}>
          <div>
            <div
              style={{
                aspectRatio: '1 / 1',
                background: product.featuredImage?.url
                  ? `center / cover no-repeat url(${product.featuredImage.url})`
                  : 'linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)',
                marginBottom: 18,
              }}
            />
            {product.gallery.length > 1 ? (
              <div className="thumb-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
                {product.gallery.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    style={{
                      aspectRatio: '1 / 1',
                      background: `center / cover no-repeat url(${image.url})`,
                      border: '1px solid #e5e7eb',
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 10 }}>{product.categories[0]?.name ?? '브랜드'}</div>
            <h1 className="product-title" style={{ margin: 0, fontSize: 40, lineHeight: 1.2, letterSpacing: '-0.04em', fontWeight: 900 }}>{product.title}</h1>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <strong className="product-price-strong" style={{ fontSize: 36 }}>{product.price.active.formatted}</strong>
              {product.price.sale ? (
                <span style={{ fontSize: 18, color: '#9ca3af', textDecoration: 'line-through' }}>
                  {product.price.regular.formatted}
                </span>
              ) : null}
            </div>

            <div className="mobile-stock-box" style={{ marginTop: 22, padding: '18px 20px', background: '#f9fafb', border: '1px solid #e5e7eb', lineHeight: 1.8 }}>
              <div><strong>재고</strong> : {product.stock.quantity}</div>
              <div><strong>상태</strong> : {product.stock.quantity > 0 ? '구매 가능' : '품절/대기'}</div>
            </div>

            <form className="product-form" action={addToCartAction} style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24 }}>
              <input type="hidden" name="productId" value={product.id} />
              <input
                type="number"
                name="quantity"
                min={1}
                defaultValue={1}
                style={{ width: 92, height: 52, border: '1px solid #d1d5db', padding: '0 14px', fontSize: 16 }}
              />
              <button
                type="submit"
                style={{
                  height: 52,
                  padding: '0 28px',
                  border: 0,
                  background: '#111827',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                장바구니 담기
              </button>
            </form>

            <div style={{ marginTop: 32, borderTop: '1px solid #e5e7eb', paddingTop: 28 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 800 }}>상품 설명</h2>
              <div
                style={{ color: '#374151', lineHeight: 1.9, fontSize: 15 }}
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml ?? '<p>Chưa có mô tả.</p>' }}
              />
            </div>
          </div>
        </div>
      </section>
    </SitePageFrame>
  );
}
