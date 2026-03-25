import { prisma } from '@culi/db';

export function buildAuditDiff(before: unknown, after: unknown) {
  return { before: before ?? null, after: after ?? null };
}

export async function writeAuditLog(input: {
  actorUserId?: string | null;
  actorEmail?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  payload?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId || null,
      actorEmail: input.actorEmail || null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      payload: input.payload as any,
    },
  });
}

export async function listAuditLogs(input?: { page?: number; pageSize?: number; entityType?: string; entityId?: string; action?: string }) {
  const page = input?.page ?? 1;
  const pageSize = input?.pageSize ?? 50;
  const where = {
    ...(input?.entityType ? { entityType: input.entityType } : {}),
    ...(input?.entityId ? { entityId: input.entityId } : {}),
    ...(input?.action ? { action: input.action } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total, page, pageSize };
}
