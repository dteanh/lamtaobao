import { prisma } from '@culi/db';
import { finalizeCouponUsage, getCartSummary, releaseCartInventoryReservation, reserveCartInventory } from '../cart';
import { getActiveCartState } from '../cart/repository';
import { err, ok, type AppResult } from '../shared/result';
import { logEvent } from '../shared/observability';
import { recordInventoryMovement } from '../inventory';

export type CheckoutInput = {
  cartToken: string;
  customer: {
    fullName: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    line1: string;
    city: string;
    district?: string;
    ward?: string;
    postalCode?: string;
    countryCode?: string;
  };
  paymentMethod: 'COD' | 'MANUAL_BANK_TRANSFER';
  notes?: string;
  idempotencyKey: string;
  requestId?: string;
};

function validateCheckoutInput(input: CheckoutInput) {
  if (!input.customer.fullName.trim()) return err('CUSTOMER_NAME_REQUIRED');
  if (!input.customer.email.trim() || !input.customer.email.includes('@')) return err('CUSTOMER_EMAIL_INVALID');
  if (!input.shippingAddress.line1.trim()) return err('ADDRESS_REQUIRED');
  if (!input.shippingAddress.city.trim()) return err('CITY_REQUIRED');
  if (!input.idempotencyKey.trim()) return err('INVALID_INPUT');
  return ok(true);
}

export async function createOrderFromCart(input: CheckoutInput): Promise<AppResult<{ orderNumber: string; orderId: string }>> {
  const validation = validateCheckoutInput(input);
  if (!validation.ok) return validation;

  const requestId = input.requestId || `checkout_${Date.now()}`;
  const existingOrder = await prisma.order.findFirst({ where: { idempotencyKey: input.idempotencyKey } });
  if (existingOrder) { logEvent('checkout_idempotent_replay', { idempotencyKey: input.idempotencyKey, orderId: existingOrder.id, requestId }); return ok({ orderNumber: existingOrder.orderNumber, orderId: existingOrder.id }); }

  const activeCart = await getActiveCartState(input.cartToken);
  if (!activeCart || activeCart.status !== 'ACTIVE') return err('CART_NOT_ACTIVE');
  if (activeCart.items.length === 0) return err('EMPTY_CART');

  const reservation = await reserveCartInventory(input.cartToken, requestId);
  if (!reservation.ok) return reservation;

  const cartSummary = await getCartSummary(input.cartToken);
  const method = input.paymentMethod === 'MANUAL_BANK_TRANSFER' ? 'MANUAL_BANK_TRANSFER' : 'COD';
  const orderNumber = `ORD-${Date.now()}`;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({ data: { fullName: input.customer.fullName.trim(), phone: input.customer.phone?.trim() || null, line1: input.shippingAddress.line1.trim(), city: input.shippingAddress.city.trim(), district: input.shippingAddress.district?.trim() || null, ward: input.shippingAddress.ward?.trim() || null, postalCode: input.shippingAddress.postalCode?.trim() || null, countryCode: input.shippingAddress.countryCode ?? 'VN' } });
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          idempotencyKey: input.idempotencyKey,
          email: input.customer.email.trim().toLowerCase(),
          phone: input.customer.phone?.trim() || null,
          currency: cartSummary.currency,
          subtotal: cartSummary.subtotal.amount,
          shippingTotal: cartSummary.shippingTotal.amount,
          discountTotal: cartSummary.discountTotal.amount,
          total: cartSummary.total.amount,
          notes: input.notes?.trim() || null,
          paymentMethod: method,
          shippingAddressId: address.id,
          billingAddressId: address.id,
          items: { create: cartSummary.items.map((item) => ({ productId: item.productId, productName: item.title, productSlug: item.slug, quantity: item.quantity, unitPrice: item.unitPrice.amount, lineTotal: item.lineTotal.amount })) },
          payments: { create: [{ method, amount: cartSummary.total.amount }] },
        },
      });

      for (const item of cartSummary.items) {
        const beforeInventory = await tx.inventory.findUnique({ where: { productId: item.productId } });
        await tx.inventory.updateMany({ where: { productId: item.productId }, data: { quantity: { decrement: item.quantity }, reserved: { decrement: item.quantity } } });
        await recordInventoryMovement({ productId: item.productId, actor: { requestId, source: 'checkout_commit' }, action: 'commit', before: { quantity: beforeInventory?.quantity ?? 0, reserved: beforeInventory?.reserved ?? 0 }, after: { quantity: (beforeInventory?.quantity ?? 0) - item.quantity, reserved: Math.max(0, (beforeInventory?.reserved ?? 0) - item.quantity) }, meta: { cartToken: input.cartToken, orderId: createdOrder.id, orderNumber: createdOrder.orderNumber, committedQuantity: item.quantity } });
      }

      await tx.inventoryReservation.deleteMany({ where: { cartToken: input.cartToken } });
      await tx.cart.update({ where: { token: input.cartToken }, data: { status: 'CONVERTED' } });
      return createdOrder;
    });

    await finalizeCouponUsage(input.cartToken);
    logEvent('checkout_order_created', { orderId: order.id, orderNumber: order.orderNumber, idempotencyKey: input.idempotencyKey, cartToken: input.cartToken, requestId });
    return ok({ orderNumber: order.orderNumber, orderId: order.id });
  } catch {
    await releaseCartInventoryReservation(input.cartToken, requestId);
    logEvent('checkout_order_failed', { idempotencyKey: input.idempotencyKey, cartToken: input.cartToken, requestId });
    return err('UNKNOWN_ERROR');
  }
}
