import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createOrderFromCart } from '@culi/core/checkout';
import { incrementMetric, logEvent } from '@culi/core/shared/observability';

function idempotencyKey() {
  return `api_checkout_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const token = (await cookies()).get('cartToken')?.value;
  if (!token) return NextResponse.json({ ok: false, error: 'EMPTY_CART', requestId }, { status: 400 });
  const body = await request.json();
  const result = await createOrderFromCart({
    cartToken: token,
    idempotencyKey: body.idempotencyKey || idempotencyKey(),
    customer: body.customer,
    shippingAddress: body.shippingAddress,
    paymentMethod: body.paymentMethod || 'COD',
    notes: body.notes || '',
    requestId,
  });
  if (!result.ok) { await incrementMetric('checkout_api_failed_total'); logEvent('checkout_api_failed', { requestId, code: result.error.code }); return NextResponse.json({ ok: false, error: result.error.code, requestId }, { status: 400 }); }
  await incrementMetric('checkout_api_success_total');
  logEvent('checkout_api_success', { requestId, orderId: result.data.orderId });
  return NextResponse.json({ ok: true, requestId, order: result.data });
}
