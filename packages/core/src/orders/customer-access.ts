import crypto from 'node:crypto';
import { prisma } from '@culi/db';
import { getOrderById } from './repository';
import { deriveOrderPaymentState } from '../../../../apps/admin/lib/order-payments';

function getSecret() {
  return process.env.ORDER_LOOKUP_SECRET || process.env.NEXTAUTH_SECRET || process.env.ADMIN_SESSION_SECRET || 'dev-order-lookup-secret';
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
}

export function createOrderLookupToken(orderId: string) {
  return crypto.createHmac('sha256', getSecret()).update(`order:${orderId}`).digest('hex');
}

export function verifyOrderLookupToken(orderId: string, token: string) {
  const expected = createOrderLookupToken(orderId);
  const a = Buffer.from(expected);
  const b = Buffer.from(token || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function getOrderProgress(status: string) {
  const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELED'];
  const currentIndex = steps.indexOf(status);
  return steps.map((step, index) => ({
    key: step,
    active: step === status,
    done: currentIndex >= 0 && step !== 'CANCELED' && index <= currentIndex,
    muted: status === 'CANCELED' ? step !== 'CANCELED' : currentIndex >= 0 && index > currentIndex,
  }));
}

function toCustomerOrderView(order: Awaited<ReturnType<typeof getOrderById>> extends infer T ? Exclude<T, null> : never) {
  const createdAt = order.createdAt.toISOString();
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    progress: getOrderProgress(order.status),
    paymentState: deriveOrderPaymentState(order.payments),
    email: order.email,
    items: order.items.map((item) => ({
      id: item.id,
      title: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      unitPriceFormatted: formatMoney(Number(item.unitPrice), order.currency),
      totalPrice: Number(item.lineTotal),
      totalPriceFormatted: formatMoney(Number(item.lineTotal), order.currency),
    })),
    subtotal: Number(order.subtotal),
    subtotalFormatted: formatMoney(Number(order.subtotal), order.currency),
    shippingTotal: Number(order.shippingTotal),
    shippingTotalFormatted: formatMoney(Number(order.shippingTotal), order.currency),
    discountTotal: Number(order.discountTotal),
    discountTotalFormatted: formatMoney(Number(order.discountTotal), order.currency),
    total: Number(order.total),
    totalFormatted: formatMoney(Number(order.total), order.currency),
    currency: order.currency,
    createdAt,
    createdAtFormatted: formatTimestamp(createdAt),
  };
}

export async function getCustomerOrderView(input: { orderId: string; token: string }) {
  if (!verifyOrderLookupToken(input.orderId, input.token)) return null;
  const order = await getOrderById(input.orderId);
  if (!order) return null;
  return toCustomerOrderView(order);
}

export async function findCustomerOrderLookup(input: { orderNumber: string; email: string }) {
  const orderNumber = input.orderNumber.trim();
  const email = input.email.trim().toLowerCase();
  if (!orderNumber || !email || !email.includes('@')) return null;
  const order = await prisma.order.findFirst({ where: { orderNumber, email }, include: { items: true, payments: { orderBy: { createdAt: 'desc' } }, shippingAddress: true, billingAddress: true } });
  if (!order) return null;
  return {
    orderId: order.id,
    token: createOrderLookupToken(order.id),
    orderNumber: order.orderNumber,
  };
}
