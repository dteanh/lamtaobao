import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test('session audit list and revoke-all persistence paths work', async () => {
  const user = await prisma.user.findUnique({ where: { email: 'admin@culi.local' } });
  assert.ok(user);

  const s1 = await prisma.adminSession.create({ data: { userId: user.id, sessionId: `audit-1-${Date.now()}`, expiresAt: new Date(Date.now() + 60000) } });
  const s2 = await prisma.adminSession.create({ data: { userId: user.id, sessionId: `audit-2-${Date.now()}`, expiresAt: new Date(Date.now() + 60000) } });
  const sessions = await prisma.adminSession.findMany({ where: { userId: user.id, revokedAt: null } });
  assert.equal(sessions.some((x) => x.sessionId === s1.sessionId), true);
  assert.equal(sessions.some((x) => x.sessionId === s2.sessionId), true);

  await prisma.adminSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
  const activeAfter = await prisma.adminSession.count({ where: { userId: user.id, revokedAt: null } });
  assert.equal(activeAfter, 0);
});
