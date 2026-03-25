import { prisma } from '@culi/db';
import { recordInventoryMovement } from '../inventory';
import type { CartRecord } from './types';

type DbCart = {
  id: string;
  token: string;
  currency: string;
  couponCode: string | null;
  status: 'ACTIVE' | 'CONVERTED' | 'ABANDONED';
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: { toString(): string };
    product: {
      id: string;
      slug: string;
      title: string;
      featuredImage?: { url: string; alt: string | null } | null;
      inventory?: { quantity: number; reserved: number; policy: 'DENY_BACKORDER' | 'ALLOW_BACKORDER' } | null;
      categories?: Array<{ category: { slug: string } }>;
    };
  }>;
};

function mapCartRecord(cart: DbCart): CartRecord {
  return {
    id: cart.id,
    token: cart.token,
    currency: cart.currency,
    couponCode: cart.couponCode,
    items: cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      product: {
        id: item.product.id,
        slug: item.product.slug,
        title: item.product.title,
        featuredImage: item.product.featuredImage ? { url: item.product.featuredImage.url, alt: item.product.featuredImage.alt } : null,
        categorySlugs: item.product.categories?.map((x) => x.category.slug) ?? [],
      },
    })),
  };
}

const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      product: {
        include: {
          featuredImage: { select: { url: true, alt: true } },
          inventory: { select: { quantity: true, reserved: true, policy: true } },
          categories: { include: { category: { select: { slug: true } } } },
        },
      },
    },
  },
} as const;

export async function getCartByToken(token: string) {
  const cart = await prisma.cart.findUnique({ where: { token }, include: cartInclude });
  return cart ? mapCartRecord(cart as unknown as DbCart) : null;
}

export async function createCart(token: string) {
  const cart = await prisma.cart.create({ data: { token, currency: 'VND' }, include: cartInclude });
  return mapCartRecord(cart as unknown as DbCart);
}

export async function ensureCart(token: string) {
  const existing = await getCartByToken(token);
  if (existing) return existing;
  return createCart(token);
}

export async function getActiveCartState(token: string) {
  return prisma.cart.findUnique({ where: { token }, include: cartInclude });
}

export async function cleanupExpiredReservations(now = new Date(), requestId = `reservation_cleanup_${Date.now()}`) {
  const expired = await prisma.inventoryReservation.findMany({ where: { expiresAt: { lt: now } } });
  if (expired.length === 0) return 0;
  await prisma.$transaction(async (tx) => {
    for (const reservation of expired) {
      const inventory = await tx.inventory.findUnique({ where: { productId: reservation.productId } });
      await tx.inventory.updateMany({ where: { productId: reservation.productId }, data: { reserved: { decrement: reservation.quantity } } });
      await recordInventoryMovement({ productId: reservation.productId, actor: { requestId, source: 'reservation_cleanup' }, action: 'expire', before: { quantity: inventory?.quantity ?? 0, reserved: inventory?.reserved ?? 0 }, after: { quantity: inventory?.quantity ?? 0, reserved: Math.max(0, (inventory?.reserved ?? 0) - reservation.quantity) }, meta: { cartToken: reservation.cartToken, reservationDelta: -reservation.quantity, expiresAt: reservation.expiresAt.toISOString() } });
    }
    await tx.inventoryReservation.deleteMany({ where: { expiresAt: { lt: now } } });
  });
  return expired.length;
}

export async function getPublishedProductForCart(productId: string) {
  return prisma.product.findFirst({ where: { id: productId, status: 'PUBLISHED' }, include: { inventory: true } });
}

export async function getCouponByCode(code: string) {
  return prisma.coupon.findUnique({ where: { code } });
}

export async function upsertCartItem(input: { token: string; productId: string; quantity: number; unitPrice: number }) {
  const cart = await ensureCart(input.token);
  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: input.productId } });
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + input.quantity, unitPrice: input.unitPrice } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId: input.productId, quantity: input.quantity, unitPrice: input.unitPrice } });
  }
  return ensureCart(input.token);
}

export async function updateCartItemQuantity(input: { token: string; itemId: string; quantity: number }) {
  const cart = await ensureCart(input.token);
  const item = await prisma.cartItem.findFirst({ where: { id: input.itemId, cartId: cart.id } });
  if (!item) return ensureCart(input.token);
  if (input.quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: input.quantity } });
  }
  return ensureCart(input.token);
}

export async function setCartCouponCode(token: string, couponCode: string | null) {
  await prisma.cart.update({ where: { token }, data: { couponCode } });
}

export async function consumeCouponUsage(code: string) {
  await prisma.coupon.update({ where: { code }, data: { usageCount: { increment: 1 } } });
}

export async function markCartConverted(token: string) {
  await prisma.cart.update({ where: { token }, data: { status: 'CONVERTED' } });
}
