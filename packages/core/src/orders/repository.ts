import { prisma } from '@culi/db';

export async function listOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      payments: { orderBy: { createdAt: 'desc' } },
      shippingAddress: true,
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: 'desc' } },
      shippingAddress: true,
      billingAddress: true,
    },
  });
}

export async function updateOrderLifecycle(input: { id: string; status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED'; internalNote?: string | null }) {
  const data: Record<string, unknown> = {};
  if (input.status) data.status = input.status;
  if (input.internalNote !== undefined) data.internalNote = input.internalNote;
  return prisma.order.update({ where: { id: input.id }, data, include: { items: true, payments: { orderBy: { createdAt: 'desc' } }, shippingAddress: true, billingAddress: true } });
}
