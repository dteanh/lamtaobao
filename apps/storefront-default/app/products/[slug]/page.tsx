export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getCatalogProductDetail } from '@culi/core/catalog';
import { addToCartAction } from '../../actions';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProductDetail(slug);

  if (!product) {
    notFound();
  }

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <a href="/">← Quay lại</a>
      <h1>{product.title}</h1>
      <p>{product.price.active.formatted}</p>
      <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml ?? '<p>Chưa có mô tả.</p>' }} />
      <p>Tồn kho: {product.stock.quantity}</p>
      <form action={addToCartAction} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="hidden" name="productId" value={product.id} />
        <input type="number" name="quantity" min={1} defaultValue={1} />
        <button type="submit">Thêm vào giỏ</button>
      </form>
    </main>
  );
}
