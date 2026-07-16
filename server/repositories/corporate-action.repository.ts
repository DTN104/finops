import { asc, eq } from "drizzle-orm";

import type { DbExecutor } from "@/server/db";
import { corporateActions } from "@/server/db/schema";

export async function findCorporateAction(executor: DbExecutor, reference: string, lock = false) {
  const query = executor.select().from(corporateActions)
    .where(eq(corporateActions.reference, reference))
    .limit(1);
  const rows = lock ? await query.for("update") : await query;
  return rows[0] ?? null;
}

export function listCorporateActions(executor: DbExecutor) {
  return executor.select().from(corporateActions).orderBy(asc(corporateActions.exDate));
}

export async function createCorporateAction(executor: DbExecutor, input: typeof corporateActions.$inferInsert) {
  const [action] = await executor.insert(corporateActions).values(input).returning();
  return action;
}

export async function updateCorporateAction(executor: DbExecutor, id: string, values: Partial<typeof corporateActions.$inferInsert>) {
  const [action] = await executor.update(corporateActions)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(corporateActions.id, id))
    .returning();
  return action ?? null;
}
