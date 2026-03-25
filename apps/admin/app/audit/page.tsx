export const dynamic = 'force-dynamic';

import { requireAdminPage } from '../../lib/guard';
import { listAuditLogs } from '@culi/core/audit/service';

function qs(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return params.toString();
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string; entityType?: string; action?: string }> }) {
  await requireAdminPage();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(1, Number(params.pageSize || 20));
  const entityType = params.entityType || '';
  const action = params.action || '';
  const result = await listAuditLogs({ page, pageSize, entityType: entityType || undefined, action: action || undefined });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const base = { entityType, action, pageSize };
  const summary = result.items.reduce((acc, log) => { const key = `${log.entityType}:${log.action}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <main style={{ padding: 24 }}>
      <h1>Audit logs</h1>
      <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input name="entityType" placeholder="entityType" defaultValue={entityType} />
        <input name="action" placeholder="action" defaultValue={action} />
        <select name="pageSize" defaultValue={String(pageSize)}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <button type="submit">Filter</button>
        <a href="/audit">Clear</a>
      </form>
      <p>Page {result.page} / {totalPages} — Total {result.total}</p>
      <section>
        <h2>Summary on this page</h2>
        <ul>{Object.entries(summary).map(([k, v]) => <li key={k}>{k} — {v}</li>)}</ul>
      </section>
      <ul>
        {result.items.map((log) => (
          <li key={log.id}>{String(log.createdAt)} — {log.entityType} — {log.action} — {log.entityId} — {log.actorEmail ?? 'n/a'}</li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 12 }}>
        {page > 1 ? <a href={`/audit?${qs({ ...base, page: page - 1 })}`}>Prev</a> : null}
        {page < totalPages ? <a href={`/audit?${qs({ ...base, page: page + 1 })}`}>Next</a> : null}
      </div>
    </main>
  );
}
