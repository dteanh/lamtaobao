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
let storeProc: any;
let adminLog = '';
let storeLog = '';

async function waitFor(url: string) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {}
    await delay(500);
  }
  throw new Error(`Service not ready: ${url}\nADMIN LOG:\n${adminLog}\nSTORE LOG:\n${storeLog}`);
}

async function readJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

test.before(async () => {
  try { spawn('sh', ['-lc', 'fuser -k 3000/tcp 3001/tcp || true'], { stdio: 'ignore' }); } catch {}
  await delay(1000);
  adminProc = spawn('pnpm --filter @culi/admin dev', { env, cwd: process.cwd(), shell: true });
  storeProc = spawn('pnpm --filter @culi/storefront-default dev', { env, cwd: process.cwd(), shell: true });
  adminProc.stdout?.on('data', (buf: Buffer) => { adminLog += buf.toString(); });
  adminProc.stderr?.on('data', (buf: Buffer) => { adminLog += buf.toString(); });
  storeProc.stdout?.on('data', (buf: Buffer) => { storeLog += buf.toString(); });
  storeProc.stderr?.on('data', (buf: Buffer) => { storeLog += buf.toString(); });
  await waitFor('http://127.0.0.1:3001/login');
  await waitFor('http://127.0.0.1:3000');
});

test.after(async () => {
  adminProc?.kill('SIGTERM');
  storeProc?.kill('SIGTERM');
});

test('full commerce flow via HTTP integration', async () => {
  const addRes = await fetch('http://127.0.0.1:3000/api/cart/add', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ productSlug: 'vitamin-c-serum', quantity: 1 }),
  });
  const addBody = await readJsonSafe(addRes);
  assert.equal(addRes.status, 200, addBody.text);
  const setCookie = addRes.headers.get('set-cookie') || '';
  assert.match(setCookie, /cartToken=/);

  const cartCookie = setCookie.split(';')[0];
  const cartRes = await fetch('http://127.0.0.1:3000/api/cart', { headers: { cookie: cartCookie } });
  const cartBody = await readJsonSafe(cartRes);
  assert.equal(cartBody.json?.ok, true, cartBody.text);
  assert.equal(cartBody.json.cart.items.length >= 1, true);

  const checkoutRes = await fetch('http://127.0.0.1:3000/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: cartCookie },
    body: JSON.stringify({
      idempotencyKey: `e2e_${Date.now()}`,
      customer: { fullName: 'E2E User', email: `e2e_${Date.now()}@culi.local`, phone: '0902' },
      shippingAddress: { line1: 'E2E Street', city: 'HCM' },
      paymentMethod: 'COD',
    }),
  });
  const checkoutBody = await readJsonSafe(checkoutRes);
  assert.equal(checkoutBody.json?.ok, true, checkoutBody.text);
  assert.match(checkoutBody.json.order.orderNumber, /^ORD-/);

  const csrfRes = await fetch('http://127.0.0.1:3001/api/admin/csrf');
  const csrfBody = await readJsonSafe(csrfRes);
  const adminCookie = (csrfRes.headers.get('set-cookie') || '').split(';')[0];
  assert.equal(!!csrfBody.json?.token, true, csrfBody.text);

  const loginRes = await fetch('http://127.0.0.1:3001/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ email: 'admin@culi.local', password: 'dev-only', csrfToken: csrfBody.json.token }),
  });
  const loginBody = await readJsonSafe(loginRes);
  assert.equal(loginBody.json?.ok, true, loginBody.text);
  const sessionCookie = (loginRes.headers.get('set-cookie') || '').split(';')[0];
  assert.match(sessionCookie, /culi_admin_session=/);

  const ordersRes = await fetch('http://127.0.0.1:3001/api/admin/orders', { headers: { cookie: `${adminCookie}; ${sessionCookie}` } });
  const ordersBody = await readJsonSafe(ordersRes);
  assert.equal(ordersBody.json?.ok, true, ordersBody.text);
  assert.equal(Array.isArray(ordersBody.json.orders), true);
  assert.equal(ordersBody.json.orders.some((o: any) => o.orderNumber === checkoutBody.json.order.orderNumber), true);
});

test('login rate limit triggers after repeated failures', async () => {
  const csrfRes = await fetch('http://127.0.0.1:3001/api/admin/csrf');
  const csrfBody = await readJsonSafe(csrfRes);
  const adminCookie = (csrfRes.headers.get('set-cookie') || '').split(';')[0];
  let status = 0;
  let lastText = '';
  for (let i = 0; i < 6; i++) {
    const res = await fetch('http://127.0.0.1:3001/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: adminCookie, 'x-forwarded-for': 'rate-limit-test' },
      body: JSON.stringify({ email: 'admin@culi.local', password: 'wrong-pass', csrfToken: csrfBody.json.token }),
    });
    status = res.status;
    lastText = await res.text();
  }
  assert.equal(status, 429, lastText);
});
