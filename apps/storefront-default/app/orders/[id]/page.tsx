export const dynamic = 'force-dynamic';

import { getCustomerOrderView } from '@culi/core/orders';

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

export default async function CustomerOrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const order = await getCustomerOrderView({ orderId: id, token: String(query.token || '') });

  if (!order) {
    return (
      <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
        <h1>Không truy cập được đơn hàng</h1>
        <p>Link tra cứu không hợp lệ hoặc đã thiếu token.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1>Tra cứu đơn hàng</h1>
      <p>Mã đơn: {order.orderNumber}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 13, fontWeight: 700, ...stateBadgeStyle('order', order.status) }}>Order {order.status}</span>
        <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 13, fontWeight: 700, ...stateBadgeStyle('payment', order.paymentState) }}>Payment {order.paymentState}</span>
      </div>
      <p>Email: {order.email}</p>
      <p>Đặt lúc: {order.createdAtFormatted}</p>

      <section style={{ marginTop: 24 }}>
        <h2>Tiến trình đơn hàng</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {order.progress.map((step) => (
            <span key={step.key} style={{ borderRadius: 999, padding: '4px 10px', fontSize: 13, fontWeight: 600, ...progressBadgeStyle(step.active, step.done, step.muted) }}>
              {step.key}
            </span>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Items</h2>
        <ul>
          {order.items.map((item) => (
            <li key={item.id}>{item.title} — qty {item.quantity} — {item.totalPriceFormatted}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Totals</h2>
        <ul>
          <li>Subtotal: {order.subtotalFormatted}</li>
          <li>Shipping: {order.shippingTotalFormatted}</li>
          <li>Discount: {order.discountTotalFormatted}</li>
          <li><strong>Total: {order.totalFormatted}</strong></li>
        </ul>
      </section>
    </main>
  );
}
