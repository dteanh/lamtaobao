import { getOrderById, listOrders, updateOrderLifecycle } from './repository';
import { deriveOrderPaymentState } from '../../../../apps/admin/lib/order-payments';

export async function listAdminOrders() {
  const orders = await listOrders();
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentState: deriveOrderPaymentState(order.payments),
    customerName: order.email,
    total: Number(order.total),
    currency: order.currency,
    placedAt: order.createdAt.toISOString(),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      method: payment.method,
      transactionRef: payment.transactionRef,
      status: payment.status,
      amount: Number(payment.amount),
      createdAt: payment.createdAt.toISOString(),
    })),
  }));
}

export async function getAdminOrderDetail(id: string) {
  const order = await getOrderById(id);
  if (!order) return { ok: false as const };

  return {
    ok: true as const,
    data: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentState: deriveOrderPaymentState(order.payments),
      customerName: order.email,
      customerEmail: order.email,
      customerPhone: order.phone,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      currency: order.currency,
      notes: order.notes,
      internalNote: order.internalNote,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.lineTotal),
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        method: payment.method,
        transactionRef: payment.transactionRef,
        status: payment.status,
        amount: Number(payment.amount),
        metadata: payment.metadata,
        paidAt: payment.paidAt?.toISOString() ?? null,
        createdAt: payment.createdAt.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    },
  };
}

export async function getAdminOrders() {
  return listAdminOrders();
}

export async function updateAdminOrderLifecycle(input: { id: string; status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED'; internalNote?: string | null }) {
  return updateOrderLifecycle(input);
}
