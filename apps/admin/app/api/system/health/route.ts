import { NextRequest } from 'next/server';
import { prisma } from '@culi/db';
import { getRequestIdFromNextRequest } from '../../../../lib/request';
import { apiOk } from '../../../../lib/api-response';

export async function GET(req: NextRequest) {
  const requestId = getRequestIdFromNextRequest(req);
  await prisma.$queryRaw`SELECT 1`;
  return apiOk({ requestId, service: 'admin', db: 'up', ts: new Date().toISOString() });
}
