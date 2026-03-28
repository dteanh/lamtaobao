import type { CartSummary } from '@culi/theme-sdk/contracts';
import { prisma } from '@culi/db';
import { formatMoney } from '../pricing/money';

type TxClient = {
  inventory: typeof prisma.inventory;
  inventoryReservation: typeof prisma.inventoryReservation;
};
import { err, ok, type AppResult } from '../shared/result';
import {
  cleanupExpiredReservations,
  consumeCouponUsage,
  ensureCart,
  getActiveCartState,
  getCouponByCode,
  getPublishedProductForCart,
  getCartByToken,
  setCartCouponCode,
  upsertCartItem,
  updateCartItemQuantity,
} from './repository';
import { recordInventoryMovement } from '../inventory';

function toNumber(value: string) {
  return Number(value);
}

function resolveAvailableQuantity(inventory?: { quantity: number; reserved: number; policy: 'DENY_BACKORDER' | 'ALLOW_BACKORDER' } | null) {
  if (!inventory) return 0;
  return Math.max(0, inventory.quantity - inventory.reserved);
}

export async function reserveCartInventory(token: string, requestId = `reserve_${Date.now()}`): Promise<AppResult<true>> {
  await cleanupExpiredReservations();
  const cart = await getActiveCartState(token);
  if (!cart) return err('EMPTY_CART');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  for (const item of cart.items) {
    const available = resolveAvailableQuantity(item.product.inventory);
    const policy = item.product.inventory?.policy ?? 'DENY_BACKORDER';
    if (policy !== 'ALLOW_BACKORDER' && item.quantity > available) {
      return err('INSUFFICIENT_STOCK');
    }
  }

  await prisma.$transaction(async (tx: TxClient) => {
    for (const item of cart.items) {
      const existing = await tx.inventoryReservation.findFirst({ where: { cartToken: token, productId: item.product.id } });
      const currentReserved = existing?.quantity ?? 0;
      const diff = item.quantity - currentReserved;

      if (diff > 0) {
        const inventory = await tx.inventory.findUnique({ where: { productId: item.product.id } });
        const available = Math.max(0, (inventory?.quantity ?? 0) - (inventory?.reserved ?? 0));
        const policy = inventory?.policy ?? 'DENY_BACKORDER';
        if (policy !== 'ALLOW_BACKORDER' && diff > available) {
          throw new Error('INSUFFICIENT_STOCK');
        }
        await tx.inventory.updateMany({ where: { productId: item.product.id }, data: { reserved: { increment: diff } } });
        await recordInventoryMovement({ productId: item.product.id, actor: { requestId, source: 'cart_reserve' }, action: 'reserve', before: { quantity: inventory?.quantity ?? 0, reserved: inventory?.reserved ?? 0 }, after: { quantity: inventory?.quantity ?? 0, reserved: (inventory?.reserved ?? 0) + diff }, meta: { cartToken: token, reservationDelta: diff, expiresAt: expiresAt.toISOString() } });
      } else if (diff < 0) {
        const inventory = await tx.inventory.findUnique({ where: { productId: item.product.id } });
        await tx.inventory.updateMany({ where: { productId: item.product.id }, data: { reserved: { decrement: Math.abs(diff) } } });
        await recordInventoryMovement({ productId: item.product.id, actor: { requestId, source: 'cart_reserve' }, action: 'release', before: { quantity: inventory?.quantity ?? 0, reserved: inventory?.reserved ?? 0 }, after: { quantity: inventory?.quantity ?? 0, reserved: Math.max(0, (inventory?.reserved ?? 0) - Math.abs(diff)) }, meta: { cartToken: token, reservationDelta: diff } });
      }

      await tx.inventoryReservation.upsert({ where: { cartToken_productId: { cartToken: token, productId: item.product.id } }, update: { quantity: item.quantity, expiresAt }, create: { cartToken: token, productId: item.product.id, quantity: item.quantity, expiresAt } });
    }
  });

  return ok(true);
}

