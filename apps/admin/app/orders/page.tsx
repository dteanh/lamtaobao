export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../lib/csrf';
import { requireAdminPage } from '../../lib/guard';
import { listAdminOrders } from '@culi/core/orders/service';

function badgeStyle(value: string) {
  if (value === 'COMPLETED' || value === 'PAID' || value === 'HEALTHY') return { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
  if (value === 'PROCESSING' || value === 'CONFIRMED' || value === 'PENDING') return { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' };
  if (value === 'FAILED' || value === 'CANCELED' || value === 'REFUNDED' || value === 'LOW') return { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
  return { background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' };
}

export default async function OrdersPage() {
  await requireAdminPage();
  await readAdminCsrfToken();
  const orders = await listAdminOrders();

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  const paymentCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.paymentState] = (acc[order.paymentState] || 0) + 1;
    return acc;
  }, {});

  return (
    <main style={{ padding: 24 }}>
      <h1>Orders</h1>
      <p>{Object.entries(statusCounts).map(([status, count]) => `${status} — ${count}`).join(' · ')}</p>
      <p>{Object.entries(paymentCounts).map(([status, count]) => `${status} — ${count}`).join(' · ')}</p>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {orders.map((order) => (
          <li key={order.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href={`/orders/${order.id}`}>{order.orderNumber}</a>
              <span style={{ borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700, ...badgeStyle(order.status) }}>{order.status}</span>
              <span style={{ borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700, ...badgeStyle(order.paymentState) }}>Payment {order.paymentState}</span>
            </div>
            <div style={{ marginTop: 6 }}>{order.customerName} — {order.total} {order.currency} — items {order.itemCount}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
