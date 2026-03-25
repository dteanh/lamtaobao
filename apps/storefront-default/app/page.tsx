export const dynamic = 'force-dynamic';

import { getCatalogCollection } from '@culi/core/catalog';
import { getCategorySummaries } from '@culi/core/categories';

export default async function HomePage() {
  const [collection, categories] = await Promise.all([
    getCatalogCollection({ page: 1, pageSize: 12 }),
    getCategorySummaries(),
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1080, margin: '0 auto' }}>
      <h1>Culi Commerce</h1>
      <p>Storefront default đang consume normalized data contract.</p>

      <section>
        <h2>Danh mục</h2>
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <a href={`/categories/${category.slug}`}>{category.name}</a> ({category.count})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Sản phẩm mới</h2>
        <ul>
          {collection.items.map((item) => (
            <li key={item.id} style={{ marginBottom: 12 }}>
              <a href={`/products/${item.slug}`}>{item.title}</a>
              <div>{item.price.active.formatted}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
