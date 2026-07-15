import { db } from "@/src/db";
import type { AuditLogView, CorporateAction, CorporateActionStatus, ManagedUser, WorkspaceSettings } from "@/lib/operations";
import { defaultSettings } from "@/lib/operations";
import type { PortfolioPosition } from "@/lib/portfolio";
import { estimateOrder, type MockOrder, type OrderStatus, type OrderType } from "@/lib/trading";
import { findActiveAccountByUser } from "@/src/repositories/account.repository";
import { listAuditLogs } from "@/src/repositories/audit.repository";
import { listCorporateActions } from "@/src/repositories/corporate-action.repository";
import { listUsers } from "@/src/repositories/identity.repository";
import { listPositions } from "@/src/repositories/portfolio.repository";
import { findUserSettings } from "@/src/repositories/settings.repository";
import { listOrdersByAccount } from "@/src/repositories/trading.repository";

export interface PortfolioSnapshot {
  accountId: string;
  buyingPower: number;
  cashBalance: number;
  realizedPnl: number;
  positions: Record<string, PortfolioPosition>;
  orders: MockOrder[];
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" });
const auditFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3, hour12: false, timeZone: "Asia/Ho_Chi_Minh" });

function sector(value: string): PortfolioPosition["sector"] {
  if (value === "Technology" || value === "Financials" || value === "Industrials" || value === "Consumer") return value;
  return "Industrials";
}

export function toMockOrder(
  order: Awaited<ReturnType<typeof listOrdersByAccount>>[number],
  snapshot: Pick<PortfolioSnapshot, "buyingPower" | "positions">,
  actor: string,
): MockOrder {
  const position = snapshot.positions[order.instrumentSymbol];
  const draft = { side: order.side, quantity: order.quantity, limitPrice: order.limitPrice };
  return {
    id: order.publicId,
    symbol: order.instrumentSymbol,
    side: order.side,
    quantity: order.quantity,
    limitPrice: order.limitPrice,
    orderType: order.orderType.toUpperCase() as OrderType,
    status: order.status.toUpperCase() as OrderStatus,
    filledQuantity: order.filledQuantity,
    reservedBuyingPower: order.reservedAmount,
    submittedDate: dateFormatter.format(order.submittedAt),
    submittedAt: timeFormatter.format(order.submittedAt),
    actor,
    estimate: estimateOrder(draft, {
      buyingPower: snapshot.buyingPower,
      positionQuantity: position?.quantity ?? 0,
      averageCost: position?.averageCost ?? 0,
    }),
  };
}

export async function getPortfolioSnapshot(userId: string, actor: string): Promise<PortfolioSnapshot | null> {
  const account = await findActiveAccountByUser(db, userId);
  if (!account) return null;
  const [positionRows, orderRows] = await Promise.all([
    listPositions(db, account.id),
    listOrdersByAccount(db, account.id),
  ]);
  const positions = Object.fromEntries(positionRows.map(({ position, instrument }) => [instrument.symbol, {
    symbol: instrument.symbol,
    company: instrument.company,
    sector: sector(instrument.sector),
    quantity: position.quantity,
    averageCost: position.averageCost,
    last: instrument.referencePrice,
    previousClose: instrument.previousClose,
  } satisfies PortfolioPosition]));
  const snapshot = { accountId: account.id, buyingPower: account.buyingPower, cashBalance: account.cashBalance, realizedPnl: account.realizedPnl, positions, orders: [] as MockOrder[] };
  snapshot.orders = orderRows.map((order) => toMockOrder(order, snapshot, actor));
  return snapshot;
}

const actionTypes = {
  cash_dividend: "Cash Dividend",
  stock_dividend: "Stock Dividend",
  bonus_shares: "Bonus Shares",
  rights_offering: "Rights Offering",
  voting: "Voting",
  bond_maturity: "Bond Maturity",
} as const;

function actionStatus(action: Awaited<ReturnType<typeof listCorporateActions>>[number]): CorporateActionStatus {
  if (action.status === "draft") return "DRAFT";
  if (action.requiresResponse && action.status === "upcoming") return "ACTION NEEDED";
  return action.status.toUpperCase() as CorporateActionStatus;
}

export function toCorporateAction(action: Awaited<ReturnType<typeof listCorporateActions>>[number]): CorporateAction {
  return {
    id: action.reference,
    symbol: action.instrumentSymbol,
    title: action.title,
    type: actionTypes[action.type],
    currency: "VND",
    exDate: action.exDate,
    recordDate: action.recordDate,
    paymentDate: action.paymentDate,
    amountPerShare: action.cashAmount ?? 0,
    description: action.description,
    sourceReference: action.source,
    status: actionStatus(action),
    published: Boolean(action.publishedAt),
  };
}

export async function getCorporateActionViews() {
  return (await listCorporateActions(db)).map(toCorporateAction);
}

export async function getManagedUserViews(): Promise<ManagedUser[]> {
  const userRows = await listUsers(db);
  return Promise.all(userRows.map(async (user) => {
    const account = await findActiveAccountByUser(db, user.id);
    const orderCount = account ? (await listOrdersByAccount(db, account.id)).length : 0;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleCode as ManagedUser["role"],
      status: user.status.toUpperCase() as ManagedUser["status"],
      lastActive: dateFormatter.format(user.updatedAt),
      orders: orderCount,
    };
  }));
}

export async function getWorkspaceSettings(userId: string): Promise<WorkspaceSettings> {
  const settings = await findUserSettings(db, userId);
  if (!settings) return defaultSettings;
  const preferences = settings.preferences;
  const cadence = String(settings.quoteCadenceMs);
  return {
    landingScreen: preferences.landingScreen === "market" || preferences.landingScreen === "portfolio" ? preferences.landingScreen : "dashboard",
    tableDensity: settings.tableDensity,
    quoteCadence: cadence === "250" || cadence === "1000" ? cadence : "500",
    currency: "VND",
    paperTradingBanner: preferences.paperTradingBanner !== false,
    performanceTelemetry: settings.performanceTelemetry,
    confirmDestructiveActions: preferences.confirmDestructiveActions !== false,
  };
}

function prettyJson(value: Record<string, unknown> | null): string | undefined {
  return value ? JSON.stringify(value, null, 2) : undefined;
}

export async function getAuditLogViews(): Promise<AuditLogView[]> {
  return (await listAuditLogs(db)).map(({ log, actorName }) => ({
    id: log.id,
    timestamp: auditFormatter.format(log.createdAt),
    actor: actorName ?? "System",
    action: log.action,
    module: log.module,
    resource: log.resourceId,
    origin: log.origin,
    outcome: log.outcome.toUpperCase() as AuditLogView["outcome"],
    summary: log.summary,
    before: prettyJson(log.before),
    after: prettyJson(log.after),
  }));
}
