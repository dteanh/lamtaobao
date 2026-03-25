'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticateAdmin } from '@culi/core/auth/service';
import { incrementMetric, logEvent } from '@culi/core/shared/observability';
import { clearAdminSession, getAdminSession, rotateAdminSession, setAdminSession } from '../lib/session';
import { isLoginRateLimited, registerLoginAttempt } from '../lib/rate-limit';
import { validateAdminCsrfToken } from '../lib/csrf';
import { getRequestId } from '../lib/request';
import { adminCreateCategory, adminCreateProduct, adminDeleteCategory, adminDeleteProduct, adminUpdateCategory, adminUpdateProduct } from '../lib/admin-mutations';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/login?error=UNAUTHORIZED');
  await rotateAdminSession(session);
  return session;
}

async function requireMutationCsrf(formData: FormData) {
  const csrfOk = await validateAdminCsrfToken(String(formData.get('csrfToken') || ''));
  if (!csrfOk) redirect('/login?error=INVALID_CSRF');
}

function readOptionalNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) || '').trim();
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

export async function loginAdminAction(formData: FormData) {
  const hdrs = await headers();
  const ipKey = process.env.TRUST_PROXY === 'true' ? ((hdrs.get('x-forwarded-for') || '').split(',')[0].trim() || hdrs.get('x-real-ip') || 'local') : (hdrs.get('x-real-ip') || 'local');
  if (await isLoginRateLimited(ipKey)) {
    await incrementMetric('admin_auth_rate_limited_total');
    logEvent('admin_auth_rate_limited', { ipKey });
    redirect('/login?error=RATE_LIMITED');
  }

  await requireMutationCsrf(formData);
  const email = String(formData.get('email') || '');
  const result = await authenticateAdmin({ email, password: String(formData.get('password') || '') });

  if (!result.ok) {
    await registerLoginAttempt(ipKey, false);
    await incrementMetric('admin_auth_failed_total');
    logEvent('admin_auth_failed', { ipKey, email });
    redirect(`/login?error=${result.error.code}`);
  }

  await registerLoginAttempt(ipKey, true);
  await incrementMetric('admin_auth_success_total');
  logEvent('admin_auth_success', { ipKey, userId: result.data.userId });
  await setAdminSession({ userId: result.data.userId, email: result.data.email, ipKey, userAgent: hdrs.get('user-agent') || '' });
  redirect('/');
}

export async function logoutAdminAction() {
  const session = await getAdminSession();
  await clearAdminSession();
  logEvent('admin_auth_logout', { userId: session?.userId ?? null });
  redirect('/login');
}

export async function createCategoryAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  await adminCreateCategory({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, { name: String(formData.get('name') || ''), slug: String(formData.get('slug') || ''), description: String(formData.get('description') || '') });
  redirect('/categories');
}

export async function updateCategoryAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  await adminUpdateCategory({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, { id: String(formData.get('id') || ''), name: String(formData.get('name') || ''), slug: String(formData.get('slug') || ''), description: String(formData.get('description') || '') });
  redirect('/categories');
}

export async function deleteCategoryAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  await adminDeleteCategory({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, String(formData.get('id') || ''));
  redirect('/categories');
}

export async function createProductAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  const categoryIds = formData.getAll('categoryIds').map(String).filter(Boolean);
  await adminCreateProduct({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, { title: String(formData.get('title') || ''), slug: String(formData.get('slug') || ''), price: Number(formData.get('price') || 0), salePrice: readOptionalNumber(formData, 'salePrice'), excerpt: String(formData.get('excerpt') || ''), description: String(formData.get('description') || ''), imageUrl: String(formData.get('imageUrl') || ''), stockQuantity: Number(formData.get('stockQuantity') || 0), lowStockLevel: readOptionalNumber(formData, 'lowStockLevel'), categoryIds });
  redirect('/products');
}

export async function updateProductAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  const id = String(formData.get('id') || '');
  const categoryIds = formData.getAll('categoryIds').map(String).filter(Boolean);
  await adminUpdateProduct({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, { id, title: String(formData.get('title') || ''), slug: String(formData.get('slug') || ''), price: Number(formData.get('price') || 0), salePrice: readOptionalNumber(formData, 'salePrice'), excerpt: String(formData.get('excerpt') || ''), description: String(formData.get('description') || ''), imageUrl: String(formData.get('imageUrl') || ''), stockQuantity: Number(formData.get('stockQuantity') || 0), lowStockLevel: readOptionalNumber(formData, 'lowStockLevel'), categoryIds });
  redirect(`/products/${id}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireMutationCsrf(formData);
  const admin = await requireAdmin();
  await adminDeleteProduct({ userId: admin.userId, email: admin.email, requestId: await getRequestId() }, String(formData.get('id') || ''));
  redirect('/products');
}
