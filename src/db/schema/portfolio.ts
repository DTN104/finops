import { sql } from "drizzle-orm";
import { bigint, check, index, integer, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { tradingAccounts } from "./accounts";
import { cashLedgerTypeEnum, finopsSchema } from "./enums";
import { instruments } from "./instruments";
import { executions, orders } from "./trading";

export const positions = finopsSchema.table("positions", {
  accountId: uuid("account_id").notNull().references(() => tradingAccounts.id, { onDelete: "restrict" }),
  instrumentSymbol: varchar("instrument_symbol", { length: 20 }).notNull().references(() => instruments.symbol, { onDelete: "restrict", onUpdate: "cascade" }),
  quantity: integer("quantity").default(0).notNull(),
  averageCost: bigint("average_cost", { mode: "number" }).default(0).notNull(),
  realizedPnl: bigint("realized_pnl", { mode: "number" }).default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.accountId, table.instrumentSymbol], name: "positions_pk" }),
  index("positions_instrument_idx").on(table.instrumentSymbol),
  check("positions_quantity_nonnegative", sql`${table.quantity} >= 0`),
  check("positions_average_cost_nonnegative", sql`${table.averageCost} >= 0`),
]);

export const cashLedger = finopsSchema.table("cash_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").notNull().references(() => tradingAccounts.id, { onDelete: "restrict" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "restrict" }),
  executionId: uuid("execution_id").references(() => executions.id, { onDelete: "restrict" }),
  type: cashLedgerTypeEnum("type").notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  balanceAfter: bigint("balance_after", { mode: "number" }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("cash_ledger_account_time_idx").on(table.accountId, table.createdAt),
  index("cash_ledger_order_idx").on(table.orderId),
  check("cash_ledger_balance_nonnegative", sql`${table.balanceAfter} >= 0`),
  check("cash_ledger_amount_nonzero", sql`${table.amount} <> 0`),
]);