export async function releaseCartInventoryReservation(token: string, requestId = `release_${Date.now()}`): Promise<void> {
  const reservations = await prisma.inventoryReservation.findMany({ where: { cartToken: token } });
  if (reservations.length === 0) return;

  await prisma.$transaction(async (tx: TxClient) => {
    for (const reservation of reservations) {
      const inventory = await tx.inventory.findUnique({ where: { productId: reservation.productId } });
      await tx.inventory.updateMany({ where: { productId: reservation.productId }, data: { reserved: { decrement: reservation.quantity } } });
      await recordInventoryMovement({ productId: reservation.productId, actor: { requestId, source: 'cart_release' }, action: 'release', before: { quantity: inventory?.quantity ?? 0, reserved: inventory?.reserved ?? 0 }, after: { quantity: inventory?.quantity ?? 0, reserved: Math.max(0, (inventory?.reserved ?? 0) - reservation.quantity) }, meta: { cartToken: token, reservationDelta: -reservation.quantity } });
    }
    await prisma.inventoryReservation.deleteMany({ where: { cartToken: token } });
  });
}

export async function validateCartInventory(token: string) {
  const cart = await getActiveCartState(token);
  if (!cart) {
    return { ok: true as const, items: [] };
  }

  const violations = cart.items.flatMap((item) => {
    const available = resolveAvailableQuantity(item.product.inventory);
    const policy = item.product.inventory?.policy ?? 'DENY_BACKORDER';
    if (policy === 'ALLOW_BACKORDER') return [];
    if (item.quantity <= available + (item.product.inventory?.reserved ?? 0)) return [];
    return [{ itemId: item.id, productId: item.product.id, title: item.product.title, requested: item.quantity, available }];
  });

  return { ok: violations.length === 0, items: violations };
}

export async function calculateCouponDiscount(input: { code?: string | null; subtotalAmount: number; items?: Array<{ slug: string; quantity: number; categorySlugs?: string[] }> }) {
  if (!input.code) return { valid: false as const, amount: 0, code: null, reason: 'COUPON_NOT_FOUND' as const };
  const coupon = await getCouponByCode(input.code);
  if (!coupon || !coupon.isActive) return { valid: false as const, amount: 0, code: input.code, reason: 'COUPON_NOT_FOUND' as const };
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { valid: false as const, amount: 0, code: input.code, reason: 'COUPON_NOT_STARTED' as const };
  if (coupon.endsAt && coupon.endsAt < now) return { valid: false as const, amount: 0, code: input.code, reason: 'COUPON_EXPIRED' as const };
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return { valid: false as const, amount: 0, code: input.code, reason: 'COUPON_USAGE_LIMIT' as const };
  if (coupon.minimumSubtotal && input.subtotalAmount < Number(coupon.minimumSubtotal)) return { valid: false as const, amount: 0, code: input.code, reason: 'COUPON_MINIMUM_NOT_MET' as const };
  if (coupon.minimumQuantity && (input.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0) < coupon.minimumQuantity) return { valid: false as const, amount: 0, code: input.code, reason: 'COUPON_MINIMUM_NOT_MET' as const };
  if (coupon.appliesToProductSlug && !(input.items ?? []).some((item) => item.slug === coupon.appliesToProductSlug)) return { valid: false as const, amount: 0, code: input.code, reason: 'COUPON_NOT_FOUND' as const };
  if (coupon.appliesToCategorySlug && !(input.items ?? []).some((item) => item.categorySlugs?.includes(coupon.appliesToCategorySlug ?? ''))) return { valid: false as const, amount: 0, code: input.code, reason: 'COUPON_NOT_FOUND' as const };
  const rawAmount = coupon.type === 'PERCENTAGE' ? Math.floor((input.subtotalAmount * Number(coupon.value)) / 100) : Number(coupon.value);
  return { valid: true as const, amount: Math.max(0, Math.min(input.subtotalAmount, rawAmount)), code: coupon.code, reason: null };
}

