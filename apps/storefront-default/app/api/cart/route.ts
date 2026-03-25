import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getCartSummaryOrEmpty } from '@culi/core/cart';

export async function GET() {
  const token = (await cookies()).get('cartToken')?.value;
  if (!token) return NextResponse.json({ ok: true, cart: null });
  const cart = await getCartSummaryOrEmpty(token);
  return NextResponse.json({ ok: true, cart });
}
