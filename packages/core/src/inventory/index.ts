import { prisma } from '@culi/db';
import { auditMutation } from '../admin/mutation-audit';

export type InventoryActor = {
  requestId: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  source: string;
};

export type AdminInventoryState = 'low' | 'reserved-heavy' | 'healthy' | 'neutral';

export function getInventorySnapshot(input?: { quantity?: number | null; reserved?: number | null }) {
  const quantity = input?.quantity ?? 0;
  const reserved = input?.reserved ?? 0;
  return {
    quantity,
    reserved,
    available: Math.max(0, quantity - reserved),
  };
}

export function getThresholdGap(input: { quantity: number; reserved: number; lowStockLevel?: number | null }) {
  const available = Math.max(0, input.quantity - input.reserved);
  return input.lowStockLevel === null || input.lowStockLevel === undefined ? null : available - input.lowStockLevel;
}

export function getAdminInventoryState(input: { quantity: number; reserved: number; lowStockLevel?: number | null }) {
  const quantity = input.quantity;
  const reserved = input.reserved;
  const lowStockLevel = input.lowStockLevel ?? null;
  const available = Math.max(0, quantity - reserved);
  const reservedRatio = quantity > 0 ? reserved / quantity : 0;

  if (lowStockLevel !== null && available <= lowStockLevel) {
    return { key: 'low' as const, label: 'Low', available, reservedRatio };
  }

  if (quantity > 0 && reserved > 0 && reservedRatio >= 0.5) {
    return { key: 'reserved-heavy' as const, label: 'Reserved-heavy', available, reservedRatio };
  }

  if (available > 0) {
    return { key: 'healthy' as const, label: 'Healthy', available, reservedRatio };
  }

  return { key: 'neutral' as const, label: 'Neutral', available, reservedRatio };
}

export async function recordInventoryMovement(input: {
  productId: string;
  actor: InventoryActor;
  action: string;
  before?: { quantity?: number | null; reserved?: number | null } | null;
  after?: { quantity?: number | null; reserved?: number | null } | null;
  meta?: Record<string, unknown>;
}) {
  await auditMutation({
    actorUserId: input.actor.actorUserId ?? null,
    actorEmail: input.actor.actorEmail ?? null,
    entityType: 'inventory',
    entityId: input.productId,
    action: input.action,
    requestId: input.actor.requestId,
    before: getInventorySnapshot(input.before ?? undefined),
    after: getInventorySnapshot(input.after ?? undefined),
    meta: { source: input.actor.source, ...(input.meta ?? {}) },
  });
}

export async function getAdminInventorySummary() {
  const [inventories, activeReservations, committed] = await Promise.all([
    prisma.inventory.findMany({ include: { product: { select: { id: true, title: true, slug: true } } } }),
    prisma.inventoryReservation.groupBy({ by: ['productId'], _sum: { quantity: true }, where: { revokedAt: null, expiresAt: { gt: new Date() } } }),
    prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true }, where: { productId: { not: null }, order: { status: { not: 'CANCELED' } } } }),
  ]);

  const reservationMap = new Map(activeReservations.map((row) => [row.productId, row._sum.quantity ?? 0]));
  const committedMap = new Map(committed.map((row) => [row.productId as string, row._sum.quantity ?? 0]));

  const items = inventories.map((inventory) => {
    const quantity = inventory.quantity;
    const reserved = inventory.reserved;
    const available = Math.max(0, quantity - reserved);
    const state = getAdminInventoryState({ quantity, reserved, lowStockLevel: inventory.lowStockLevel });
    const thresholdGap = getThresholdGap({ quantity, reserved, lowStockLevel: inventory.lowStockLevel });

    return {
      productId: inventory.productId,
      title: inventory.product.title,
      slug: inventory.product.slug,
      quantity,
      reserved,
      available,
      reservations: reservationMap.get(inventory.productId) ?? 0,
      committed: committedMap.get(inventory.productId) ?? 0,
      lowStockLevel: inventory.lowStockLevel,
      policy: inventory.policy,
      state: state.key,
      stateLabel: state.label,
      reservedRatio: state.reservedRatio,
      thresholdGap,
    };
  });

  return {
    items,
    totals: {
      products: items.length,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      reserved: items.reduce((sum, item) => sum + item.reserved, 0),
      available: items.reduce((sum, item) => sum + item.available, 0),
      reservations: items.reduce((sum, item) => sum + item.reservations, 0),
      committed: items.reduce((sum, item) => sum + item.committed, 0),
      lowStock: items.filter((item) => item.state === 'low').length,
      reservedHeavy: items.filter((item) => item.state === 'reserved-heavy').length,
      healthy: items.filter((item) => item.state === 'healthy').length,
      neutral: items.filter((item) => item.state === 'neutral').length,
    },
  };
}

export async function getAdminProductInventoryDetail(productId: string) {
  const [product, reservations, committed, history] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, include: { inventory: true } }),
    prisma.inventoryReservation.findMany({ where: { productId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.orderItem.findMany({ where: { productId, order: { status: { not: 'CANCELED' } } }, include: { order: { select: { id: true, orderNumber: true, status: true, createdAt: true } } }, orderBy: { order: { createdAt: 'desc' } }, take: 20 }),
    prisma.auditLog.findMany({ where: { entityType: 'inventory', entityId: productId }, orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  if (!product) return null;

  const quantity = product.inventory?.quantity ?? 0;
  const reserved = product.inventory?.reserved ?? 0;
  const activeReservations = reservations.filter((item) => !item.revokedAt && item.expiresAt > new Date());
  const committedQty = committed.reduce((sum, item) => sum + item.quantity, 0);
  const state = getAdminInventoryState({ quantity, reserved, lowStockLevel: product.inventory?.lowStockLevel ?? null });

  return {
    productId,
    inventory: {
      quantity,
      reserved,
      available: Math.max(0, quantity - reserved),
      reservations: activeReservations.reduce((sum, item) => sum + item.quantity, 0),
      committed: committedQty,
      lowStockLevel: product.inventory?.lowStockLevel ?? null,
      thresholdGap: getThresholdGap({ quantity, reserved, lowStockLevel: product.inventory?.lowStockLevel ?? null }),
      policy: product.inventory?.policy ?? 'DENY_BACKORDER',
      updatedAt: product.inventory?.updatedAt ?? null,
      state: state.key,
      stateLabel: state.label,
      reservedRatio: state.reservedRatio,
    },
    reservations: activeReservations,
    committedOrders: committed,
    history,
  };
}
