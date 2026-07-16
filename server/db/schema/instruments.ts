import { bigint, index, timestamp, varchar } from "drizzle-orm/pg-core";

import { finopsSchema, instrumentStatusEnum } from "./enums";

export const instruments = finopsSchema.table("instruments", {
  symbol: varchar("symbol", { length: 20 }).primaryKey(),
  company: varchar("company", { length: 160 }).notNull(),
  exchange: varchar("exchange", { length: 20 }).default("HOSE").notNull(),
  sector: varchar("sector", { length: 80 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("VND").notNull(),
  referencePrice: bigint("reference_price", { mode: "number" }).notNull(),
  previousClose: bigint("previous_close", { mode: "number" }).notNull(),
  status: instrumentStatusEnum("status").default("trading").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("instruments_exchange_status_idx").on(table.exchange, table.status),
  index("instruments_sector_idx").on(table.sector),
]);
