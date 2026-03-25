export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../../lib/csrf';
import { requireAdminPage } from '../../../lib/guard';
import { getAdminOrderDetail } from '@culi/core/orders/service';
import { updateOrderLifecycleAction, updateOrderPaymentAction } from '../actions';
import { prisma } from '@culi/db';

function badgeStyle(value: string) {
  if (value === 'COMPLETED' || value === 'PAID') return { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
  if (value === 'PROCESSING' || value === 'CONFIRMED' || value === 'PENDING') return { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' };
  if (value === 'FAILED' || value === 'CANCELED' || value === 'REFUNDED') return { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
  return { background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' };
}

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const csrfToken = await readAdminCsrfToken();
  const { id } = await params;
  const query = await searchParams;
  const detailResult = await getAdminOrderDetail(id);
  if (!detailResult.ok) return <main style={{ padding: 24 }}>Order not found.</main>;
  const order = detailResult.data;
  const audits = await prisma.auditLog.findMany({ where: { entityType: 'order', entityId: id }, orderBy: { createdAt: 'desc' }, take: 20 });

  return (
    <main style={{ padding: 24 }}>
      <h1>Order {order.orderNumber}</h1>
      {query.error ? <p style={{ color: 'crimson' }}>Error: {String(query.error)}</p> : null}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 13, fontWeight: 700, ...badgeStyle(order.status) }}>{order.status}</span>
        <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 13, fontWeight: 700, ...badgeStyle(order.paymentState) }}>Payment {order.paymentState}</span>
      </div>
      <p>Customer: {order.customerName} — {order.customerEmail} — {order.customerPhone}</p>
      <p>Total: {order.total} {order.currency}</p>
      <p>Internal note: {order.internalNote || 'n/a'}</p>

      <section style={{ marginTop: 24 }}>
        <h2>Lifecycle</h2>
        <form action={updateOrderLifecycleAction} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="id" value={order.id} />
          <select name="status" defaultValue={order.status}>
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELED'].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <textarea name="internalNote" defaultValue={order.internalNote || ''} placeholder="Internal note" />
          <button type="submit">Update order</button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Payment actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['PAID', 'FAILED', 'REFUNDED'].map((status) => (
            <form key={status} action={updateOrderPaymentAction} style={{ display: 'grid', gap: 8, minWidth: 240 }}>
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="paymentStatus" value={status} />
              <input name="note" placeholder={`Note for ${status.toLowerCase()}`} />
              <button type="submit">Mark {status.toLowerCase()}</button>
            </form>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Payment history</h2>
        <ul>
          {order.payments.map((payment: { id: string; createdAt: string; status: string; method: string; amount: number; transactionRef: string | null }) => (
            <li key={payment.id}>{payment.createdAt} — {payment.status} — {payment.method} — {payment.amount} {order.currency} — {payment.transactionRef}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Items</h2>
        <ul>
          {order.items.map((item: { id: string; title: string; quantity: number; totalPrice: number }) => (
            <li key={item.id}>{item.title} — qty {item.quantity} — total {item.totalPrice} {order.currency}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Timeline / audit</h2>
        <ul>
          {audits.map((entry) => (
            <li key={entry.id}>{String(entry.createdAt)} — {entry.action} — {JSON.stringify(entry.payload)}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
