import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, cleanupExpiredAdminSessions } from './session';
import { getRequestIdFromNextRequest } from './request';
import { validateAdminCsrfToken } from './csrf';

export async function requireAdminApi(req: NextRequest, opts?: { csrf?: string | null }) {
  const requestId = getRequestIdFromNextRequest(req);
  await cleanupExpiredAdminSessions();
  const session = await getAdminSession();
  if (!session) {
    return { ok: false as const, requestId, response: NextResponse.json({ ok: false, error: 'UNAUTHORIZED', requestId }, { status: 401 }) };
  }
  if (opts && 'csrf' in opts) {
    const csrfOk = await validateAdminCsrfToken(opts.csrf);
    if (!csrfOk) {
      return { ok: false as const, requestId, response: NextResponse.json({ ok: false, error: 'INVALID_CSRF', requestId }, { status: 403 }) };
    }
  }
  return { ok: true as const, requestId, session };
}
