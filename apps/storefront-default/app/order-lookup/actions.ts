'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { findCustomerOrderLookup } from '@culi/core/orders';
import { isOrderLookupRateLimited, registerOrderLookupAttempt } from './rate-limit';

function fingerprint(email: string, ip: string) {
  return `order-lookup:${ip}:${email.trim().toLowerCase()}`;
}

export async function lookupOrderAction(formData: FormData) {
  const hdrs = await headers();
  const ip = ((hdrs.get('x-forwarded-for') || '').split(',')[0].trim() || hdrs.get('x-real-ip') || 'local');
  const orderNumber = String(formData.get('orderNumber') || '');
  const email = String(formData.get('email') || '');
  const key = fingerprint(email, ip);

  if (await isOrderLookupRateLimited(key)) {
    redirect('/order-lookup?error=ORDER_LOOKUP_BLOCKED');
  }

  const result = await findCustomerOrderLookup({ orderNumber, email });
  await registerOrderLookupAttempt(key, Boolean(result));
  if (!result) {
    redirect('/order-lookup?error=ORDER_LOOKUP_FAILED');
  }
  redirect(`/orders/${result.orderId}?token=${encodeURIComponent(result.token)}`);
}
