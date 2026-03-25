export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../../lib/csrf';
import { requireAdminPage } from '../../../lib/guard';
import { prisma } from '@culi/db';
import { updateCategoryAction } from '../../actions';

export default async function AdminCategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const csrfToken = await readAdminCsrfToken();
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    return <main style={{ padding: 24 }}>Không tìm thấy danh mục.</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Edit category</h1>
      <form action={updateCategoryAction} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="id" value={category.id} />
        <input name="name" defaultValue={category.name} required />
        <input name="slug" defaultValue={category.slug} required />
        <textarea name="description" defaultValue={category.description ?? ''} />
        <button type="submit">Lưu</button>
      </form>
    </main>
  );
}
