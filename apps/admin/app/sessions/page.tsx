export const dynamic = 'force-dynamic';

import { readAdminCsrfToken } from '../../lib/csrf';
import { requireAdminPage } from '../../lib/guard';
import { listAdminSessions } from '../../lib/session';
import { revokeCurrentSessionAction, revokeOtherSessionsAction, revokeSingleSessionAction } from './actions';

function qs(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return params.toString();
}

export default async function AdminSessionsPage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string; status?: 'active' | 'revoked' | 'all' }> }) {
  const session = await requireAdminPage();
  const csrfToken = await readAdminCsrfToken();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(1, Number(params.pageSize || 20));
  const status = params.status || 'all';
  const sessions = await listAdminSessions(session.userId, { page, pageSize, status });
  const totalPages = Math.max(1, Math.ceil(sessions.total / sessions.pageSize));
  const base = { status, pageSize };
  const activeCount = sessions.items.filter((s) => !s.revokedAt).length;
  const revokedCount = sessions.items.filter((s) => !!s.revokedAt).length;

  return (
    <main style={{ padding: 24 }}>
      <h1>Sessions</h1>
      <p>Visible active: {activeCount} | visible revoked: {revokedCount} | total filtered: {sessions.total}</p>
      <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select name="status" defaultValue={status}>
          <option value="all">all</option>
          <option value="active">active</option>
          <option value="revoked">revoked</option>
        </select>
        <select name="pageSize" defaultValue={String(pageSize)}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <button type="submit">Filter</button>
        <a href="/sessions">Clear</a>
      </form>
      <form action={revokeCurrentSessionAction} style={{ marginBottom: 12 }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <button type="submit">Revoke current session</button>
      </form>
      <form action={revokeOtherSessionsAction} style={{ marginBottom: 24 }}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <button type="submit">Revoke other sessions</button>
      </form>
      <p>Status filter: {status} | Page {sessions.page} / {totalPages} — Total {sessions.total}</p>
      <ul>
        {sessions.items.map((s) => (
          <li key={s.sessionId}>
            <strong>{s.sessionId === session.sessionId ? 'CURRENT' : 'SESSION'}</strong> — {s.sessionId} — created: {String(s.createdAt)} — expires: {String(s.expiresAt)} — status: {s.revokedAt ? 'revoked' : 'active'} — ip: {s.ipKey ?? 'n/a'} — ua: {s.userAgent ?? 'n/a'}
            {s.sessionId !== session.sessionId ? (
              <form action={revokeSingleSessionAction} style={{ display: 'inline-block', marginLeft: 8 }}>
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="sessionId" value={s.sessionId} />
                <button type="submit">Revoke this</button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 12 }}>
        {page > 1 ? <a href={`/sessions?${qs({ ...base, page: page - 1 })}`}>Prev</a> : null}
        {page < totalPages ? <a href={`/sessions?${qs({ ...base, page: page + 1 })}`}>Next</a> : null}
      </div>
    </main>
  );
}
