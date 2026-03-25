export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../../lib/csrf';
import { requireAdminPage } from '../../../lib/guard';
import { prisma } from '@culi/db';
import { updateProductAction } from '../../actions';
import { getAdminProductInventoryDetail } from '@culi/core/inventory';

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const csrfToken = await readAdminCsrfToken();
  const { id } = await params;
  const [product, categories, inventoryDetail] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { inventory: true, categories: { include: { category: true } }, images: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    getAdminProductInventoryDetail(id),
  ]);

  if (!product || !inventoryDetail) {
    return <main style={{ padding: 24 }}>Không tìm thấy sản phẩm.</main>;
  }

  const selected = new Set(product.categories.map((item) => item.categoryId));

  return (
    <main style={{ padding: 24 }}>
      <h1>Edit product</h1>
      <section style={{ marginBottom: 24 }}>
        <h2>Inventory summary</h2>
        <ul>
          <li>State: {inventoryDetail.inventory.stateLabel}</li>
          <li>On hand: {inventoryDetail.inventory.quantity}</li>
          <li>Reserved: {inventoryDetail.inventory.reserved}</li>
          <li>Available: {inventoryDetail.inventory.available}</li>
          <li>Reserve pressure: {Math.round(inventoryDetail.inventory.reservedRatio * 100)}%</li>
          <li>Low-stock threshold: {inventoryDetail.inventory.lowStockLevel ?? '—'}</li>
          <li>Active reservations: {inventoryDetail.inventory.reservations}</li>
          <li>Committed: {inventoryDetail.inventory.committed}</li>
          <li>Policy: {inventoryDetail.inventory.policy}</li>
        </ul>
      </section>
      <form action={updateProductAction} style={{ display: 'grid', gap: 8, maxWidth: 560 }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="id" value={product.id} />
        <input name="title" defaultValue={product.title} required />
        <input name="slug" defaultValue={product.slug} required />
        <input name="price" type="number" defaultValue={Number(product.price)} required />
        <input name="salePrice" type="number" defaultValue={product.salePrice ? Number(product.salePrice) : ''} />
        <input name="stockQuantity" type="number" defaultValue={product.inventory?.quantity ?? 0} />
        <input name="lowStockLevel" type="number" min={0} defaultValue={product.inventory?.lowStockLevel ?? ''} placeholder="Low-stock threshold" />
        <input name="imageUrl" defaultValue={product.images[0]?.url ?? ''} />
        <input name="excerpt" defaultValue={product.excerpt ?? ''} />
        <textarea name="description" defaultValue={product.description ?? ''} />
        <fieldset>
          <legend>Danh mục</legend>
          {categories.map((category) => (
            <label key={category.id} style={{ display: 'block' }}>
              <input type="checkbox" name="categoryIds" value={category.id} defaultChecked={selected.has(category.id)} /> {category.name}
            </label>
          ))}
        </fieldset>
        <button type="submit">Lưu</button>
      </form>
      <section style={{ marginTop: 24 }}>
        <h2>Active reservations</h2>
        <ul>
          {inventoryDetail.reservations.map((item) => (
            <li key={item.id}>{item.cartToken} — qty {item.quantity} — expires {String(item.expiresAt)}</li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Committed orders</h2>
        <ul>
          {inventoryDetail.committedOrders.map((item) => (
            <li key={item.id}>{item.order.orderNumber} — {item.order.status} — qty {item.quantity}</li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Inventory history</h2>
        <ul>
          {inventoryDetail.history.map((entry) => (
            <li key={entry.id}>{String(entry.createdAt)} — {entry.action} — {JSON.stringify(entry.payload)}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
