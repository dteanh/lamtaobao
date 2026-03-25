import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE = 'culi_admin_csrf';

function tokenSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';
}

function sign(value: string) {
  return crypto.createHmac('sha256', tokenSecret()).update(value).digest('hex');
}

function newToken() {
  const raw = crypto.randomBytes(24).toString('hex');
  return `${raw}.${sign(raw)}`;
}

export async function issueAdminCsrfToken() {
  const token = newToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true' });
  return token;
}

export async function readAdminCsrfToken() {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE)?.value ?? '';
}

export async function validateAdminCsrfToken(submitted?: string | null) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!submitted || !cookieToken || submitted !== cookieToken) return false;
  const [raw, sig] = submitted.split('.');
  if (!raw || !sig) return false;
  return sign(raw) === sig;
}
