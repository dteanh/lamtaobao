export const dynamic = 'force-dynamic';

import { SitePageFrame } from '../_components/site-shell';

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ orderNumber?: string; orderId?: string; token?: string }> }) {
  const params = await searchParams;
  const trackingHref = params.orderId && params.token ? `/orders/${params.orderId}?token=${encodeURIComponent(params.token)}` : null;

  return (
    <SitePageFrame title="주문 완료">
      <section className="home-page-section" style={{ paddingTop: 48 }}>
        <div style={{ width: 900, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              margin: '0 auto 24px',
              background: '#d91f29',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            ✓
          </div>
          <h2 style={{ margin: 0, fontSize: 40, lineHeight: 1.2, letterSpacing: '-0.04em', fontWeight: 900 }}>주문이 정상적으로 접수되었습니다.</h2>
          <p style={{ margin: '16px 0 0', fontSize: 18, color: '#4b5563' }}>Mã đơn hàng của bạn là <strong>{params.orderNumber ?? 'N/A'}</strong></p>

          <div className="order-success-panel" style={{ marginTop: 34, border: '1px solid #e5e7eb', background: '#fafafa', padding: 28, textAlign: 'left' }}>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: '#374151' }}>
              <li>Lưu lại mã đơn để tra cứu về sau.</li>
              <li>Dùng đúng email đã checkout khi tra cứu đơn.</li>
              <li>Nếu cần theo dõi chi tiết, dùng link tra cứu bên dưới.</li>
            </ul>
          </div>

          <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {trackingHref ? (
              <a
                href={trackingHref}
                style={{
                  minWidth: 220,
                  height: 52,
                  lineHeight: '52px',
                  textDecoration: 'none',
                  background: '#111827',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                주문 상세 보기
              </a>
            ) : null}
            <a
              href="/order-lookup"
              style={{
                minWidth: 220,
                height: 52,
                lineHeight: '52px',
                textDecoration: 'none',
                background: '#fff',
                color: '#111827',
                fontWeight: 800,
                border: '1px solid #d1d5db',
              }}
            >
              주문 조회하기
            </a>
            <a
              href="/"
              style={{
                minWidth: 220,
                height: 52,
                lineHeight: '52px',
                textDecoration: 'none',
                background: '#d91f29',
                color: '#fff',
                fontWeight: 800,
              }}
            >
              메인으로 이동
            </a>
          </div>
        </div>
      </section>
    </SitePageFrame>
  );
}
