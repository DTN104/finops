import { and, eq } from "drizzle-orm";

import type { DbExecutor } from "@/server/db";
import { tradingAccounts } from "@/server/db/schema";

export async function findActiveAccountByUser(executor: DbExecutor, userId: string) {
  const rows = await executor.select().from(tradingAccounts)
    .where(and(eq(tradingAccounts.userId, userId), eq(tradingAccounts.status, "active")))
    .limit(1);
  return rows[0] ?? null;
}

export async function findAccountById(executor: DbExecutor, id: string, lock = false) {
  const query = executor.select().from(tradingAccounts).where(eq(tradingAccounts.id, id)).limit(1);
  const rows = lock ? await query.for("update") : await query;
  return rows[0] ?? null;
}

export async function updateAccountBalances(
  executor: DbExecutor,
  id: string,
  values: Partial<Pick<typeof tradingAccounts.$inferInsert, "cashBalance" | "buyingPower" | "realizedPnl">>,
) {
  const [account] = await executor.update(tradingAccounts)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(tradingAccounts.id, id))
    .returning();
  return account ?? null;
}
