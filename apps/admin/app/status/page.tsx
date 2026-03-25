export const dynamic = 'force-dynamic';

import { requireAdminPage } from '../../lib/guard';

function card(title: string, items: Array<[string, string | number]>) {
  return (
    <section style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
      <h2>{title}</h2>
      <ul>
        {items.map(([k, v]) => <li key={k}><strong>{k}:</strong> {String(v)}</li>)}
      </ul>
    </section>
  );
}

export default async function AdminStatusPage() {
  await requireAdminPage();

  const [healthRes, statusRes, metricsRes] = await Promise.all([
    fetch('http://127.0.0.1:3001/api/system/health', { cache: 'no-store' }),
    fetch('http://127.0.0.1:3001/api/system/status', { cache: 'no-store' }),
    fetch('http://127.0.0.1:3001/api/system/metrics', { cache: 'no-store' }),
  ]);
  const health = await healthRes.json();
  const status = await statusRes.json();
  const metrics = await metricsRes.json();
  const hottest = [...(metrics.counters || [])].sort((a, b) => Number(b.value) - Number(a.value)).slice(0, 10);

  return (
    <main style={{ padding: 24 }}>
      <h1>Status</h1>
      <p>requestId: {status.requestId ?? 'n/a'} | ts: {status.ts ?? health.ts ?? 'n/a'}</p>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {card('Health', [['service', health.service], ['db', health.db], ['ts', health.ts]])}
        {card('Auth', [['success', status.auth?.success ?? 0], ['failed', status.auth?.failed ?? 0], ['rate limited', status.auth?.rateLimited ?? 0], ['session audit reads', status.auth?.sessionAuditReads ?? 0]])}
        {card('Checkout', [['success', status.checkout?.success ?? 0], ['failed', status.checkout?.failed ?? 0]])}
        {card('Ops', [['cleanup runs', status.cleanup?.reservationRuns ?? 0], ['audit rows', status.audit?.totalRows ?? 0], ['active sessions', status.sessions?.active ?? 0], ['revoked sessions', status.sessions?.revoked ?? 0]])}
      </div>
      <section style={{ marginTop: 24 }}>
        <h2>Top counters</h2>
        <ul>{hottest.map((c: any) => <li key={c.key}>{c.key} — {String(c.value)}</li>)}</ul>
      </section>
    </main>
  );
}
