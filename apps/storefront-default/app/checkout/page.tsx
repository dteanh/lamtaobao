export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getCartSummaryOrEmpty } from '@culi/core/cart';
import { checkoutAction } from '../actions';

const errorMap: Record<string, string> = {
  CUSTOMER_NAME_REQUIRED: 'Thiếu họ tên.',
  CUSTOMER_EMAIL_INVALID: 'Email không hợp lệ.',
  ADDRESS_REQUIRED: 'Thiếu địa chỉ.',
  CITY_REQUIRED: 'Thiếu tỉnh/thành phố.',
  EMPTY_CART: 'Giỏ hàng đang trống.',
  INSUFFICIENT_STOCK: 'Có sản phẩm không đủ tồn kho.',
  CART_NOT_ACTIVE: 'Giỏ hàng không còn hợp lệ.',
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const token = (await cookies()).get('cartToken')?.value ?? 'guest-preview';
  const cart = await getCartSummaryOrEmpty(token);
  const params = await searchParams;
  const message = params.error ? errorMap[params.error] ?? params.error : null;

  return (
    <main style={{ padding: 24, maxWidth: 1080, margin: '0 auto' }}>
      <h1>Checkout</h1>
      {message ? <p style={{ color: 'crimson' }}>{message}</p> : null}
      <p>Subtotal: {cart.subtotal.formatted}</p>
      <p>Discount: {cart.discountTotal.formatted}</p>
      <p>Total: {cart.total.formatted}</p>
      <form action={checkoutAction} style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
        <input name="fullName" placeholder="Họ tên" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="phone" placeholder="Số điện thoại" />
        <input name="line1" placeholder="Địa chỉ" required />
        <input name="ward" placeholder="Phường/Xã" />
        <input name="district" placeholder="Quận/Huyện" />
        <input name="city" placeholder="Tỉnh/Thành phố" required />
        <input name="postalCode" placeholder="Postal code" />
        <select name="paymentMethod" defaultValue="COD">
          <option value="COD">COD</option>
          <option value="MANUAL_BANK_TRANSFER">Chuyển khoản thủ công</option>
        </select>
        <textarea name="notes" placeholder="Ghi chú" />
        <button type="submit" disabled={cart.items.length === 0}>Đặt hàng</button>
      </form>
    </main>
  );
}
