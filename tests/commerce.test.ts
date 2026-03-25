import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { cleanupExpiredReservations } from '../packages/core/src/cart/repository';
import { calculateCouponDiscount } from '../packages/core/src/cart/service';
import { createOrderFromCart } from '../packages/core/src/checkout/service';

const prisma = new PrismaClient();

test('checkout idempotency returns same order for same key', async () => {
  const product = await prisma.product.findUnique({ where: { slug: 'vitamin-c-serum' } });
  assert.ok(product);

  const token = `test_idem_${Date.now()}`;
  const cart = await prisma.cart.create({ data: { token, currency: 'VND' } });
  await prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity: 1, unitPrice: 280000 } });

  const key = `idem_${Date.now()}`;
  const first = await createOrderFromCart({
    cartToken: token,
    idempotencyKey: key,
    customer: { fullName: 'Idem User', email: 'idem@culi.local', phone: '0901' },
    shippingAddress: { line1: 'A', city: 'HCM' },
    paymentMethod: 'COD',
  });
  const second = await createOrderFromCart({
    cartToken: token,
    idempotencyKey: key,
    customer: { fullName: 'Idem User', email: 'idem@culi.local', phone: '0901' },
    shippingAddress: { line1: 'A', city: 'HCM' },
    paymentMethod: 'COD',
  });

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (first.ok && second.ok) {
    assert.equal(first.data.orderId, second.data.orderId);
  }
});

test('reservation cleanup releases expired reserved stock', async () => {
  const product = await prisma.product.findUnique({ where: { slug: 'marine-collagen' }, include: { inventory: true } });
  assert.ok(product?.inventory);

  const before = product.inventory.reserved;
  await prisma.inventory.update({ where: { productId: product.id }, data: { reserved: before + 2 } });
  await prisma.inventoryReservation.create({
    data: {
      cartToken: `expired_${Date.now()}`,
      productId: product.id,
      quantity: 2,
      expiresAt: new Date(Date.now() - 60_000),
    },
  });

  const cleaned = await cleanupExpiredReservations();
  const after = await prisma.inventory.findUnique({ where: { productId: product.id } });
  assert.ok(cleaned >= 1);
  assert.equal(after?.reserved, before);
});

test('coupon rules validate product/category/minimum logic', async () => {
  const categoryCoupon = await prisma.coupon.upsert({
    where: { code: 'CATSKIN' },
    update: { type: 'PERCENTAGE', value: 15, appliesToCategorySlug: 'skincare', minimumQuantity: 1, isActive: true },
    create: { code: 'CATSKIN', type: 'PERCENTAGE', value: 15, appliesToCategorySlug: 'skincare', minimumQuantity: 1, isActive: true },
  });
  assert.ok(categoryCoupon);

  const okResult = await calculateCouponDiscount({
    code: 'CATSKIN',
    subtotalAmount: 300000,
    items: [{ slug: 'vitamin-c-serum', quantity: 1, categorySlugs: ['skincare'] }],
  });
  assert.equal(okResult.valid, true);
  if (okResult.valid) assert.equal(okResult.amount, 45000);

  const badResult = await calculateCouponDiscount({
    code: 'CATSKIN',
    subtotalAmount: 300000,
    items: [{ slug: 'marine-collagen', quantity: 1, categorySlugs: ['supplements'] }],
  });
  assert.equal(badResult.valid, false);
});
