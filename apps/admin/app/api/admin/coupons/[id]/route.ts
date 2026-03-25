import { NextRequest } from 'next/server';
import { getCouponDetail } from '@culi/core/coupons/service';
import { requireAdminApi } from '../../../../../lib/api-guard';
import { adminDeleteCoupon, adminUpdateCoupon } from '../../../../../lib/admin-mutations';
import { apiError, apiOk } from '../../../../../lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi(req);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const coupon = await getCouponDetail(id);
  if (!coupon) return apiError({ requestId: guard.requestId, code: 'NOT_FOUND' }, { status: 404 });
  return apiOk({ requestId: guard.requestId, coupon });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const result = await adminUpdateCoupon({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, { id, code: body.code, type: body.type, value: Number(body.value), minimumSubtotal: body.minimumSubtotal ? Number(body.minimumSubtotal) : undefined, minimumQuantity: body.minimumQuantity ? Number(body.minimumQuantity) : undefined, usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined, appliesToProductSlug: body.appliesToProductSlug, appliesToCategorySlug: body.appliesToCategorySlug, isActive: body.isActive !== false });
  if (!result.ok) return apiError({ requestId: guard.requestId, code: result.error.code }, { status: 400 });
  return apiOk({ requestId: guard.requestId, couponId: id });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  await adminDeleteCoupon({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, id);
  return apiOk({ requestId: guard.requestId, couponId: id });
}
