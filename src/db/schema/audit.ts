import { index, jsonb, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { tradingAccounts } from "./accounts";
import { auditOutcomeEnum, finopsSchema } from "./enums";
import { users } from "./identity";

export const auditLogs = finopsSchema.table("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  accountId: uuid("account_id").references(() => tradingAccounts.id, { onDelete: "set null" }),
  action: varchar("action", { length: 80 }).notNull(),
  module: varchar("module", { length: 80 }).notNull(),
  resourceType: varchar("resource_type", { length: 80 }).notNull(),
  resourceId: varchar("resource_id", { length: 120 }).notNull(),
  outcome: auditOutcomeEnum("outcome").notNull(),
  origin: varchar("origin", { length: 160 }).notNull(),
  summary: text("summary").notNull(),
  before: jsonb("before").$type<Record<string, unknown> | null>(),
  after: jsonb("after").$type<Record<string, unknown> | null>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_logs_created_idx").on(table.createdAt),
  index("audit_logs_actor_created_idx").on(table.actorUserId, table.createdAt),
  index("audit_logs_resource_created_idx").on(table.resourceType, table.resourceId, table.createdAt),
  index("audit_logs_action_outcome_idx").on(table.action, table.outcome),
]);
