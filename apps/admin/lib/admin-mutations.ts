import { prisma } from '@culi/db';
import { createCategory, deleteCategory, updateCategory } from '@culi/core/categories';
import { createProduct, deleteProduct, updateProduct } from '@culi/core/catalog';
import { createCoupon, deleteCoupon, getCouponDetail, updateCoupon } from '@culi/core/coupons/service';
import { auditMutation } from '@culi/core/admin/mutation-audit';
import { recordInventoryMovement } from '@culi/core/inventory';

export type AdminActor = {
  userId: string;
  email: string;
  requestId: string;
};

export async function adminCreateCategory(actor: AdminActor, input: { name: string; slug: string; description?: string }) {
  const category = await createCategory(input);
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'category', entityId: category.id, action: 'create', requestId: actor.requestId, before: null, after: { slug: category.slug, name: category.name } });
  return category;
}

export async function adminUpdateCategory(actor: AdminActor, input: { id: string; name: string; slug: string; description?: string }) {
  const before = await prisma.category.findUnique({ where: { id: input.id } });
  const category = await updateCategory(input);
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'category', entityId: input.id, action: 'update', requestId: actor.requestId, before, after: category });
  return category;
}

export async function adminDeleteCategory(actor: AdminActor, id: string) {
  const before = await prisma.category.findUnique({ where: { id } });
  await deleteCategory(id);
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'category', entityId: id, action: 'delete', requestId: actor.requestId, before, after: null });
}

export async function adminCreateProduct(actor: AdminActor, input: { title: string; slug: string; price: number; salePrice?: number; excerpt?: string; description?: string; imageUrl?: string; stockQuantity: number; lowStockLevel?: number; categoryIds: string[] }) {
  const product = await createProduct(input);
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'product', entityId: product.id, action: 'create', requestId: actor.requestId, before: null, after: { slug: product.slug, title: product.title } });
  await recordInventoryMovement({ productId: product.id, actor: { requestId: actor.requestId, actorUserId: actor.userId, actorEmail: actor.email, source: 'admin_create_product' }, action: 'create', before: null, after: { quantity: input.stockQuantity ?? 0, reserved: 0 }, meta: { reason: 'initial_stock', lowStockLevel: input.lowStockLevel ?? null } });
  return product;
}

export async function adminUpdateProduct(actor: AdminActor, input: { id: string; title: string; slug: string; price: number; salePrice?: number; excerpt?: string; description?: string; imageUrl?: string; stockQuantity: number; lowStockLevel?: number; categoryIds: string[] }) {
  const [beforeProduct, beforeInventory] = await Promise.all([
    prisma.product.findUnique({ where: { id: input.id } }),
    prisma.inventory.findUnique({ where: { productId: input.id } }),
  ]);
  const product = await updateProduct(input);
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'product', entityId: input.id, action: 'update', requestId: actor.requestId, before: { ...beforeProduct, inventory: beforeInventory }, after: product });
  const afterInventory = await prisma.inventory.findUnique({ where: { productId: input.id } });
  if (
    (beforeInventory?.quantity ?? 0) !== (afterInventory?.quantity ?? 0)
    || (beforeInventory?.lowStockLevel ?? null) !== (afterInventory?.lowStockLevel ?? null)
  ) {
    await recordInventoryMovement({
      productId: input.id,
      actor: { requestId: actor.requestId, actorUserId: actor.userId, actorEmail: actor.email, source: 'admin_update_product' },
      action: 'adjust',
      before: { quantity: beforeInventory?.quantity ?? 0, reserved: beforeInventory?.reserved ?? 0 },
      after: { quantity: afterInventory?.quantity ?? 0, reserved: afterInventory?.reserved ?? 0 },
      meta: { reason: 'admin_stock_update', lowStockLevelBefore: beforeInventory?.lowStockLevel ?? null, lowStockLevelAfter: afterInventory?.lowStockLevel ?? null },
    });
  }
  return product;
}

export async function adminDeleteProduct(actor: AdminActor, id: string) {
  const before = await prisma.product.findUnique({ where: { id } });
  await deleteProduct(id);
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'product', entityId: id, action: 'delete', requestId: actor.requestId, before, after: null });
}

export async function adminCreateCoupon(actor: AdminActor, input: { code: string; type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number; minimumSubtotal?: number; minimumQuantity?: number; usageLimit?: number; appliesToProductSlug?: string; appliesToCategorySlug?: string; isActive: boolean }) {
  const result = await createCoupon(input);
  if (!result.ok) return result;
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'coupon', entityId: result.data.id, action: 'create', requestId: actor.requestId, before: null, after: { code: input.code } });
  return result;
}

export async function adminUpdateCoupon(actor: AdminActor, input: { id: string; code: string; type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number; minimumSubtotal?: number; minimumQuantity?: number; usageLimit?: number; appliesToProductSlug?: string; appliesToCategorySlug?: string; isActive: boolean }) {
  const before = await getCouponDetail(input.id);
  const result = await updateCoupon(input);
  if (!result.ok) return result;
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'coupon', entityId: input.id, action: 'update', requestId: actor.requestId, before, after: await getCouponDetail(input.id) });
  return result;
}

export async function adminDeleteCoupon(actor: AdminActor, id: string) {
  const before = await getCouponDetail(id);
  await deleteCoupon(id);
  await auditMutation({ actorUserId: actor.userId, actorEmail: actor.email, entityType: 'coupon', entityId: id, action: 'delete', requestId: actor.requestId, before, after: null });
}
