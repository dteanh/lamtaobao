export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ orderNumber?: string; orderId?: string; token?: string }> }) {
  const params = await searchParams;
  const trackingHref = params.orderId && params.token ? `/orders/${params.orderId}?token=${encodeURIComponent(params.token)}` : null;

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1>Đặt hàng thành công</h1>
      <p>Mã đơn: {params.orderNumber ?? 'N/A'}</p>
      <ul>
        <li>Lưu lại mã đơn để tra cứu về sau.</li>
        <li>Dùng đúng email đã checkout khi tra cứu đơn.</li>
      </ul>
      {trackingHref ? <p><a href={trackingHref}>Xem lại đơn hàng</a></p> : null}
      <p><a href="/order-lookup">Tra cứu đơn bằng mã đơn + email</a></p>
      <a href="/">Về trang chủ</a>
    </main>
  );
}
