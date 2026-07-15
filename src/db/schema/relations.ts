import { relations } from "drizzle-orm";

import { tradingAccounts } from "./accounts";
import { auditLogs } from "./audit";
import { corporateActionResponses, corporateActions } from "./corporate-actions";
import { roles, users } from "./identity";
import { instruments } from "./instruments";
import { cashLedger, positions } from "./portfolio";
import { userSettings } from "./settings";
import { executions, orders } from "./trading";

export const rolesRelations = relations(roles, ({ many }) => ({ users: many(users) }));
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleCode], references: [roles.code] }),
  accounts: many(tradingAccounts),
  settings: one(userSettings),
  orders: many(orders),
  auditLogs: many(auditLogs),
}));
export const tradingAccountsRelations = relations(tradingAccounts, ({ one, many }) => ({
  user: one(users, { fields: [tradingAccounts.userId], references: [users.id] }),
  orders: many(orders),
  executions: many(executions),
  positions: many(positions),
  cashLedger: many(cashLedger),
  corporateActionResponses: many(corporateActionResponses),
}));
export const instrumentsRelations = relations(instruments, ({ many }) => ({
  orders: many(orders), executions: many(executions), positions: many(positions), corporateActions: many(corporateActions),
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
  account: one(tradingAccounts, { fields: [orders.accountId], references: [tradingAccounts.id] }),
  instrument: one(instruments, { fields: [orders.instrumentSymbol], references: [instruments.symbol] }),
  createdBy: one(users, { fields: [orders.createdByUserId], references: [users.id] }),
  executions: many(executions),
  cashLedger: many(cashLedger),
}));
export const executionsRelations = relations(executions, ({ one, many }) => ({
  order: one(orders, { fields: [executions.orderId], references: [orders.id] }),
  account: one(tradingAccounts, { fields: [executions.accountId], references: [tradingAccounts.id] }),
  instrument: one(instruments, { fields: [executions.instrumentSymbol], references: [instruments.symbol] }),
  cashLedger: many(cashLedger),
}));
export const positionsRelations = relations(positions, ({ one }) => ({
  account: one(tradingAccounts, { fields: [positions.accountId], references: [tradingAccounts.id] }),
  instrument: one(instruments, { fields: [positions.instrumentSymbol], references: [instruments.symbol] }),
}));
export const cashLedgerRelations = relations(cashLedger, ({ one }) => ({
  account: one(tradingAccounts, { fields: [cashLedger.accountId], references: [tradingAccounts.id] }),
  order: one(orders, { fields: [cashLedger.orderId], references: [orders.id] }),
  execution: one(executions, { fields: [cashLedger.executionId], references: [executions.id] }),
}));
export const corporateActionsRelations = relations(corporateActions, ({ one, many }) => ({
  instrument: one(instruments, { fields: [corporateActions.instrumentSymbol], references: [instruments.symbol] }),
  createdBy: one(users, { fields: [corporateActions.createdByUserId], references: [users.id], relationName: "corporate_action_creator" }),
  publishedBy: one(users, { fields: [corporateActions.publishedByUserId], references: [users.id], relationName: "corporate_action_publisher" }),
  responses: many(corporateActionResponses),
}));
export const corporateActionResponsesRelations = relations(corporateActionResponses, ({ one }) => ({
  corporateAction: one(corporateActions, { fields: [corporateActionResponses.corporateActionId], references: [corporateActions.id] }),
  account: one(tradingAccounts, { fields: [corporateActionResponses.accountId], references: [tradingAccounts.id] }),
  user: one(users, { fields: [corporateActionResponses.userId], references: [users.id] }),
}));
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actorUserId], references: [users.id] }),
  account: one(tradingAccounts, { fields: [auditLogs.accountId], references: [tradingAccounts.id] }),
}));
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));
