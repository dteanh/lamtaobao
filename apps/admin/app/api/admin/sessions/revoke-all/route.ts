import { NextRequest } from 'next/server';
import { getAdminSession, revokeAllAdminSessions, clearAdminSession } from '../../../../../lib/session';
import { getRequestIdFromNextRequest } from '../../../../../lib/request';
import { incrementMetric, logEvent } from '@culi/core/shared/observability';
import { apiError, apiOk } from '../../../../../lib/api-response';

export async function POST(req: NextRequest) {
  const requestId = getRequestIdFromNextRequest(req);
  const session = await getAdminSession();
  if (!session) return apiError({ requestId, code: 'UNAUTHORIZED' }, { status: 401 });
  await revokeAllAdminSessions(session.userId);
  await incrementMetric('admin_session_revoke_all_total');
  logEvent('admin_session_revoke_all', { requestId, userId: session.userId });
  await clearAdminSession();
  return apiOk({ requestId });
}
