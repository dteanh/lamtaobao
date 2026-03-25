import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@culi/db';
import { addProductToCart } from '@culi/core/cart';

function generateCartToken() {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const body = await request.json();
  const cookieStore = await cookies();
  let token = cookieStore.get('cartToken')?.value;
  if (!token) {
    token = generateCartToken();
    cookieStore.set('cartToken', token, { httpOnly: true, path: '/' });
  }

  const product = await prisma.product.findUnique({ where: { slug: body.productSlug } });
  if (!product) return NextResponse.json({ ok: false, error: 'PRODUCT_NOT_FOUND', requestId }, { status: 404 });

  const result = await addProductToCart({ token, productId: product.id, quantity: Number(body.quantity || 1), requestId });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error.code, requestId }, { status: 400 });
  return NextResponse.json({ ok: true, requestId, cart: result.data });
}
