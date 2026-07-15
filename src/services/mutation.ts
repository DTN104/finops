import type { DbExecutor } from "@/src/db";
import { createAuditLog } from "@/src/repositories/audit.repository";

export type MutationResult<T> = { success: true; data: T } | { success: false; error: string };

interface AuditMutationInput {
  actorUserId?: string | null;
  accountId?: string | null;
  action: string;
  module: string;
  resourceType: string;
  resourceId: string;
  origin: string;
  summary: string;
  outcome: "success" | "denied";
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}

function toJsonRecord(value: unknown): Record<string, unknown> | null {
  if (value == null) return null;
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

export function auditMutation(executor: DbExecutor, input: AuditMutationInput) {
  return createAuditLog(executor, {
    actorUserId: input.actorUserId,
    accountId: input.accountId,
    action: input.action,
    module: input.module,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    outcome: input.outcome,
    origin: input.origin,
    summary: input.summary,
    before: toJsonRecord(input.before),
    after: toJsonRecord(input.after),
    metadata: input.metadata ?? {},
  });
}
