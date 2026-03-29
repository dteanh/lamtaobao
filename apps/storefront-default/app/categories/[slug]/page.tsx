export const dynamic = 'force-dynamic';

import { getCatalogCollection } from '@culi/core/catalog';
import { SitePageFrame } from '../../_components/site-shell';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCatalogCollection({ page: 1, pageSize: 20, categorySlug: slug });

  return (
    <SitePageFrame title={collection.title} description={`총 ${collection.pagination.totalItems}개 상품`}>
      <section className="home-page-section" style={{ paddingTop: 34 }}>
        <div style={{ width: 1472, margin: '0 auto' }}>
          <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 18 }}>
            <a href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>홈</a> / <span>{slug}</span>
          </div>
          <div
            className="category-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 28,
            }}
          >
            {collection.items.map((item) => (
              <a key={item.id} href={`/products/${item.slug}`} style={{ textDecoration: 'none', color: '#111827', display: 'block' }}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <div
                    style={{
                      aspectRatio: '1 / 1',
                      background: item.featuredImage?.url
                        ? `center / cover no-repeat url(${item.featuredImage.url})`
                        : 'linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 12,
                      bottom: 12,
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 10px 18px rgba(0,0,0,0.10)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 18,
                    }}
                  >
                    🛒
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{item.categoryNames?.[0] ?? item.categorySlugs[0] ?? slug}</div>
                <div className="mobile-category-title" style={{ fontSize: 18, lineHeight: 1.45, fontWeight: 700, minHeight: 54 }}>{item.title}</div>
                <div style={{ marginTop: 8, color: '#6b7280', fontSize: 14, minHeight: 42 }}>
                  {item.excerpt ?? '상세 페이지에서 상품 특징과 옵션을 확인하세요.'}
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <strong style={{ fontSize: 22 }}>{item.price.active.formatted}</strong>
                  {item.price.sale ? (
                    <span style={{ fontSize: 15, color: '#9ca3af', textDecoration: 'line-through' }}>
                      {item.price.regular.formatted}
                    </span>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </SitePageFrame>
  );
}
