import { NextRequest } from 'next/server';
import { requireAdminApi } from '../../../../lib/api-guard';
import { adminCreateProduct } from '../../../../lib/admin-mutations';
import { apiOk } from '../../../../lib/api-response';

function readOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const guard = await requireAdminApi(req, { csrf: body.csrfToken });
  if (!guard.ok) return guard.response;

  const product = await adminCreateProduct({ userId: guard.session.userId, email: guard.session.email, requestId: guard.requestId }, {
    title: body.title,
    slug: body.slug,
    price: Number(body.price),
    salePrice: readOptionalNumber(body.salePrice),
    excerpt: body.excerpt,
    description: body.description,
    imageUrl: body.imageUrl,
    stockQuantity: body.stockQuantity ? Number(body.stockQuantity) : 0,
    lowStockLevel: readOptionalNumber(body.lowStockLevel),
    categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : [],
  });

  return apiOk({ requestId: guard.requestId, productId: product.id });
}
