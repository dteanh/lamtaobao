import { prisma } from '@culi/db';
import { err, ok, type AppResult } from '../shared/result';

export async function listCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getCouponDetail(id: string) {
  return prisma.coupon.findUnique({ where: { id } });
}

export async function createCoupon(input: {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minimumSubtotal?: number;
  minimumQuantity?: number;
  usageLimit?: number;
  appliesToProductSlug?: string;
  appliesToCategorySlug?: string;
  isActive?: boolean;
}): Promise<AppResult<{ id: string }>> {
  if (!input.code.trim() || input.value <= 0) return err('INVALID_INPUT');
  const coupon = await prisma.coupon.create({
    data: {
      code: input.code.trim().toUpperCase(), type: input.type, value: input.value,
      minimumSubtotal: input.minimumSubtotal, minimumQuantity: input.minimumQuantity,
      usageLimit: input.usageLimit, appliesToProductSlug: input.appliesToProductSlug || null,
      appliesToCategorySlug: input.appliesToCategorySlug || null, isActive: input.isActive ?? true,
    },
  });
  return ok({ id: coupon.id });
}

export async function updateCoupon(input: {
  id: string; code: string; type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number;
  minimumSubtotal?: number; minimumQuantity?: number; usageLimit?: number;
  appliesToProductSlug?: string; appliesToCategorySlug?: string; isActive?: boolean;
}): Promise<AppResult<{ id: string }>> {
  if (!input.id || !input.code.trim() || input.value <= 0) return err('INVALID_INPUT');
  const coupon = await prisma.coupon.update({
    where: { id: input.id },
    data: {
      code: input.code.trim().toUpperCase(), type: input.type, value: input.value,
      minimumSubtotal: input.minimumSubtotal, minimumQuantity: input.minimumQuantity,
      usageLimit: input.usageLimit, appliesToProductSlug: input.appliesToProductSlug || null,
      appliesToCategorySlug: input.appliesToCategorySlug || null, isActive: input.isActive ?? true,
    },
  });
  return ok({ id: coupon.id });
}

export async function deleteCoupon(id: string): Promise<AppResult<{ id: string }>> {
  await prisma.coupon.delete({ where: { id } });
  return ok({ id });
}
