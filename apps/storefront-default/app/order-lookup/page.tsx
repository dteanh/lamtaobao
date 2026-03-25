export const dynamic = 'force-dynamic';

import { lookupOrderAction } from './actions';

export default async function OrderLookupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const message = params.error === 'ORDER_LOOKUP_BLOCKED'
    ? 'Bạn thử quá nhiều lần. Vui lòng chờ ít phút rồi thử lại.'
    : params.error
      ? 'Không tìm thấy đơn phù hợp.'
      : null;

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1>Tra cứu đơn hàng</h1>
      <p>Nhập mã đơn và email đã dùng khi checkout.</p>
      <p>Rule an toàn: giới hạn thử nhiều lần theo IP + email trong cửa sổ ngắn.</p>
      {message ? <p style={{ color: 'crimson' }}>{message}</p> : null}
      <form action={lookupOrderAction} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <input name="orderNumber" placeholder="ORD-..." required />
        <input name="email" type="email" placeholder="email@domain.com" required />
        <button type="submit">Tra cứu đơn</button>
      </form>
    </main>
  );
}
