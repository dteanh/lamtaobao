import { updateAdminOrderLifecycle, getAdminOrderDetail } from '@culi/core/orders';
import { auditMutation } from '@culi/core/admin/mutation-audit';

export const ORDER_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELED'] as const;
export type AdminOrderLifecycleStatus = typeof ORDER_STATUS_OPTIONS[number];

const ORDER_TRANSITIONS: Record<AdminOrderLifecycleStatus, AdminOrderLifecycleStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['PROCESSING', 'CANCELED'],
  PROCESSING: ['COMPLETED', 'CANCELED'],
  COMPLETED: [],
  CANCELED: [],
};

export function getAllowedOrderTransitions(status: AdminOrderLifecycleStatus) {
  return ORDER_TRANSITIONS[status] ?? [];
}

export function canTransitionOrderStatus(from: AdminOrderLifecycleStatus, to: AdminOrderLifecycleStatus) {
  if (from === to) return true;
  return getAllowedOrderTransitions(from).includes(to);
}

export async function applyAdminOrderLifecycleUpdate(input: {
  actorUserId: string;
  actorEmail: string;
  requestId: string;
  id: string;
  status?: AdminOrderLifecycleStatus;
  internalNote?: string | null;
}) {
  const beforeResult = await getAdminOrderDetail(input.id);
  if (!beforeResult.ok) {
    const err = new Error('NOT_FOUND');
    (err as any).code = 'NOT_FOUND';
    throw err;
  }
  const before = beforeResult.data;

  const nextStatus = input.status ?? (before.status as AdminOrderLifecycleStatus);
  if (!canTransitionOrderStatus(before.status as AdminOrderLifecycleStatus, nextStatus)) {
    const err = new Error('INVALID_ORDER_TRANSITION');
    (err as any).code = 'INVALID_ORDER_TRANSITION';
    (err as any).details = { from: before.status, to: nextStatus, allowed: getAllowedOrderTransitions(before.status as AdminOrderLifecycleStatus) };
    throw err;
  }

  const order = await updateAdminOrderLifecycle({ id: input.id, status: input.status, internalNote: input.internalNote ?? null });
  await auditMutation({
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    entityType: 'order',
    entityId: input.id,
    action: 'update',
    requestId: input.requestId,
    before: { status: before.status, internalNote: before.internalNote ?? null },
    after: { status: order.status, internalNote: order.internalNote ?? null },
    meta: { event: 'order_lifecycle_update', allowedTransitions: getAllowedOrderTransitions(before.status as AdminOrderLifecycleStatus) },
  });
  return order;
}
