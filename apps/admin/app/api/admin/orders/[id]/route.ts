import { NextRequest } from 'next/server';
import { getAdminOrderDetail } from '@culi/core/orders';
import { requireAdminApi } from '../../../../../lib/api-guard';
import { apiError, apiOk } from '../../../../../lib/api-response';
import { applyAdminOrderLifecycleUpdate, getAllowedOrderTransitions } from '../../../../../lib/order-lifecycle';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi(req);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const orderResult = await getAdminOrderDetail(id);
  if (!orderResult.ok) return apiError({ requestId: guard.requestId, code: 'NOT_FOUND' }, { status: 404 });
  const order = orderResult.data;
  return apiOk({ requestId: guard.requestId, order, allowedTransitions: getAllowedOrderTransitions(order.status as any) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  try {
    const order = await applyAdminOrderLifecycleUpdate({
      actorUserId: guard.session.userId,
      actorEmail: guard.session.email,
      requestId: guard.requestId,
      id,
      status: body.status,
      internalNote: body.internalNote ?? null,
    });
    return apiOk({ requestId: guard.requestId, orderId: order.id, status: order.status, internalNote: order.internalNote ?? null, allowedTransitions: getAllowedOrderTransitions(order.status as any) });
  } catch (error: any) {
    return apiError({ requestId: guard.requestId, code: error?.code || 'ORDER_UPDATE_FAILED', details: error?.details || null }, { status: error?.code === 'NOT_FOUND' ? 404 : 400 });
  }
}
