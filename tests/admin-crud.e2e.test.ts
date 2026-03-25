import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs';

const env = { ...process.env };
for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  env[m[1]] = m[2].replace(/^"|"$/g, '');
}
env.PATH = process.env.PATH || env.PATH;

let adminProc: any;
let adminLog = '';

async function waitFor(url: string) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {}
    await delay(500);
  }
  throw new Error(`Service not ready: ${url}\n${adminLog}`);
}

async function loginAdmin(ip = '10.1.1.20') {
  const csrfRes = await fetch('http://127.0.0.1:3001/api/admin/csrf');
  const csrf = await csrfRes.json();
  const csrfCookie = (csrfRes.headers.get('set-cookie') || '').split(';')[0];
  const loginRes = await fetch('http://127.0.0.1:3001/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: csrfCookie, 'x-real-ip': ip },
    body: JSON.stringify({ email: 'admin@culi.local', password: 'dev-only', csrfToken: csrf.token }),
  });
  const login = await loginRes.json();
  assert.equal(login.ok, true);
  const sessionCookie = (loginRes.headers.get('set-cookie') || '').split(';')[0];
  return { csrfToken: csrf.token, cookies: `${csrfCookie}; ${sessionCookie}` };
}

test.before(async () => {
  try { spawn('sh', ['-lc', 'fuser -k 3001/tcp || true'], { stdio: 'ignore' }); } catch {}
  await delay(1000);
  adminProc = spawn('pnpm --filter @culi/admin dev', { env, cwd: process.cwd(), shell: true });
  adminProc.stdout?.on('data', (buf: Buffer) => { adminLog += buf.toString(); });
  adminProc.stderr?.on('data', (buf: Buffer) => { adminLog += buf.toString(); });
  await waitFor('http://127.0.0.1:3001/login');
});

test.after(async () => {
  adminProc?.kill('SIGTERM');
});

test('admin CRUD via HTTP APIs for category/product/coupon', async () => {
  const auth = await loginAdmin();
  const stamp = Date.now();

  const catCreate = await fetch('http://127.0.0.1:3001/api/admin/categories', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken, name: 'CRUD Cat', slug: `crud-cat-${stamp}`, description: 'x' }),
  }).then(r => r.json());
  assert.equal(catCreate.ok, true);

  const catId = catCreate.categoryId;
  const catUpdate = await fetch(`http://127.0.0.1:3001/api/admin/categories/${catId}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken, name: 'CRUD Cat 2', slug: `crud-cat-${stamp}-2`, description: 'y' }),
  }).then(r => r.json());
  assert.equal(catUpdate.ok, true);

  const productCreate = await fetch('http://127.0.0.1:3001/api/admin/products', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken, title: 'CRUD Product', slug: `crud-product-${stamp}`, price: 123000, categoryIds: [catId], stockQuantity: 3, lowStockLevel: 2 }),
  }).then(r => r.json());
  assert.equal(productCreate.ok, true);
  const productId = productCreate.productId;

  const productUpdate = await fetch(`http://127.0.0.1:3001/api/admin/products/${productId}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken, title: 'CRUD Product 2', slug: `crud-product-${stamp}-2`, price: 124000, categoryIds: [catId], stockQuantity: 4, lowStockLevel: 1 }),
  }).then(r => r.json());
  assert.equal(productUpdate.ok, true);
  assert.equal(productUpdate.inventoryDetail.inventory.lowStockLevel, 1);
  assert.equal(productUpdate.inventoryDetail.inventory.state, 'healthy');

  const couponCreate = await fetch('http://127.0.0.1:3001/api/admin/coupons', {
    method: 'POST', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken, code: `CRUD${stamp}`, type: 'FIXED_AMOUNT', value: 10000 }),
  }).then(r => r.json());
  assert.equal(couponCreate.ok, true);
  const couponId = couponCreate.couponId;

  const couponUpdate = await fetch(`http://127.0.0.1:3001/api/admin/coupons/${couponId}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken, code: `CRUD${stamp}B`, type: 'FIXED_AMOUNT', value: 12000 }),
  }).then(r => r.json());
  assert.equal(couponUpdate.ok, true);

  const couponDelete = await fetch(`http://127.0.0.1:3001/api/admin/coupons/${couponId}`, {
    method: 'DELETE', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken }),
  }).then(r => r.json());
  assert.equal(couponDelete.ok, true);

  const productDelete = await fetch(`http://127.0.0.1:3001/api/admin/products/${productId}`, {
    method: 'DELETE', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken }),
  }).then(r => r.json());
  assert.equal(productDelete.ok, true);

  const catDelete = await fetch(`http://127.0.0.1:3001/api/admin/categories/${catId}`, {
    method: 'DELETE', headers: { 'content-type': 'application/json', cookie: auth.cookies },
    body: JSON.stringify({ csrfToken: auth.csrfToken }),
  }).then(r => r.json());
  assert.equal(catDelete.ok, true);
});

