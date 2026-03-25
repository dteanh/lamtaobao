import { NextRequest } from 'next/server';
import { prisma } from '@culi/db';
import { requireAdminApi } from '../../../../../lib/api-guard';
import { adminDeleteCategory, adminUpdateCategory } from '../../../../../lib/admin-mutations';
import { apiError, apiOk } from '../../../../../lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi(req);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return apiError({ requestId: guard.requestId, code: 'NOT_FOUND' }, { status: 404 });
  return apiOk({ requestId: guard.requestId, category });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  await adminUpdateCategory({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, { id, name: body.name, slug: body.slug, description: body.description });
  return apiOk({ requestId: guard.requestId, categoryId: id });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  await adminDeleteCategory({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, id);
  return apiOk({ requestId: guard.requestId, categoryId: id });
}
