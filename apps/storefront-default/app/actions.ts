'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addProductToCart, applyCouponToCart, changeCartItemQuantity, clearCouponFromCart } from '@culi/core/cart';
import { createOrderFromCart } from '@culi/core/checkout';
import { createOrderLookupToken } from '@culi/core/orders';

function generateCartToken() {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateIdempotencyKey() {
  return `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function redirectError(path: string, code: string) {
  return redirect(`${path}?error=${encodeURIComponent(code)}`);
}

export async function addToCartAction(formData: FormData) {
  const cookieStore = await cookies();
  let token = cookieStore.get('cartToken')?.value;
  if (!token) {
    token = generateCartToken();
    cookieStore.set('cartToken', token, { httpOnly: true, path: '/' });
  }

  const result = await addProductToCart({
    token,
    productId: String(formData.get('productId') || ''),
    quantity: Number(formData.get('quantity') || 1),
  });

  if (!result.ok) redirectError('/cart', result.error.code);
  revalidatePath('/cart');
  redirect('/cart?added=1');
}

export async function updateCartItemAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('cartToken')?.value;
  if (!token) redirect('/cart');

  const result = await changeCartItemQuantity({
    token,
    itemId: String(formData.get('itemId') || ''),
    quantity: Number(formData.get('quantity') || 0),
  });

  if (!result.ok) redirectError('/cart', result.error.code);
  revalidatePath('/cart');
  redirect('/cart?updated=1');
}

export async function applyCouponAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('cartToken')?.value;
  if (!token) redirect('/cart');

  const result = await applyCouponToCart({ token, code: String(formData.get('code') || '') });
  if (!result.ok) redirectError('/cart', result.error.code);
  revalidatePath('/cart');
  revalidatePath('/checkout');
  redirect('/cart?coupon=applied');
}

export async function clearCouponAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('cartToken')?.value;
  if (!token) redirect('/cart');

  await clearCouponFromCart(token);
  revalidatePath('/cart');
  revalidatePath('/checkout');
  redirect('/cart?coupon=cleared');
}

export async function checkoutAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('cartToken')?.value;
  if (!token) redirect('/cart');

  const result = await createOrderFromCart({
    cartToken: token,
    idempotencyKey: generateIdempotencyKey(),
    customer: {
      fullName: String(formData.get('fullName') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
    },
    shippingAddress: {
      line1: String(formData.get('line1') || ''),
      city: String(formData.get('city') || ''),
      district: String(formData.get('district') || ''),
      ward: String(formData.get('ward') || ''),
      postalCode: String(formData.get('postalCode') || ''),
      countryCode: 'VN',
    },
    paymentMethod: String(formData.get('paymentMethod') || 'COD') as 'COD' | 'MANUAL_BANK_TRANSFER',
    notes: String(formData.get('notes') || ''),
  });

  if (result.ok) {
    const orderNumber = result.data.orderNumber;
    const orderId = result.data.orderId;
    const lookupToken = createOrderLookupToken(orderId);
    cookieStore.set('cartToken', '', { httpOnly: true, path: '/', expires: new Date(0) });
    revalidatePath('/cart');
    revalidatePath('/checkout');
    redirect(`/order-success?orderNumber=${orderNumber}&orderId=${orderId}&token=${lookupToken}`);
  }

  redirectError('/checkout', result.error.code);
}