test('products page shows quick-scan inventory UI', async () => {
  const auth = await loginAdmin('10.1.1.23');
  const page = await fetch('http://127.0.0.1:3001/products?sort=threshold-gap-asc', {
    headers: { cookie: auth.cookies },
  }).then(r => r.text());

  assert.match(page, /Threshold gap ↑/);
  assert.match(page, /state=low&amp;sort=threshold-gap-asc/);
  assert.match(page, /Reserved-heavy/);
  assert.match(page, /Healthy/);
  assert.match(page, /background:#f0fdf4;color:#166534;border:1px solid #bbf7d0/);
  assert.match(page, /gap/);
  assert.match(page, /reserve pressure/i);
});

test('admin order payment state is readable in UI', async () => {
  const auth = await loginAdmin('10.1.1.24');
  const ordersPage = await fetch('http://127.0.0.1:3001/orders', { headers: { cookie: auth.cookies } }).then(r => r.text());
  assert.match(ordersPage, /payment/i);
  assert.match(ordersPage, /UNPAID|PENDING|PAID|FAILED|REFUNDED/);

  const firstOrderHref = ordersPage.match(/\/orders\/([a-z0-9]+)/i);
  assert.ok(firstOrderHref?.[1]);
  const orderId = firstOrderHref![1];

  const detailBefore = await fetch(`http://127.0.0.1:3001/orders/${orderId}`, { headers: { cookie: auth.cookies } }).then(r => r.text());
  assert.match(detailBefore, /Payment history/i);
  assert.match(detailBefore, /name="paymentStatus" value="PAID"/i);
  assert.match(detailBefore, /name="paymentStatus" value="FAILED"/i);
  assert.match(detailBefore, /name="paymentStatus" value="REFUNDED"/i);
});

test('session controls via HTTP APIs', async () => {
  const auth1 = await loginAdmin('10.1.1.21');
  const auth2 = await loginAdmin('10.1.1.22');

  const list1 = await fetch('http://127.0.0.1:3001/api/admin/sessions?status=active&page=1&pageSize=50', { headers: { cookie: auth1.cookies } }).then(r => r.json());
  assert.equal(list1.ok, true);
  assert.equal(Array.isArray(list1.items), true);
  assert.equal(list1.items.length >= 2, true);

  const target = list1.items.find((s: any) => s.ipKey === '10.1.1.22');
  assert.ok(target);

  const revokeSingle = await fetch(`http://127.0.0.1:3001/api/admin/sessions/${target.sessionId}/revoke`, {
    method: 'POST', headers: { cookie: auth1.cookies },
  }).then(r => r.json());
  assert.equal(revokeSingle.ok, true);

  const list2 = await fetch('http://127.0.0.1:3001/api/admin/sessions?status=all&page=1&pageSize=50', { headers: { cookie: auth1.cookies } }).then(r => r.json());
  assert.equal(list2.ok, true);
  const revoked = list2.items.find((s: any) => s.sessionId === target.sessionId);
  assert.ok(revoked);
  assert.equal(revoked.revokedAt !== null, true);
});
