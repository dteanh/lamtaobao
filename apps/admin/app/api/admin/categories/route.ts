import { NextRequest } from 'next/server';
import { requireAdminApi } from '../../../../lib/api-guard';
import { adminCreateCategory } from '../../../../lib/admin-mutations';
import { apiOk } from '../../../../lib/api-response';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const category = await adminCreateCategory({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, { name: body.name, slug: body.slug, description: body.description });
  return apiOk({ requestId: guard.requestId, categoryId: category.id });
}
