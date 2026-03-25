export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../lib/csrf';
import { getCategorySummaries } from '@culi/core/categories';
import { createCategoryAction, deleteCategoryAction } from '../actions';
import { requireAdminPage } from '../../lib/guard';

function qs(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) if (value !== undefined && value !== '') params.set(key, String(value));
  return params.toString();
}

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string; q?: string }> }) {
  await requireAdminPage();
  const csrfToken = await readAdminCsrfToken();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(1, Number(params.pageSize || 20));
  const q = (params.q || '').trim().toLowerCase();
  const categories = await getCategorySummaries();
  const filtered = categories.filter((item) => !q || `${item.name} ${item.slug}`.toLowerCase().includes(q));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <main style={{ padding: 24 }}>
      <h1>Categories</h1>
      <form action={createCategoryAction} style={{ display: 'grid', gap: 8, maxWidth: 480, marginBottom: 24 }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input name="name" placeholder="Tên danh mục" required />
        <input name="slug" placeholder="slug" required />
        <textarea name="description" placeholder="Mô tả" />
        <button type="submit">Tạo danh mục</button>
      </form>
      <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input name="q" placeholder="name / slug" defaultValue={params.q || ''} />
        <select name="pageSize" defaultValue={String(pageSize)}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
        <button type="submit">Filter</button>
        <a href="/categories">Clear</a>
      </form>
      <p>Total: {filtered.length} | Page {page} / {totalPages}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}><a href={`/categories/${item.id}`}>{item.name}</a> ({item.count}) <form action={deleteCategoryAction} style={{ display: 'inline-block', marginLeft: 8 }}><input type="hidden" name="csrfToken" value={csrfToken} /><input type="hidden" name="id" value={item.id} /><button type="submit">Delete</button></form></li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 12 }}>
        {page > 1 ? <a href={`/categories?${qs({ q: params.q || '', pageSize, page: page - 1 })}`}>Prev</a> : null}
        {page < totalPages ? <a href={`/categories?${qs({ q: params.q || '', pageSize, page: page + 1 })}`}>Next</a> : null}
      </div>
    </main>
  );
}
