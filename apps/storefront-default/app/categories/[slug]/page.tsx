export const dynamic = 'force-dynamic';

import { getCatalogCollection } from '@culi/core/catalog';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCatalogCollection({ page: 1, pageSize: 20, categorySlug: slug });

  return (
    <main style={{ padding: 24, maxWidth: 1080, margin: '0 auto' }}>
      <h1>Danh mục: {slug}</h1>
      <ul>
        {collection.items.map((item) => (
          <li key={item.id}>
            <a href={`/products/${item.slug}`}>{item.title}</a> — {item.price.active.formatted}
          </li>
        ))}
      </ul>
    </main>
  );
}
