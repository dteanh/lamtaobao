'use server';

import { redirect } from 'next/navigation';
import { validateAdminCsrfToken } from '../../lib/csrf';
import { getRequestId } from '../../lib/request';
import { requireAdminPage } from '../../lib/guard';
import { applyAdminOrderLifecycleUpdate } from '../../lib/order-lifecycle';
import { applyAdminOrderPaymentUpdate } from '../../lib/order-payments';

async function requireAdmin() {
  return requireAdminPage();
}

export async function updateOrderLifecycleAction(formData: FormData) {
  const csrfOk = await validateAdminCsrfToken(String(formData.get('csrfToken') || ''));
  if (!csrfOk) redirect('/login?error=INVALID_CSRF');
  const admin = await requireAdmin();
  const requestId = await getRequestId();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '') as any;
  const internalNote = String(formData.get('internalNote') || '').trim();
  try {
    await applyAdminOrderLifecycleUpdate({ actorUserId: admin.userId, actorEmail: admin.email, requestId, id, status, internalNote: internalNote || null });
  } catch (error: any) {
    redirect(`/orders/${id}?error=${error?.code || 'ORDER_UPDATE_FAILED'}`);
  }
  redirect(`/orders/${id}`);
}

export async function updateOrderPaymentAction(formData: FormData) {
  const csrfOk = await validateAdminCsrfToken(String(formData.get('csrfToken') || ''));
  if (!csrfOk) redirect('/login?error=INVALID_CSRF');
  const admin = await requireAdmin();
  const requestId = await getRequestId();
  const id = String(formData.get('id') || '');
  const paymentStatus = String(formData.get('paymentStatus') || '') as 'PAID' | 'FAILED' | 'REFUNDED';
  const note = String(formData.get('note') || '').trim();
  try {
    await applyAdminOrderPaymentUpdate({ actorUserId: admin.userId, actorEmail: admin.email, requestId, id, paymentStatus, note: note || null });
  } catch (error: any) {
    redirect(`/orders/${id}?error=${error?.code || 'ORDER_PAYMENT_UPDATE_FAILED'}`);
  }
  redirect(`/orders/${id}`);
}
