import { NextRequest } from 'next/server';
import { getAdminSession, revokeSingleAdminSession } from '../../../../../../lib/session';
import { getRequestIdFromNextRequest } from '../../../../../../lib/request';
import { apiError, apiOk } from '../../../../../../lib/api-response';

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const requestId = getRequestIdFromNextRequest(req);
  const session = await getAdminSession();
  if (!session) return apiError({ requestId, code: 'UNAUTHORIZED' }, { status: 401 });
  const { sessionId } = await params;
  await revokeSingleAdminSession(session.userId, sessionId);
  return apiOk({ requestId, sessionId });
}
