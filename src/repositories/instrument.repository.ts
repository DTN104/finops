import { asc, eq } from "drizzle-orm";

import type { DbExecutor } from "@/src/db";
import { instruments } from "@/src/db/schema";

export async function findInstrument(executor: DbExecutor, symbol: string) {
  const rows = await executor.select().from(instruments).where(eq(instruments.symbol, symbol)).limit(1);
  return rows[0] ?? null;
}

export function listInstruments(executor: DbExecutor) {
  return executor.select().from(instruments).orderBy(asc(instruments.symbol));
}
