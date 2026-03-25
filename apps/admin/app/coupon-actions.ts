'use server';

import { redirect } from 'next/navigation';
import { getAdminSession, rotateAdminSession } from '../lib/session';
import { validateAdminCsrfToken } from '../lib/csrf';
import { getRequestId } from '../lib/request';
import { adminCreateCoupon, adminDeleteCoupon, adminUpdateCoupon } from '../lib/admin-mutations';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/login?error=UNAUTHORIZED');
  await rotateAdminSession(session);
  return session;
}

async function requireMutationCsrf(formData: FormData) {
  const csrfOk = await validateAdminCsrfToken(String(formData.get('csrfToken') || ''));
  if (!csrfOk) redirect('/login?error=INVALID_CSRF');
}

export async function createCouponAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  const result = await adminCreateCoupon({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, { code: String(formData.get('code') || ''), type: String(formData.get('type') || 'PERCENTAGE') as 'PERCENTAGE' | 'FIXED_AMOUNT', value: Number(formData.get('value') || 0), minimumSubtotal: Number(formData.get('minimumSubtotal') || 0) || undefined, minimumQuantity: Number(formData.get('minimumQuantity') || 0) || undefined, usageLimit: Number(formData.get('usageLimit') || 0) || undefined, appliesToProductSlug: String(formData.get('appliesToProductSlug') || ''), appliesToCategorySlug: String(formData.get('appliesToCategorySlug') || ''), isActive: Boolean(formData.get('isActive')) });
  if (!result.ok) redirect(`/coupons?error=${result.error.code}`);
  redirect('/coupons');
}

export async function updateCouponAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  const id = String(formData.get('id') || '');
  const result = await adminUpdateCoupon({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, { id, code: String(formData.get('code') || ''), type: String(formData.get('type') || 'PERCENTAGE') as 'PERCENTAGE' | 'FIXED_AMOUNT', value: Number(formData.get('value') || 0), minimumSubtotal: Number(formData.get('minimumSubtotal') || 0) || undefined, minimumQuantity: Number(formData.get('minimumQuantity') || 0) || undefined, usageLimit: Number(formData.get('usageLimit') || 0) || undefined, appliesToProductSlug: String(formData.get('appliesToProductSlug') || ''), appliesToCategorySlug: String(formData.get('appliesToCategorySlug') || ''), isActive: Boolean(formData.get('isActive')) });
  if (!result.ok) redirect(`/coupons/${id}?error=${result.error.code}`);
  redirect(`/coupons/${id}`);
}

export async function deleteCouponAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  await adminDeleteCoupon({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, String(formData.get('id') || ''));
  redirect('/coupons');
}
