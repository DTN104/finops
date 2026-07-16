import { sql } from "drizzle-orm";
import { bigint, boolean, check, date, index, integer, jsonb, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { tradingAccounts } from "./accounts";
import { corporateActionStatusEnum, corporateActionTypeEnum, finopsSchema, responseStatusEnum } from "./enums";
import { users } from "./identity";
import { instruments } from "./instruments";

export const corporateActions = finopsSchema.table("corporate_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: varchar("reference", { length: 60 }).notNull(),
  instrumentSymbol: varchar("instrument_symbol", { length: 20 }).notNull().references(() => instruments.symbol, { onDelete: "restrict", onUpdate: "cascade" }),
  type: corporateActionTypeEnum("type").notNull(),
  status: corporateActionStatusEnum("status").default("draft").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  exDate: date("ex_date", { mode: "string" }).notNull(),
  recordDate: date("record_date", { mode: "string" }).notNull(),
  paymentDate: date("payment_date", { mode: "string" }).notNull(),
  currency: varchar("currency", { length: 3 }).default("VND").notNull(),
  cashAmount: bigint("cash_amount", { mode: "number" }),
  ratioNumerator: integer("ratio_numerator"),
  ratioDenominator: integer("ratio_denominator"),
  taxRateBps: integer("tax_rate_bps").default(0).notNull(),
  requiresResponse: boolean("requires_response").default(false).notNull(),
  source: varchar("source", { length: 160 }).notNull(),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  publishedByUserId: uuid("published_by_user_id").references(() => users.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("corporate_actions_reference_uidx").on(table.reference),
  index("corporate_actions_status_ex_date_idx").on(table.status, table.exDate),
  index("corporate_actions_instrument_record_date_idx").on(table.instrumentSymbol, table.recordDate),
  check("corporate_actions_date_order", sql`${table.exDate} <= ${table.recordDate} AND ${table.recordDate} <= ${table.paymentDate}`),
  check("corporate_actions_tax_rate_range", sql`${table.taxRateBps} >= 0 AND ${table.taxRateBps} <= 10000`),
]);

export const corporateActionResponses = finopsSchema.table("corporate_action_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  corporateActionId: uuid("corporate_action_id").notNull().references(() => corporateActions.id, { onDelete: "restrict" }),
  accountId: uuid("account_id").notNull().references(() => tradingAccounts.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  responseType: varchar("response_type", { length: 60 }).notNull(),
  status: responseStatusEnum("status").default("pending").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("corporate_action_responses_action_account_uidx").on(table.corporateActionId, table.accountId),
  index("corporate_action_responses_user_idx").on(table.userId),
]);
