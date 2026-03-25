import { NextRequest } from 'next/server';
import { getAdminOrders } from '@culi/core/orders';
import { getAdminSession, cleanupExpiredAdminSessions } from '../../../../lib/session';
import { getRequestIdFromNextRequest } from '../../../../lib/request';
import { apiError, apiOk } from '../../../../lib/api-response';

export async function GET(req: NextRequest) {
  const requestId = getRequestIdFromNextRequest(req);
  await cleanupExpiredAdminSessions();
  const session = await getAdminSession();
  if (!session) return apiError({ requestId, code: 'UNAUTHORIZED' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.max(1, Number(searchParams.get('pageSize') || 20));
  const status = (searchParams.get('status') || '').trim();
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  const all = await getAdminOrders();
  const filtered = all.filter((o: Awaited<ReturnType<typeof getAdminOrders>>[number]) => {
    const matchStatus = !status || o.status === status;
    const hay = `${o.orderNumber} ${o.id}`.toLowerCase();
    const matchQ = !q || hay.includes(q);
    return matchStatus && matchQ;
  });
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  return apiOk({
    requestId,
    ts: new Date().toISOString(),
    page,
    pageSize,
    total: filtered.length,
    items: items.map((o) => ({ id: o.id, orderNumber: o.orderNumber, total: String(o.total), status: o.status, paymentState: o.paymentState })),
    filters: { status: status || null, q: q || null },
  });
}
