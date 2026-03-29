export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getCartSummaryOrEmpty } from '@culi/core/cart';
import { applyCouponAction, clearCouponAction, updateCartItemAction } from '../actions';
import { SitePageFrame } from '../_components/site-shell';

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
  const params = await searchParams;
  const message = params.error ? errorMap[params.error] ?? params.error : null;

  try {
    const cart = await getCartSummaryOrEmpty(token);

    return (
      <SitePageFrame title="장바구니">
      <section className="home-page-section" style={{ paddingTop: 32 }}>
        <div className="cart-layout flow-two-col" style={{ width: 1472, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36 }}>
          <div>
            {message ? <p style={{ color: 'crimson' }}>{message}</p> : null}
            {cart.items.length === 0 ? (
              <div style={{ padding: '60px 0', color: '#6b7280', fontSize: 16 }}>Chưa có sản phẩm.</div>
            ) : (
              <div style={{ borderTop: '2px solid #111827' }}>
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="cart-line"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 140px 160px',
                      gap: 20,
                      alignItems: 'center',
                      padding: '22px 0',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: '1 / 1',
                        background: item.image?.url
                          ? `center / cover no-repeat url(${item.image.url})`
                          : 'linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</div>
                      <div style={{ color: '#6b7280', fontSize: 14 }}>{item.unitPrice.formatted}</div>
                    </div>
                    <form className="mobile-inline-form" action={updateCartItemAction} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <input
                        type="number"
                        name="quantity"
                        min={0}
                        defaultValue={item.quantity}
                        style={{ width: 88, height: 42, border: '1px solid #d1d5db', padding: '0 12px' }}
                      />
                      <button type="submit" style={{ height: 42, border: 0, background: '#111827', color: '#fff', padding: '0 14px', cursor: 'pointer' }}>
                        변경
                      </button>
                    </form>
                    <div style={{ textAlign: 'right', fontSize: 22, fontWeight: 800 }}>{item.lineTotal.formatted}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside>
            <div className="mobile-summary-box" style={{ border: '1px solid #e5e7eb', padding: 24, background: '#fafafa' }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 24, fontWeight: 800 }}>주문 요약</h2>
              <div style={{ display: 'grid', gap: 12, fontSize: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>{cart.subtotal.formatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><strong>{cart.discountTotal.formatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><strong>{cart.shippingTotal.formatted}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #d1d5db', fontSize: 18 }}><span>Total</span><strong>{cart.total.formatted}</strong></div>
              </div>

              <form action={applyCouponAction} style={{ display: 'flex', gap: 8, margin: '20px 0 10px' }}>
                <input name="code" placeholder="Coupon code" style={{ flex: 1, height: 44, border: '1px solid #d1d5db', padding: '0 12px' }} />
                <button type="submit" style={{ width: 86, border: 0, background: '#111827', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>적용</button>
              </form>
              <form action={clearCouponAction}>
                <button type="submit" style={{ width: '100%', height: 42, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>쿠폰 제거</button>
              </form>

              <a
                href="/checkout"
                style={{
                  marginTop: 18,
                  display: 'block',
                  height: 52,
                  lineHeight: '52px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  background: '#d91f29',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                주문하기
              </a>
            </div>
          </aside>
        </div>
      </section>
    </SitePageFrame>
  );
  } catch {
    return (
      <SitePageFrame title="장바구니" description="일시적으로 장바구니를 불러오지 못했습니다.">
        <section className="home-page-section" style={{ paddingTop: 32 }}>
          <div style={{ width: 1472, margin: '0 auto', padding: '24px 0', color: '#6b7280', fontSize: 15 }}>
            장바구니 정보를 잠시 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        </section>
      </SitePageFrame>
    );
  }
}
