import { NextRequest } from 'next/server';
import { prisma } from '@culi/db';
import { requireAdminApi } from '../../../../../lib/api-guard';
import { adminDeleteProduct, adminUpdateProduct } from '../../../../../lib/admin-mutations';
import { apiError, apiOk } from '../../../../../lib/api-response';
import { getAdminProductInventoryDetail } from '@culi/core/inventory';

function readOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi(req);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { inventory: true, categories: { include: { category: true } }, images: true } });
  if (!product) return apiError({ requestId: guard.requestId, code: 'NOT_FOUND' }, { status: 404 });
  const inventoryDetail = await getAdminProductInventoryDetail(id);
  return apiOk({ requestId: guard.requestId, product, inventoryDetail });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  await adminUpdateProduct({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, { id, title: body.title, slug: body.slug, price: Number(body.price), salePrice: readOptionalNumber(body.salePrice), excerpt: body.excerpt, description: body.description, imageUrl: body.imageUrl, stockQuantity: body.stockQuantity ? Number(body.stockQuantity) : 0, lowStockLevel: readOptionalNumber(body.lowStockLevel), categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : [] });
  const inventoryDetail = await getAdminProductInventoryDetail(id);
  return apiOk({ requestId: guard.requestId, productId: id, inventoryDetail });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;
  const { id } = await params;
  await adminDeleteProduct({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, id);
  return apiOk({ requestId: guard.requestId, productId: id });
}
