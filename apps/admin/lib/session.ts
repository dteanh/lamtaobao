import crypto from 'node:crypto';
import { prisma } from '@culi/db';
import { cookies, headers } from 'next/headers';

const ADMIN_COOKIE = 'culi_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';
}

function isSecureCookie() {
  return process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function encode(data: object) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decode(token: string) {
  const [payload, sig] = token.split('.');
  if (!payload || !sig || sign(payload) !== sig) return null;
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId: string; email: string; sessionId: string; exp: number };
}

export async function setAdminSession(payload: { userId: string; email: string; ipKey?: string; userAgent?: string }) {
  const cookieStore = await cookies();
  const sessionId = crypto.randomUUID();
  const exp = Date.now() + SESSION_TTL_MS;
  await prisma.adminSession.create({
    data: { userId: payload.userId, sessionId, expiresAt: new Date(exp), ipKey: payload.ipKey || null, userAgent: payload.userAgent || null },
  });
  const value = encode({ userId: payload.userId, email: payload.email, sessionId, exp });
  cookieStore.set(ADMIN_COOKIE, value, { httpOnly: true, path: '/', sameSite: 'lax', secure: isSecureCookie(), expires: new Date(exp) });
}

export async function rotateAdminSession(session: { userId: string; email: string; sessionId: string }) {
  const hdrs = await headers();
  await prisma.adminSession.updateMany({ where: { sessionId: session.sessionId }, data: { revokedAt: new Date() } });
  await setAdminSession({ userId: session.userId, email: session.email, ipKey: hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || 'local', userAgent: hdrs.get('user-agent') || '' });
}

export async function revokeAllAdminSessions(userId: string) {
  await prisma.adminSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function revokeCurrentAdminSession(sessionId: string) {
  await prisma.adminSession.updateMany({ where: { sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function revokeSingleAdminSession(userId: string, sessionId: string) {
  await prisma.adminSession.updateMany({ where: { userId, sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function revokeOtherAdminSessions(userId: string, currentSessionId: string) {
  await prisma.adminSession.updateMany({ where: { userId, revokedAt: null, NOT: { sessionId: currentSessionId } }, data: { revokedAt: new Date() } });
}

export async function listAdminSessions(userId: string, input?: { page?: number; pageSize?: number; status?: 'active' | 'revoked' | 'all' }) {
  const page = input?.page ?? 1;
  const pageSize = input?.pageSize ?? 50;
  const where = { userId, ...(input?.status === 'active' ? { revokedAt: null } : {}), ...(input?.status === 'revoked' ? { NOT: { revokedAt: null } } : {}) };
  const [items, total] = await Promise.all([
    prisma.adminSession.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.adminSession.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function cleanupExpiredAdminSessions() {
  const count = await prisma.adminSession.updateMany({ where: { expiresAt: { lt: new Date() }, revokedAt: null }, data: { revokedAt: new Date() } });
  return count.count;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE)?.value;
  const decoded = raw ? decode(raw) : null;
  if (decoded?.sessionId) {
    await prisma.adminSession.updateMany({ where: { sessionId: decoded.sessionId }, data: { revokedAt: new Date() } });
  }
  cookieStore.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', expires: new Date(0), sameSite: 'lax', secure: isSecureCookie() });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!raw) return null;
  const data = decode(raw);
  if (!data || Date.now() > data.exp) {
    await clearAdminSession();
    return null;
  }
  const dbSession = await prisma.adminSession.findUnique({ where: { sessionId: data.sessionId } });
  if (!dbSession || dbSession.expiresAt.getTime() < Date.now() || dbSession.revokedAt) {
    await clearAdminSession();
    return null;
  }
  return { userId: data.userId, email: data.email, sessionId: data.sessionId };
}
