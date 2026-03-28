export const dynamic = 'force-dynamic';

import { lookupOrderAction } from './actions';
import { SitePageFrame } from '../_components/site-shell';

export default async function OrderLookupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const message = params.error === 'ORDER_LOOKUP_BLOCKED'
    ? 'Bạn thử quá nhiều lần. Vui lòng chờ ít phút rồi thử lại.'
    : params.error
      ? 'Không tìm thấy đơn phù hợp.'
      : null;

  return (
    <SitePageFrame title="주문 조회" description="주문번호와 checkout 때 사용한 이메일로 주문을 조회합니다.">
      <section style={{ paddingTop: 42 }}>
        <div style={{ width: 1472, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'start' }}>
          <div>
            <div style={{ background: '#111827', color: '#fff', padding: '34px 36px' }}>
              <div style={{ color: '#fca5a5', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>ORDER TRACKING</div>
              <div style={{ fontSize: 34, lineHeight: 1.2, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>
                빠르게 주문 상태를 확인하세요.
              </div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.76)', lineHeight: 1.8, fontSize: 15 }}>
                Rule an toàn: giới hạn thử nhiều lần theo IP + email trong cửa sổ ngắn. Luồng lookup này giữ nguyên logic cũ, chỉ thay giao diện.
              </p>
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', padding: 28, background: '#fff' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 26, fontWeight: 800 }}>주문번호 입력</h2>
            {message ? <p style={{ color: 'crimson', marginBottom: 14 }}>{message}</p> : null}
            <form action={lookupOrderAction} style={{ display: 'grid', gap: 12 }}>
              <input name="orderNumber" placeholder="ORD-..." required style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
              <input name="email" type="email" placeholder="email@domain.com" required style={{ height: 48, border: '1px solid #d1d5db', padding: '0 14px' }} />
              <button type="submit" style={{ height: 52, border: 0, background: '#d91f29', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                주문 조회하기
              </button>
            </form>
          </div>
        </div>
      </section>
    </SitePageFrame>
  );
}
