import { index, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { finopsSchema, userStatusEnum } from "./enums";

export const roles = finopsSchema.table("roles", {
  code: varchar("code", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = finopsSchema.table("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  initials: varchar("initials", { length: 8 }).notNull(),
  roleCode: varchar("role_code", { length: 20 }).notNull().references(() => roles.code, { onDelete: "restrict", onUpdate: "cascade" }),
  status: userStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("users_email_uidx").on(table.email),
  index("users_role_status_idx").on(table.roleCode, table.status),
]);
