export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../lib/csrf';
import { requireAdminPage } from '../../lib/guard';
import { getCatalogCollection } from '@culi/core/catalog';
import { getCategorySummaries } from '@culi/core/categories';
import { getAdminInventorySummary, type AdminInventoryState } from '@culi/core/inventory';
import { createProductAction, deleteProductAction } from '../actions';

function qs(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) if (value !== undefined && value !== '') params.set(key, String(value));
  return params.toString();
}

const stateOptions: Array<{ value: 'all' | AdminInventoryState; label: string }> = [
  { value: 'all', label: 'All states' },
  { value: 'low', label: 'Low' },
  { value: 'reserved-heavy', label: 'Reserved-heavy' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'neutral', label: 'Neutral' },
];

const quickChipStates: AdminInventoryState[] = ['low', 'reserved-heavy', 'healthy'];

const sortOptions = [
  { value: 'state', label: 'State priority' },
  { value: 'threshold-gap-asc', label: 'Threshold gap ↑' },
  { value: 'threshold-gap-desc', label: 'Threshold gap ↓' },
  { value: 'available-asc', label: 'Available ↑' },
  { value: 'available-desc', label: 'Available ↓' },
  { value: 'reserved-desc', label: 'Reserved ↓' },
  { value: 'title-asc', label: 'Title A→Z' },
] as const;

type ProductSearchParams = {
  page?: string;
  pageSize?: string;
  q?: string;
  state?: string;
  sort?: string;
};

function compareByState(a: { state: string; reservedRatio: number; available: number; title: string }, b: { state: string; reservedRatio: number; available: number; title: string }) {
  const order = { low: 0, 'reserved-heavy': 1, healthy: 2, neutral: 3 } as const;
  const diff = (order[a.state as keyof typeof order] ?? 99) - (order[b.state as keyof typeof order] ?? 99);
  if (diff !== 0) return diff;
  if (b.reservedRatio !== a.reservedRatio) return b.reservedRatio - a.reservedRatio;
  if (a.available !== b.available) return a.available - b.available;
  return a.title.localeCompare(b.title);
}

