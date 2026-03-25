import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

export async function getRequestId() {
  return (await headers()).get('x-request-id') || crypto.randomUUID();
}

export function getRequestIdFromNextRequest(req: NextRequest) {
  return req.headers.get('x-request-id') || crypto.randomUUID();
}

export function getStrictIpKey(req: NextRequest) {
  const trustProxy = process.env.TRUST_PROXY === 'true';
  if (trustProxy) {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'local';
}
