import { NextRequest } from 'next/server';
import { prisma } from '@culi/db';
import { getRequestIdFromNextRequest } from '../../../../lib/request';
import { apiOk } from '../../../../lib/api-response';

export async function GET(req: NextRequest) {
  const requestId = getRequestIdFromNextRequest(req);
  const counters = await prisma.metricCounter.findMany({ orderBy: { key: 'asc' } });
  const byKey = Object.fromEntries(counters.map((c) => [c.key, c.value]));
  return apiOk({
    requestId,
    ts: new Date().toISOString(),
    auth: {
      success: byKey.admin_auth_success_total ?? 0,
      failed: byKey.admin_auth_failed_total ?? 0,
      rateLimited: byKey.admin_auth_rate_limited_total ?? 0,
      sessionAuditReads: byKey.admin_session_audit_reads_total ?? 0,
    },
    checkout: {
      success: byKey.checkout_api_success_total ?? 0,
      failed: byKey.checkout_api_failed_total ?? 0,
    },
    cleanup: {
      reservationRuns: byKey.reservation_cleanup_runs_total ?? 0,
    },
    audit: {
      totalRows: await prisma.auditLog.count(),
    },
    sessions: {
      active: await prisma.adminSession.count({ where: { revokedAt: null } }),
      revoked: await prisma.adminSession.count({ where: { NOT: { revokedAt: null } } }),
    },
  });
}
