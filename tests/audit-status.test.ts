import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test('audit log table records rows and metrics/status tables readable', async () => {
  const log = await prisma.auditLog.create({
    data: { entityType: 'test', entityId: `entity-${Date.now()}`, action: 'create', actorEmail: 'admin@culi.local' },
  });
  assert.ok(log.id);

  const found = await prisma.auditLog.findUnique({ where: { id: log.id } });
  assert.equal(found?.action, 'create');

  const metrics = await prisma.metricCounter.findMany();
  assert.equal(Array.isArray(metrics), true);
});
