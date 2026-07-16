import { and, desc, eq } from "drizzle-orm";

import type { DbExecutor } from "@/server/db";
import { cashLedger, instruments, positions } from "@/server/db/schema";

export async function findPosition(executor: DbExecutor, accountId: string, symbol: string, lock = false) {
  const query = executor.select().from(positions).where(and(
    eq(positions.accountId, accountId),
    eq(positions.instrumentSymbol, symbol),
  )).limit(1);
  const rows = lock ? await query.for("update") : await query;
  return rows[0] ?? null;
}

export function listPositions(executor: DbExecutor, accountId: string) {
  return executor.select({ position: positions, instrument: instruments })
    .from(positions)
    .innerJoin(instruments, eq(positions.instrumentSymbol, instruments.symbol))
    .where(eq(positions.accountId, accountId));
}

export async function upsertPosition(executor: DbExecutor, input: typeof positions.$inferInsert) {
  const [position] = await executor.insert(positions).values(input)
    .onConflictDoUpdate({
      target: [positions.accountId, positions.instrumentSymbol],
      set: { quantity: input.quantity, averageCost: input.averageCost, realizedPnl: input.realizedPnl, updatedAt: new Date() },
    })
    .returning();
  return position;
}

export async function createCashLedgerEntry(executor: DbExecutor, input: typeof cashLedger.$inferInsert) {
  const [entry] = await executor.insert(cashLedger).values(input).returning();
  return entry;
}

export function listCashLedger(executor: DbExecutor, accountId: string, limit = 200) {
  return executor.select().from(cashLedger)
    .where(eq(cashLedger.accountId, accountId))
    .orderBy(desc(cashLedger.createdAt))
    .limit(limit);
}
