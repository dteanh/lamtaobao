import { requireAdminPage } from '../lib/guard';

export default async function AdminHomePage() {
  await requireAdminPage();
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin scaffold</h1>
      <ul>
        <li><a href="/products">Products</a></li>
        <li><a href="/categories">Categories</a></li>
        <li><a href="/orders">Orders</a></li>
        <li><a href="/coupons">Coupons</a></li>
        <li><a href="/sessions">Sessions</a></li>
        <li><a href="/audit">Audit logs</a></li>
        <li><a href="/status">Status</a></li>
      </ul>
    </main>
  );
}
