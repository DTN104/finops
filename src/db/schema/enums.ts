import { pgSchema } from "drizzle-orm/pg-core";

export const finopsSchema = pgSchema("finops");

export const userStatusEnum = finopsSchema.enum("user_status", ["active", "disabled"]);
export const accountStatusEnum = finopsSchema.enum("account_status", ["active", "suspended", "closed"]);
export const instrumentStatusEnum = finopsSchema.enum("instrument_status", ["trading", "halted"]);
export const orderSideEnum = finopsSchema.enum("order_side", ["buy", "sell"]);
export const orderTypeEnum = finopsSchema.enum("order_type", ["limit", "stop"]);
export const orderStatusEnum = finopsSchema.enum("order_status", ["pending", "open", "partial", "filled", "cancelled", "rejected"]);
export const cashLedgerTypeEnum = finopsSchema.enum("cash_ledger_type", ["deposit", "withdrawal", "order_reserve", "order_release", "trade_debit", "trade_credit", "fee", "dividend", "adjustment"]);
export const corporateActionTypeEnum = finopsSchema.enum("corporate_action_type", ["cash_dividend", "stock_dividend", "bonus_shares", "rights_offering", "voting", "bond_maturity"]);
export const corporateActionStatusEnum = finopsSchema.enum("corporate_action_status", ["draft", "announced", "upcoming", "completed"]);
export const responseStatusEnum = finopsSchema.enum("response_status", ["pending", "submitted", "withdrawn"]);
export const auditOutcomeEnum = finopsSchema.enum("audit_outcome", ["success", "denied"]);
export const themeEnum = finopsSchema.enum("theme", ["light", "dark", "system"]);
export const tableDensityEnum = finopsSchema.enum("table_density", ["comfortable", "compact"]);
