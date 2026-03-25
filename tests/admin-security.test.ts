import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test('persistent admin session and rate limit tables exist and work', async () => {
  const user = await prisma.user.findUnique({ where: { email: 'admin@culi.local' } });
  assert.ok(user);

  const session = await prisma.adminSession.create({
    data: { userId: user.id, sessionId: `test-session-${Date.now()}`, expiresAt: new Date(Date.now() + 60_000) },
  });
  assert.ok(session.id);

  const rl = await prisma.loginRateLimit.upsert({
    where: { key: 'admin-test-key' },
    update: { count: 3, resetAt: new Date(Date.now() + 60_000) },
    create: { key: 'admin-test-key', count: 3, resetAt: new Date(Date.now() + 60_000) },
  });
  assert.equal(rl.count, 3);

  await prisma.adminSession.delete({ where: { sessionId: session.sessionId } });
  await prisma.loginRateLimit.delete({ where: { key: 'admin-test-key' } });
});
