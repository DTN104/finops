import { sql } from "drizzle-orm";
import { bigint, check, index, integer, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { tradingAccounts } from "./accounts";
import { finopsSchema, orderSideEnum, orderStatusEnum, orderTypeEnum } from "./enums";
import { users } from "./identity";
import { instruments } from "./instruments";

export const orders = finopsSchema.table("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull(),
  accountId: uuid("account_id").notNull().references(() => tradingAccounts.id, { onDelete: "restrict" }),
  instrumentSymbol: varchar("instrument_symbol", { length: 20 }).notNull().references(() => instruments.symbol, { onDelete: "restrict", onUpdate: "cascade" }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  side: orderSideEnum("side").notNull(),
  orderType: orderTypeEnum("order_type").default("limit").notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  quantity: integer("quantity").notNull(),
  limitPrice: bigint("limit_price", { mode: "number" }).notNull(),
  filledQuantity: integer("filled_quantity").default(0).notNull(),
  reservedAmount: bigint("reserved_amount", { mode: "number" }).default(0).notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("orders_public_id_uidx").on(table.publicId),
  index("orders_account_submitted_idx").on(table.accountId, table.submittedAt),
  index("orders_status_submitted_idx").on(table.status, table.submittedAt),
  index("orders_instrument_submitted_idx").on(table.instrumentSymbol, table.submittedAt),
  check("orders_quantity_positive", sql`${table.quantity} > 0`),
  check("orders_price_positive", sql`${table.limitPrice} > 0`),
  check("orders_fill_range", sql`${table.filledQuantity} >= 0 AND ${table.filledQuantity} <= ${table.quantity}`),
  check("orders_reserved_nonnegative", sql`${table.reservedAmount} >= 0`),
]);

export const executions = finopsSchema.table("executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  accountId: uuid("account_id").notNull().references(() => tradingAccounts.id, { onDelete: "restrict" }),
  instrumentSymbol: varchar("instrument_symbol", { length: 20 }).notNull().references(() => instruments.symbol, { onDelete: "restrict", onUpdate: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: bigint("price", { mode: "number" }).notNull(),
  fee: bigint("fee", { mode: "number" }).default(0).notNull(),
  executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("executions_order_time_idx").on(table.orderId, table.executedAt),
  index("executions_account_time_idx").on(table.accountId, table.executedAt),
  check("executions_quantity_positive", sql`${table.quantity} > 0`),
  check("executions_price_positive", sql`${table.price} > 0`),
  check("executions_fee_nonnegative", sql`${table.fee} >= 0`),
]);
