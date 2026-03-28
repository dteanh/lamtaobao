export const dynamic = 'force-dynamic';

import { getCustomerOrderView } from '@culi/core/orders';
import { SitePageFrame } from '../../_components/site-shell';

function progressBadgeStyle(active: boolean, done: boolean, muted: boolean) {
  if (active) return { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' };
  if (done) return { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
  if (muted) return { background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1' };
  return { background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' };
}

function stateBadgeStyle(kind: 'order' | 'payment', value: string) {
  if (value === 'COMPLETED' || value === 'PAID') return { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
  if (value === 'PROCESSING' || value === 'CONFIRMED' || value === 'PENDING') return { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' };
  if (value === 'FAILED' || value === 'CANCELED' || value === 'REFUNDED') return { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
  return { background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' };
}

type CustomerOrderView = NonNullable<Awaited<ReturnType<typeof getCustomerOrderView>>>;
type CustomerOrderItem = CustomerOrderView['items'][number];

export default async function CustomerOrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const order = await getCustomerOrderView({ orderId: id, token: String(query.token || '') });

  if (!order) {
    return (
      <SitePageFrame title="주문 조회">
        <div style={{ width: 960, margin: '0 auto', paddingTop: 48 }}>
          <div style={{ border: '1px solid #fecaca', background: '#fef2f2', padding: 28 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900 }}>Không truy cập được đơn hàng</h2>
            <p style={{ margin: 0, color: '#7f1d1d' }}>Link tra cứu không hợp lệ hoặc đã thiếu token.</p>
          </div>
        </div>
      </SitePageFrame>
    );
  }

  return (
    <SitePageFrame title="주문 상세" description={`Mã đơn: ${order.orderNumber}`}>
      <section style={{ paddingTop: 32 }}>
        <div style={{ width: 1472, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36 }}>
          <div>
            <div style={{ border: '1px solid #e5e7eb', padding: 28, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ borderRadius: 999, padding: '6px 12px', fontSize: 13, fontWeight: 700, ...stateBadgeStyle('order', order.status) }}>
                  Order {order.status}
                </span>
                <span style={{ borderRadius: 999, padding: '6px 12px', fontSize: 13, fontWeight: 700, ...stateBadgeStyle('payment', order.paymentState) }}>
                  Payment {order.paymentState}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, color: '#374151' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>주문번호</div>
                  <strong>{order.orderNumber}</strong>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>이메일</div>
                  <strong>{order.email}</strong>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>주문일시</div>
                  <strong>{order.createdAtFormatted}</strong>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #e5e7eb', padding: 28, marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 26, fontWeight: 800 }}>주문 진행 상태</h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {order.progress.map((step) => (
                  <span
                    key={step.key}
                    style={{ borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 700, ...progressBadgeStyle(step.active, step.done, step.muted) }}
                  >
                    {step.key}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '2px solid #111827' }}>
              {order.items.map((item: CustomerOrderItem) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 140px',
                    gap: 20,
                    alignItems: 'center',
                    padding: '20px 0',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ color: '#6b7280', fontSize: 14 }}>수량 {item.quantity}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontWeight: 700 }}>× {item.quantity}</div>
                  <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 800 }}>{item.totalPriceFormatted}</div>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div style={{ border: '1px solid #e5e7eb', padding: 24, background: '#fafafa' }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 24, fontWeight: 800 }}>결제 요약</h2>
              <div style={{ display: 'grid', gap: 12, fontSize: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{order.subtotalFormatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><strong>{order.shippingTotalFormatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><strong>{order.discountTotalFormatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #d1d5db', fontSize: 18 }}><span>Total</span><strong>{order.totalFormatted}</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SitePageFrame>
  );
}
