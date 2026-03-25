import { NextRequest } from 'next/server';
import { prisma } from '@culi/db';
import { getRequestIdFromNextRequest } from '../../../../lib/request';
import { apiOk } from '../../../../lib/api-response';

export async function GET(req: NextRequest) {
  const requestId = getRequestIdFromNextRequest(req);
  const counters = await prisma.metricCounter.findMany({ orderBy: { key: 'asc' } });
  return apiOk({ requestId, ts: new Date().toISOString(), total: counters.length, counters });
}
