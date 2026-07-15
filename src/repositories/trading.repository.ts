import { and, desc, eq, inArray, sql } from "drizzle-orm";

import type { DbExecutor } from "@/src/db";
import { executions, orders } from "@/src/db/schema";

export async function findOrder(executor: DbExecutor, reference: string, lock = false) {
  const query = executor.select().from(orders)
    .where(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(reference) ? eq(orders.id, reference) : eq(orders.publicId, reference))
    .limit(1);
  const rows = lock ? await query.for("update") : await query;
  return rows[0] ?? null;
}

export function listOrdersByAccount(executor: DbExecutor, accountId: string) {
  return executor.select().from(orders)
    .where(eq(orders.accountId, accountId))
    .orderBy(desc(orders.submittedAt));
}

export async function getReservedSellQuantity(executor: DbExecutor, accountId: string, symbol: string) {
  const [row] = await executor.select({
    quantity: sql<number>`coalesce(sum(${orders.quantity} - ${orders.filledQuantity}), 0)::integer`,
  }).from(orders).where(and(
    eq(orders.accountId, accountId),
    eq(orders.instrumentSymbol, symbol),
    eq(orders.side, "sell"),
    inArray(orders.status, ["pending", "open", "partial"]),
  ));
  return row?.quantity ?? 0;
}

export async function createOrder(executor: DbExecutor, input: typeof orders.$inferInsert) {
  const [order] = await executor.insert(orders).values(input).returning();
  return order;
}

export async function updateOrder(executor: DbExecutor, id: string, values: Partial<typeof orders.$inferInsert>) {
  const [order] = await executor.update(orders)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return order ?? null;
}

export async function createExecution(executor: DbExecutor, input: typeof executions.$inferInsert) {
  const [execution] = await executor.insert(executions).values(input).returning();
  return execution;
}
