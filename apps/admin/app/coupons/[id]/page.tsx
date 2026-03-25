export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../../lib/csrf';
import { requireAdminPage } from '../../../lib/guard';
import { getCouponDetail } from '@culi/core/coupons/service';
import { updateCouponAction } from '../../coupon-actions';

export default async function AdminCouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const csrfToken = await readAdminCsrfToken();
  const { id } = await params;
  const coupon = await getCouponDetail(id);

  if (!coupon) {
    return <main style={{ padding: 24 }}>Không tìm thấy coupon.</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Edit coupon</h1>
      <form action={updateCouponAction} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="id" value={coupon.id} />
        <input name="code" defaultValue={coupon.code} required />
        <select name="type" defaultValue={coupon.type}>
          <option value="PERCENTAGE">PERCENTAGE</option>
          <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
        </select>
        <input name="value" type="number" defaultValue={Number(coupon.value)} required />
        <input name="minimumSubtotal" type="number" defaultValue={coupon.minimumSubtotal ? Number(coupon.minimumSubtotal) : ''} />
        <input name="minimumQuantity" type="number" defaultValue={coupon.minimumQuantity ?? ''} />
        <input name="usageLimit" type="number" defaultValue={coupon.usageLimit ?? ''} />
        <input name="appliesToProductSlug" defaultValue={coupon.appliesToProductSlug ?? ''} />
        <input name="appliesToCategorySlug" defaultValue={coupon.appliesToCategorySlug ?? ''} />
        <label><input type="checkbox" name="isActive" defaultChecked={coupon.isActive} /> Active</label>
        <button type="submit">Lưu</button>
      </form>
    </main>
  );
}
