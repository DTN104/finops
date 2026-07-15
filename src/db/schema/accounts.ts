import { sql } from "drizzle-orm";
import { bigint, check, index, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { accountStatusEnum, finopsSchema } from "./enums";
import { users } from "./identity";

export const tradingAccounts = finopsSchema.table("trading_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  accountNumber: varchar("account_number", { length: 40 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("VND").notNull(),
  status: accountStatusEnum("status").default("active").notNull(),
  cashBalance: bigint("cash_balance", { mode: "number" }).default(0).notNull(),
  buyingPower: bigint("buying_power", { mode: "number" }).default(0).notNull(),
  realizedPnl: bigint("realized_pnl", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("trading_accounts_number_uidx").on(table.accountNumber),
  index("trading_accounts_user_idx").on(table.userId),
  check("trading_accounts_cash_nonnegative", sql`${table.cashBalance} >= 0`),
  check("trading_accounts_buying_power_nonnegative", sql`${table.buyingPower} >= 0`),
]);
