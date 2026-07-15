import { desc, eq } from "drizzle-orm";

import type { DbExecutor } from "@/src/db";
import { auditLogs, users } from "@/src/db/schema";

export type AuditLogInput = typeof auditLogs.$inferInsert;

export async function createAuditLog(executor: DbExecutor, input: AuditLogInput) {
  const [log] = await executor.insert(auditLogs).values(input).returning();
  return log;
}

export async function listAuditLogs(executor: DbExecutor, limit = 200) {
  return executor
    .select({ log: auditLogs, actorName: users.name })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorUserId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
