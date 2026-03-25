'use server';

import { redirect } from 'next/navigation';
import { getAdminSession, revokeCurrentAdminSession, revokeOtherAdminSessions, revokeSingleAdminSession, clearAdminSession } from '../../lib/session';
import { validateAdminCsrfToken } from '../../lib/csrf';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/login?error=UNAUTHORIZED');
  return session;
}

export async function revokeCurrentSessionAction(formData: FormData) {
  const csrfOk = await validateAdminCsrfToken(String(formData.get('csrfToken') || ''));
  if (!csrfOk) redirect('/login?error=INVALID_CSRF');
  const session = await requireAdmin();
  await revokeCurrentAdminSession(session.sessionId);
  await clearAdminSession();
  redirect('/login');
}

export async function revokeOtherSessionsAction(formData: FormData) {
  const csrfOk = await validateAdminCsrfToken(String(formData.get('csrfToken') || ''));
  if (!csrfOk) redirect('/login?error=INVALID_CSRF');
  const session = await requireAdmin();
  await revokeOtherAdminSessions(session.userId, session.sessionId);
  redirect('/sessions');
}

export async function revokeSingleSessionAction(formData: FormData) {
  const csrfOk = await validateAdminCsrfToken(String(formData.get('csrfToken') || ''));
  if (!csrfOk) redirect('/login?error=INVALID_CSRF');
  const session = await requireAdmin();
  await revokeSingleAdminSession(session.userId, String(formData.get('sessionId') || ''));
  redirect('/sessions');
}
