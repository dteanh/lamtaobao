export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../lib/csrf';
import { requireAdminPage } from '../../lib/guard';
import { listCoupons } from '@culi/core/coupons/service';
import { createCouponAction, deleteCouponAction } from '../coupon-actions';

function qs(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) if (value !== undefined && value !== '') params.set(key, String(value));
  return params.toString();
}

export default async function AdminCouponsPage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string; q?: string; type?: string }> }) {
  await requireAdminPage();
  const csrfToken = await readAdminCsrfToken();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(1, Number(params.pageSize || 20));
  const q = (params.q || '').trim().toLowerCase();
  const type = (params.type || '').trim();
  const coupons = await listCoupons();
  const filtered = coupons.filter((coupon) => (!q || coupon.code.toLowerCase().includes(q)) && (!type || coupon.type === type));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <main style={{ padding: 24 }}>
      <h1>Coupons</h1>
      <form action={createCouponAction} style={{ display: 'grid', gap: 8, maxWidth: 520, marginBottom: 24 }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input name="code" placeholder="Code" required />
        <select name="type" defaultValue="PERCENTAGE">
          <option value="PERCENTAGE">PERCENTAGE</option>
          <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
        </select>
        <input name="value" type="number" placeholder="Value" required />
        <input name="minimumSubtotal" type="number" placeholder="Min subtotal" />
        <input name="minimumQuantity" type="number" placeholder="Min quantity" />
        <input name="usageLimit" type="number" placeholder="Usage limit" />
        <input name="appliesToProductSlug" placeholder="Apply to product slug" />
        <input name="appliesToCategorySlug" placeholder="Apply to category slug" />
        <label><input type="checkbox" name="isActive" defaultChecked /> Active</label>
        <button type="submit">Create coupon</button>
      </form>
      <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input name="q" placeholder="code" defaultValue={params.q || ''} />
        <select name="type" defaultValue={type}><option value="">all types</option><option value="PERCENTAGE">PERCENTAGE</option><option value="FIXED_AMOUNT">FIXED_AMOUNT</option></select>
        <select name="pageSize" defaultValue={String(pageSize)}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
        <button type="submit">Filter</button>
        <a href="/coupons">Clear</a>
      </form>
      <p>Total: {filtered.length} | Page {page} / {totalPages}</p>
      <ul>
        {items.map((coupon) => (
          <li key={coupon.id}><a href={`/coupons/${coupon.id}`}>{coupon.code}</a> — {coupon.type} — {String(coupon.value)} <form action={deleteCouponAction} style={{ display: 'inline-block', marginLeft: 8 }}><input type="hidden" name="csrfToken" value={csrfToken} /><input type="hidden" name="id" value={coupon.id} /><button type="submit">Delete</button></form></li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 12 }}>
        {page > 1 ? <a href={`/coupons?${qs({ q: params.q || '', type, pageSize, page: page - 1 })}`}>Prev</a> : null}
        {page < totalPages ? <a href={`/coupons?${qs({ q: params.q || '', type, pageSize, page: page + 1 })}`}>Next</a> : null}
      </div>
    </main>
  );
}
