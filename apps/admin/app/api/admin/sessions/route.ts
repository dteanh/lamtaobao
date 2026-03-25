import { NextRequest } from 'next/server';
import { listAdminSessions, getAdminSession, cleanupExpiredAdminSessions } from '../../../../lib/session';
import { getRequestIdFromNextRequest } from '../../../../lib/request';
import { incrementMetric } from '@culi/core/shared/observability';
import { apiError, apiOk } from '../../../../lib/api-response';

export async function GET(req: NextRequest) {
  const requestId = getRequestIdFromNextRequest(req);
  await cleanupExpiredAdminSessions();
  const session = await getAdminSession();
  if (!session) return apiError({ requestId, code: 'UNAUTHORIZED' }, { status: 401 });
  await incrementMetric('admin_session_audit_reads_total');
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('pageSize') || 20);
  const status = (searchParams.get('status') || 'all') as 'active' | 'revoked' | 'all';
  const sessions = await listAdminSessions(session.userId, { page, pageSize, status });
  return apiOk({ requestId, ...sessions, filters: { status }, items: sessions.items.map((s) => ({ sessionId: s.sessionId, createdAt: s.createdAt, expiresAt: s.expiresAt, revokedAt: s.revokedAt, ipKey: s.ipKey, userAgent: s.userAgent })) });
}
