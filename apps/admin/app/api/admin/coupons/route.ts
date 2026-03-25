import { NextRequest } from 'next/server';
import { requireAdminApi } from '../../../../lib/api-guard';
import { adminCreateCoupon } from '../../../../lib/admin-mutations';
import { apiError, apiOk } from '../../../../lib/api-response';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const result = await adminCreateCoupon({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, { code: body.code, type: body.type, value: Number(body.value), minimumSubtotal: body.minimumSubtotal ? Number(body.minimumSubtotal) : undefined, minimumQuantity: body.minimumQuantity ? Number(body.minimumQuantity) : undefined, usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined, appliesToProductSlug: body.appliesToProductSlug, appliesToCategorySlug: body.appliesToCategorySlug, isActive: body.isActive !== false });
  if (!result.ok) return apiError({ requestId: guard.requestId, code: result.error.code }, { status: 400 });
  return apiOk({ requestId: guard.requestId, couponId: result.data.id });
}
