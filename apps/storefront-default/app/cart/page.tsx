export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getCartSummaryOrEmpty } from '@culi/core/cart';
import { applyCouponAction, clearCouponAction, updateCartItemAction } from '../actions';

const errorMap: Record<string, string> = {
  INVALID_QUANTITY: 'Số lượng không hợp lệ.',
  INSUFFICIENT_STOCK: 'Tồn kho không đủ.',
  COUPON_NOT_FOUND: 'Coupon không hợp lệ.',
  COUPON_NOT_STARTED: 'Coupon chưa tới thời gian dùng.',
  COUPON_EXPIRED: 'Coupon đã hết hạn.',
  COUPON_USAGE_LIMIT: 'Coupon đã hết lượt.',
  COUPON_MINIMUM_NOT_MET: 'Chưa đạt giá trị tối thiểu để dùng coupon.',
};

export default async function CartPage({ searchParams }: { searchParams: Promise<{ error?: string; added?: string; updated?: string; coupon?: string }> }) {
  const token = (await cookies()).get('cartToken')?.value ?? 'guest-preview';
  const cart = await getCartSummaryOrEmpty(token);
  const params = await searchParams;
  const message = params.error ? errorMap[params.error] ?? params.error : null;

  return (
    <main style={{ padding: 24, maxWidth: 1080, margin: '0 auto' }}>
      <h1>Giỏ hàng</h1>
      {message ? <p style={{ color: 'crimson' }}>{message}</p> : null}
      {cart.items.length === 0 ? (
        <p>Chưa có sản phẩm.</p>
      ) : (
        <>
          <ul>
            {cart.items.map((item) => (
              <li key={item.id} style={{ marginBottom: 16 }}>
                <div>{item.title}</div>
                <div>{item.lineTotal.formatted}</div>
                <form action={updateCartItemAction}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <input type="number" name="quantity" min={0} defaultValue={item.quantity} />
                  <button type="submit">Cập nhật</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={applyCouponAction} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
            <input name="code" placeholder="Coupon code" />
            <button type="submit">Áp coupon</button>
          </form>
          <form action={clearCouponAction}>
            <button type="submit">Bỏ coupon</button>
          </form>
          <p>Subtotal: {cart.subtotal.formatted}</p>
          <p>Discount: {cart.discountTotal.formatted}</p>
          <p>Shipping: {cart.shippingTotal.formatted}</p>
          <p>Total: {cart.total.formatted}</p>
          <a href="/checkout">Qua checkout</a>
        </>
      )}
    </main>
  );
}
