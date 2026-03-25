import { buildAuditDiff, writeAuditLog } from '../audit/service';

export async function auditMutation(input: {
  actorUserId?: string | null;
  actorEmail?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  requestId: string;
  before?: unknown;
  after?: unknown;
  meta?: Record<string, unknown>;
}) {
  return writeAuditLog({
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    payload: {
      requestId: input.requestId,
      diff: buildAuditDiff(input.before ?? null, input.after ?? null),
      meta: input.meta ?? null,
    },
  });
}
