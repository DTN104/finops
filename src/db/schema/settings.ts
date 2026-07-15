import { boolean, integer, jsonb, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { finopsSchema, tableDensityEnum, themeEnum } from "./enums";
import { users } from "./identity";

export const userSettings = finopsSchema.table("user_settings", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  theme: themeEnum("theme").default("dark").notNull(),
  tableDensity: tableDensityEnum("table_density").default("comfortable").notNull(),
  quoteCadenceMs: integer("quote_cadence_ms").default(500).notNull(),
  performanceTelemetry: boolean("performance_telemetry").default(true).notNull(),
  timezone: varchar("timezone", { length: 80 }).default("Asia/Ho_Chi_Minh").notNull(),
  preferences: jsonb("preferences").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
