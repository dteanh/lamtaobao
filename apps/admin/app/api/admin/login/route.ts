import { NextRequest } from 'next/server';
import { authenticateAdmin } from '@culi/core/auth/service';
import { incrementMetric, logEvent } from '@culi/core/shared/observability';
import { isLoginRateLimited, registerLoginAttempt } from '../../../../lib/rate-limit';
import { setAdminSession } from '../../../../lib/session';
import { validateAdminCsrfToken } from '../../../../lib/csrf';
import { getRequestIdFromNextRequest, getStrictIpKey } from '../../../../lib/request';
import { apiError, apiOk } from '../../../../lib/api-response';

export async function POST(request: NextRequest) {
  const requestId = getRequestIdFromNextRequest(request);
  const ipKey = getStrictIpKey(request);

  if (await isLoginRateLimited(ipKey)) {
    await incrementMetric('admin_auth_rate_limited_total');
    logEvent('admin_auth_rate_limited', { requestId, ipKey });
    return apiError({ requestId, code: 'RATE_LIMITED' }, { status: 429 });
  }

  const body = await request.json();
  const csrfOk = await validateAdminCsrfToken(body.csrfToken);
  if (!csrfOk) {
    await registerLoginAttempt(ipKey, false);
    await incrementMetric('admin_auth_invalid_csrf_total');
    logEvent('admin_auth_invalid_csrf', { requestId, ipKey });
    return apiError({ requestId, code: 'INVALID_CSRF' }, { status: 403 });
  }

  const result = await authenticateAdmin({ email: body.email || '', password: body.password || '' });
  if (!result.ok) {
    await registerLoginAttempt(ipKey, false);
    await incrementMetric('admin_auth_failed_total');
    logEvent('admin_auth_failed', { requestId, ipKey, email: body.email || '' });
    return apiError({ requestId, code: result.error.code }, { status: 401 });
  }

  await registerLoginAttempt(ipKey, true);
  await setAdminSession({ userId: result.data.userId, email: result.data.email, ipKey, userAgent: request.headers.get('user-agent') || '' });
  await incrementMetric('admin_auth_success_total');
  logEvent('admin_auth_success', { requestId, ipKey, userId: result.data.userId });
  return apiOk({ requestId });
}
