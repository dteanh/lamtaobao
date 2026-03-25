import { prisma } from '@culi/db';
import { auditMutation } from '@culi/core/admin/mutation-audit';

export const ADMIN_PAYMENT_STATES = ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;
export type AdminPaymentState = (typeof ADMIN_PAYMENT_STATES)[number];

export function deriveOrderPaymentState(payments: Array<{ status: string; createdAt?: string | Date | null }>): AdminPaymentState {
  if (!payments.length) return 'UNPAID';
  const latest = [...payments].sort((a, b) => {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  })[0];
  switch (latest?.status) {
    case 'PAID':
      return 'PAID';
    case 'FAILED':
      return 'FAILED';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'PENDING':
      return 'PENDING';
    default:
      return 'UNPAID';
  }
}

export async function applyAdminOrderPaymentUpdate(input: {
  actorUserId: string;
  actorEmail: string;
  requestId: string;
  id: string;
  paymentStatus: Extract<AdminPaymentState, 'PAID' | 'FAILED' | 'REFUNDED'>;
  note?: string | null;
}) {
  const order = await prisma.order.findUnique({ where: { id: input.id }, include: { payments: { orderBy: { createdAt: 'desc' } } } });
  if (!order) {
    const error = new Error('ORDER_NOT_FOUND') as Error & { code?: string };
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  const before = {
    paymentState: deriveOrderPaymentState(order.payments),
    payments: order.payments.map((payment) => ({ id: payment.id, status: payment.status, method: payment.method, amount: Number(payment.amount), transactionRef: payment.transactionRef, createdAt: payment.createdAt })),
  };

  const latestPaid = order.payments.find((payment) => payment.status === 'PAID');
  const transactionRef = `admin_${input.paymentStatus.toLowerCase()}_${Date.now()}`;

  if (input.paymentStatus === 'REFUNDED' && !latestPaid) {
    const error = new Error('PAYMENT_REFUND_REQUIRES_PAID') as Error & { code?: string };
    error.code = 'PAYMENT_REFUND_REQUIRES_PAID';
    throw error;
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      method: order.paymentMethod,
      status: input.paymentStatus,
      amount: latestPaid?.amount ?? order.total,
      transactionRef,
      paidAt: input.paymentStatus === 'PAID' ? new Date() : null,
      metadata: {
        source: 'admin_manual_payment_action',
        requestId: input.requestId,
        actorEmail: input.actorEmail,
        note: input.note ?? null,
      },
    },
  });

  const afterOrder = await prisma.order.findUnique({ where: { id: order.id }, include: { payments: { orderBy: { createdAt: 'desc' } } } });
  const after = {
    paymentState: deriveOrderPaymentState(afterOrder?.payments ?? []),
    payments: (afterOrder?.payments ?? []).map((payment) => ({ id: payment.id, status: payment.status, method: payment.method, amount: Number(payment.amount), transactionRef: payment.transactionRef, createdAt: payment.createdAt })),
  };

  await auditMutation({
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    entityType: 'order',
    entityId: order.id,
    action: `payment_${input.paymentStatus.toLowerCase()}`,
    requestId: input.requestId,
    before,
    after,
    meta: { note: input.note ?? null, paymentStatus: input.paymentStatus, transactionRef },
  });

  return afterOrder;
}