function getStateBadgeStyle(state: AdminInventoryState) {
  switch (state) {
    case 'low':
      return { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
    case 'reserved-heavy':
      return { background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' };
    case 'healthy':
      return { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
    case 'neutral':
    default:
      return { background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' };
  }
}

function getChipHref(input: { params: ProductSearchParams; state: 'all' | AdminInventoryState; sort: string; pageSize: number }) {
  return `/products?${qs({ q: input.params.q || '', state: input.state, sort: input.sort, pageSize: input.pageSize, page: 1 })}`;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<ProductSearchParams> }) {
  await requireAdminPage();
  const csrfToken = await readAdminCsrfToken();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(1, Number(params.pageSize || 20));
  const q = (params.q || '').trim().toLowerCase();
  const stateFilter = stateOptions.some((option) => option.value === params.state) ? (params.state as 'all' | AdminInventoryState) : 'all';
  const sort = sortOptions.some((option) => option.value === params.sort) ? params.sort! : 'state';
  const [collection, categories, inventorySummary] = await Promise.all([
    getCatalogCollection({ page: 1, pageSize: 500 }),
    getCategorySummaries(),
    getAdminInventorySummary(),
  ]);
  const inventoryMap = new Map(inventorySummary.items.map((item) => [item.productId, item]));

  const filtered = collection.items
    .filter((item) => !q || `${item.title} ${item.slug}`.toLowerCase().includes(q))
    .filter((item) => {
      if (stateFilter === 'all') return true;
      return inventoryMap.get(item.id)?.state === stateFilter;
    })
    .sort((a, b) => {
      const inventoryA = inventoryMap.get(a.id) ?? { state: 'neutral', reservedRatio: 0, available: 0, reserved: 0, thresholdGap: null, title: a.title };
      const inventoryB = inventoryMap.get(b.id) ?? { state: 'neutral', reservedRatio: 0, available: 0, reserved: 0, thresholdGap: null, title: b.title };
      const gapA = inventoryA.thresholdGap ?? Number.POSITIVE_INFINITY;
      const gapB = inventoryB.thresholdGap ?? Number.POSITIVE_INFINITY;

      switch (sort) {
        case 'threshold-gap-asc':
          return gapA - gapB || a.title.localeCompare(b.title);
        case 'threshold-gap-desc':
          return gapB - gapA || a.title.localeCompare(b.title);
        case 'available-asc':
          return inventoryA.available - inventoryB.available || a.title.localeCompare(b.title);
        case 'available-desc':
          return inventoryB.available - inventoryA.available || a.title.localeCompare(b.title);
        case 'reserved-desc':
          return inventoryB.reserved - inventoryA.reserved || a.title.localeCompare(b.title);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'state':
        default:
          return compareByState({ ...inventoryA, title: a.title }, { ...inventoryB, title: b.title });
      }
    });

  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <main style={{ padding: 24 }}>
      <h1>Products</h1>
      <section style={{ marginBottom: 24 }}>
        <h2>Inventory summary</h2>
        <ul>
          <li>Products: {inventorySummary.totals.products}</li>
          <li>On hand: {inventorySummary.totals.quantity}</li>
          <li>Reserved: {inventorySummary.totals.reserved}</li>
          <li>Available: {inventorySummary.totals.available}</li>
          <li>Reservations: {inventorySummary.totals.reservations}</li>
          <li>Committed: {inventorySummary.totals.committed}</li>
          <li>Low: {inventorySummary.totals.lowStock}</li>
          <li>Reserved-heavy: {inventorySummary.totals.reservedHeavy}</li>
          <li>Healthy: {inventorySummary.totals.healthy}</li>
        </ul>
      </section>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <a href={getChipHref({ params, state: 'all', sort, pageSize })} style={{ padding: '6px 10px', borderRadius: 999, textDecoration: 'none', ...(stateFilter === 'all' ? { background: '#111827', color: '#fff' } : { background: '#f3f4f6', color: '#111827' }) }}>All</a>
        {quickChipStates.map((state) => {
          const option = stateOptions.find((item) => item.value === state)!;
          const count = state === 'low' ? inventorySummary.totals.lowStock : state === 'reserved-heavy' ? inventorySummary.totals.reservedHeavy : inventorySummary.totals.healthy;
          const badgeStyle = getStateBadgeStyle(state);
          return (
            <a
              key={state}
              href={getChipHref({ params, state, sort, pageSize })}
              style={{ padding: '6px 10px', borderRadius: 999, textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'center', ...(stateFilter === state ? badgeStyle : { background: '#fff', color: badgeStyle.color, border: badgeStyle.border }) }}
            >
              <span>{option.label}</span>
              <strong>{count}</strong>
            </a>
          );
        })}
      </div>
      <form action={createProductAction} style={{ display: 'grid', gap: 8, maxWidth: 560, marginBottom: 24 }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input name="title" placeholder="Tên sản phẩm" required />
        <input name="slug" placeholder="slug" required />
        <input name="price" type="number" placeholder="Giá" required />
        <input name="salePrice" type="number" placeholder="Giá sale" />
        <input name="stockQuantity" type="number" placeholder="Tồn kho" defaultValue={0} />
        <input name="lowStockLevel" type="number" min={0} placeholder="Low-stock threshold" />
        <input name="imageUrl" placeholder="Ảnh đại diện URL" />
        <input name="excerpt" placeholder="Excerpt" />
        <textarea name="description" placeholder="Mô tả HTML/basic" />
        <fieldset>
          <legend>Danh mục</legend>
          {categories.map((category) => (
            <label key={category.id} style={{ display: 'block' }}>
              <input type="checkbox" name="categoryIds" value={category.id} /> {category.name}
            </label>
          ))}
        </fieldset>
        <button type="submit">Tạo sản phẩm</button>
      </form>
      <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input name="q" placeholder="title / slug" defaultValue={params.q || ''} />
        <select name="state" defaultValue={stateFilter}>{stateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        <select name="sort" defaultValue={sort}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        <select name="pageSize" defaultValue={String(pageSize)}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
        <button type="submit">Filter</button>
        <a href="/products">Clear</a>
      </form>
      <p>Tổng: {filtered.length} | Page {page} / {totalPages}</p>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {items.map((item) => {
          const inventory = inventoryMap.get(item.id);
          return (
            <li key={item.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <a href={`/products/${item.id}`}>{item.title}</a> — {item.price.active.formatted}
                {inventory ? <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 600, ...getStateBadgeStyle(inventory.state) }}>{inventory.stateLabel}</span> : null}
              </div>
              {inventory ? (
                <div style={{ marginTop: 6 }}>
                  <div>on hand {inventory.quantity} / reserved {inventory.reserved} / available {inventory.available} / committed {inventory.committed}</div>
                  <div>Threshold {inventory.lowStockLevel ?? '—'} / gap {inventory.thresholdGap ?? '—'} / reserve pressure {Math.round(inventory.reservedRatio * 100)}%</div>
                </div>
              ) : null}
              <form action={deleteProductAction} style={{ display: 'inline-block', marginTop: 8 }}>
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="id" value={item.id} />
                <button type="submit">Delete</button>
              </form>
            </li>
          );
        })}
      </ul>
      <div style={{ display: 'flex', gap: 12 }}>
        {page > 1 ? <a href={`/products?${qs({ q: params.q || '', state: stateFilter, sort, pageSize, page: page - 1 })}`}>Prev</a> : null}
        {page < totalPages ? <a href={`/products?${qs({ q: params.q || '', state: stateFilter, sort, pageSize, page: page + 1 })}`}>Next</a> : null}
      </div>
    </main>
  );
}