export async function getCartSummary(token: string): Promise<CartSummary> {
  const cart = await ensureCart(token);
  const cartState = await getActiveCartState(token);
  const subtotalAmount = cart.items.reduce((sum, item) => sum + toNumber(item.unitPrice) * item.quantity, 0);
  const coupon = await calculateCouponDiscount({ code: cart.couponCode, subtotalAmount, items: cartState?.items.map((item) => ({ slug: item.product.slug, quantity: item.quantity, categorySlugs: item.product.categories?.map((x) => x.category.slug) ?? [] })) ?? [] });
  const discountAmount = coupon.valid ? coupon.amount : 0;
  const shippingAmount = cart.items.length > 0 ? 30000 : 0;
  const totalAmount = Math.max(0, subtotalAmount - discountAmount + shippingAmount);
  return {
    id: cart.id,
    currency: cart.currency,
    items: cart.items.map((item) => ({ id: item.id, productId: item.product.id, slug: item.product.slug, title: item.product.title, quantity: item.quantity, unitPrice: formatMoney(toNumber(item.unitPrice), cart.currency), lineTotal: formatMoney(toNumber(item.unitPrice) * item.quantity, cart.currency), image: item.product.featuredImage ? { url: item.product.featuredImage.url, alt: item.product.featuredImage.alt ?? undefined } : undefined })),
    subtotal: formatMoney(subtotalAmount, cart.currency),
    discountTotal: formatMoney(discountAmount, cart.currency),
    shippingTotal: formatMoney(shippingAmount, cart.currency),
    total: formatMoney(totalAmount, cart.currency),
  };
}

export async function addProductToCart(input: { token: string; productId: string; quantity: number; requestId?: string }): Promise<AppResult<CartSummary>> {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) return err('INVALID_QUANTITY');
  const product = await getPublishedProductForCart(input.productId);
  if (!product) return err('PRODUCT_NOT_FOUND');
  const available = resolveAvailableQuantity(product.inventory);
  const policy = product.inventory?.policy ?? 'DENY_BACKORDER';
  const cart = await ensureCart(input.token);
  const existing = cart.items.find((item) => item.product.id === input.productId)?.quantity ?? 0;
  if (policy !== 'ALLOW_BACKORDER' && existing + input.quantity > available) return err('INSUFFICIENT_STOCK');
  const activePrice = product.salePrice && Number(product.salePrice) < Number(product.price) ? Number(product.salePrice) : Number(product.price);
  await upsertCartItem({ token: input.token, productId: product.id, quantity: input.quantity, unitPrice: activePrice });
  await reserveCartInventory(input.token, input.requestId);
  return ok(await getCartSummary(input.token));
}

export async function changeCartItemQuantity(input: { token: string; itemId: string; quantity: number; requestId?: string }): Promise<AppResult<CartSummary>> {
  if (input.quantity < 0 || !Number.isFinite(input.quantity)) return err('INVALID_QUANTITY');
  const cart = await getActiveCartState(input.token);
  const line = cart?.items.find((item) => item.id === input.itemId);
  if (line && input.quantity > 0) {
    const available = resolveAvailableQuantity(line.product.inventory);
    const policy = line.product.inventory?.policy ?? 'DENY_BACKORDER';
    if (policy !== 'ALLOW_BACKORDER' && input.quantity > available + line.quantity) return err('INSUFFICIENT_STOCK');
  }
  await updateCartItemQuantity(input);
  await reserveCartInventory(input.token, input.requestId);
  return ok(await getCartSummary(input.token));
}

export async function applyCouponToCart(input: { token: string; code: string }): Promise<AppResult<CartSummary>> {
  const cart = await ensureCart(input.token);
  const cartState = await getActiveCartState(input.token);
  const subtotalAmount = cart.items.reduce((sum, item) => sum + toNumber(item.unitPrice) * item.quantity, 0);
  const coupon = await calculateCouponDiscount({ code: input.code.trim().toUpperCase(), subtotalAmount, items: cartState?.items.map((item) => ({ slug: item.product.slug, quantity: item.quantity, categorySlugs: item.product.categories?.map((x) => x.category.slug) ?? [] })) ?? [] });
  if (!coupon.valid) return err(coupon.reason || 'COUPON_NOT_FOUND');
  await setCartCouponCode(input.token, coupon.code);
  return ok(await getCartSummary(input.token));
}

export async function clearCouponFromCart(token: string) {
  await setCartCouponCode(token, null);
  return ok(await getCartSummary(token));
}

export async function finalizeCouponUsage(token: string) {
  const cart = await getCartByToken(token);
  if (cart?.couponCode) await consumeCouponUsage(cart.couponCode);
}

export async function getCartSummaryOrEmpty(token: string) {
  const cart = await getCartByToken(token);
  if (!cart) return getCartSummary(token);
  return getCartSummary(token);
}
