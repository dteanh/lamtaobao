export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getCartSummaryOrEmpty } from '@culi/core/cart';
import { checkoutAction } from '../actions';
import { SitePageFrame } from '../_components/site-shell';

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
    <SitePageFrame title="주문서">
      <section className="home-page-section" style={{ paddingTop: 32 }}>
        <div className="checkout-layout flow-two-col" style={{ width: 1472, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36 }}>
          <div>
            {message ? <p style={{ color: 'crimson' }}>{message}</p> : null}
            <form action={checkoutAction} style={{ display: 'grid', gap: 18 }}>
              <div style={{ border: '1px solid #e5e7eb', padding: 24 }}>
                <h2 style={{ margin: '0 0 18px', fontSize: 26, fontWeight: 800 }}>배송 정보</h2>
                <div className="checkout-fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
                  <input name="fullName" placeholder="Họ tên" required style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
                  <input name="email" type="email" placeholder="Email" required style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
                  <input name="phone" placeholder="Số điện thoại" style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
                  <input name="city" placeholder="Tỉnh/Thành phố" required style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
                  <input name="district" placeholder="Quận/Huyện" style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
                  <input name="ward" placeholder="Phường/Xã" style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
                  <input name="line1" placeholder="Địa chỉ" required style={{ gridColumn: '1 / -1', height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
                  <input name="postalCode" placeholder="Postal code" style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
                  <select name="paymentMethod" defaultValue="COD" style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }}>
                    <option value="COD">COD</option>
                    <option value="MANUAL_BANK_TRANSFER">Chuyển khoản thủ công</option>
                  </select>
                </div>
                <textarea name="notes" placeholder="Ghi chú" style={{ marginTop: 14, minHeight: 120, border: '1px solid #d1d5db', padding: 14, width: '100%', boxSizing: 'border-box' }} />
              </div>

              <button
                type="submit"
                disabled={cart.items.length === 0}
                style={{
                  height: 56,
                  border: 0,
                  background: '#d91f29',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: cart.items.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                주문 완료하기
              </button>
            </form>
          </div>

          <aside>
            <div className="mobile-summary-box" style={{ border: '1px solid #e5e7eb', padding: 24, background: '#fafafa' }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 24, fontWeight: 800 }}>주문 요약</h2>
              <div style={{ display: 'grid', gap: 12, fontSize: 15 }}>
                {cart.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: '#374151' }}>{item.title} × {item.quantity}</span>
                    <strong>{item.lineTotal.formatted}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #d1d5db' }}><span>Subtotal</span><strong>{cart.subtotal.formatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><strong>{cart.discountTotal.formatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><strong>{cart.shippingTotal.formatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}><span>Total</span><strong>{cart.total.formatted}</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SitePageFrame>
  );
}
