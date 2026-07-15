import { sql } from "drizzle-orm";

import { db, pool } from "@/src/db";
import {
  auditLogs,
  cashLedger,
  corporateActionResponses,
  corporateActions,
  executions,
  instruments,
  orders,
  positions,
  roles,
  tradingAccounts,
  users,
  userSettings,
} from "@/src/db/schema";

const ids = {
  users: {
    viewer: "00000000-0000-4000-8000-000000000001",
    trader: "00000000-0000-4000-8000-000000000002",
    admin: "00000000-0000-4000-8000-000000000003",
  },
  accounts: {
    viewer: "10000000-0000-4000-8000-000000000001",
    trader: "10000000-0000-4000-8000-000000000002",
    admin: "10000000-0000-4000-8000-000000000003",
  },
  orders: {
    open: "20000000-0000-4000-8000-000000000001",
    partial: "20000000-0000-4000-8000-000000000002",
    filled: "20000000-0000-4000-8000-000000000003",
  },
  execution: "30000000-0000-4000-8000-000000000001",
  ledger: "40000000-0000-4000-8000-000000000001",
  actions: {
    fpt: "50000000-0000-4000-8000-000000000001",
    vcb: "50000000-0000-4000-8000-000000000002",
    hpg: "50000000-0000-4000-8000-000000000003",
    mwg: "50000000-0000-4000-8000-000000000004",
    ssi: "50000000-0000-4000-8000-000000000005",
    vnm: "50000000-0000-4000-8000-000000000006",
  },
  response: "60000000-0000-4000-8000-000000000001",
  audit: "70000000-0000-4000-8000-000000000001",
} as const;

const seededAt = new Date("2026-07-15T02:00:00.000Z");

const instrumentRows = [
  { symbol: "FPT", company: "FPT Corporation", exchange: "HOSE", sector: "Technology", referencePrice: 126_400, previousClose: 123_800 },
  { symbol: "VCB", company: "Vietcombank", exchange: "HOSE", sector: "Financials", referencePrice: 58_900, previousClose: 59_100 },
  { symbol: "HPG", company: "Hoa Phat Group", exchange: "HOSE", sector: "Industrials", referencePrice: 31_250, previousClose: 30_720 },
  { symbol: "MWG", company: "Mobile World", exchange: "HOSE", sector: "Consumer", referencePrice: 65_800, previousClose: 65_500 },
  { symbol: "SSI", company: "SSI Securities", exchange: "HOSE", sector: "Financials", referencePrice: 37_100, previousClose: 37_400 },
  { symbol: "VNM", company: "Vinamilk", exchange: "HOSE", sector: "Consumer", referencePrice: 73_600, previousClose: 73_400 },
] as const;

const positionRows = [
  { instrumentSymbol: "FPT", quantity: 2_400, averageCost: 112_100 },
  { instrumentSymbol: "VCB", quantity: 3_000, averageCost: 59_600 },
  { instrumentSymbol: "HPG", quantity: 4_500, averageCost: 29_650 },
  { instrumentSymbol: "MWG", quantity: 1_600, averageCost: 63_800 },
  { instrumentSymbol: "SSI", quantity: 1_200, averageCost: 37_400 },
  { instrumentSymbol: "VNM", quantity: 380, averageCost: 71_900 },
] as const;

async function seed() {
  await db.transaction(async (tx) => {
    await tx.delete(auditLogs);
    await tx.delete(corporateActionResponses);
    await tx.delete(cashLedger);
    await tx.delete(executions);
    await tx.delete(orders);
    await tx.delete(positions);
    await tx.delete(corporateActions);
    await tx.delete(userSettings);
    await tx.delete(tradingAccounts);
    await tx.delete(users);
    await tx.delete(instruments);
    await tx.delete(roles);

    await tx.insert(roles).values([
      { code: "viewer", name: "Viewer", createdAt: seededAt },
      { code: "trader", name: "Trader", createdAt: seededAt },
      { code: "admin", name: "Admin", createdAt: seededAt },
    ]).onConflictDoUpdate({ target: roles.code, set: { name: sql`excluded.name` } });

    await tx.insert(users).values([
      { id: ids.users.viewer, email: "demo.viewer@finops.local", name: "Jordan Lee", initials: "JL", roleCode: "viewer", status: "active", createdAt: seededAt, updatedAt: seededAt },
      { id: ids.users.trader, email: "demo.trader@finops.local", name: "Alex Morgan", initials: "AM", roleCode: "trader", status: "active", createdAt: seededAt, updatedAt: seededAt },
      { id: ids.users.admin, email: "demo.admin@finops.local", name: "Sam Rivera", initials: "SR", roleCode: "admin", status: "active", createdAt: seededAt, updatedAt: seededAt },
    ]).onConflictDoUpdate({
      target: users.id,
      set: { email: sql`excluded.email`, name: sql`excluded.name`, initials: sql`excluded.initials`, roleCode: sql`excluded.role_code`, status: "active", updatedAt: seededAt },
    });

    await tx.insert(instruments).values(instrumentRows.map((instrument) => ({
      ...instrument,
      currency: "VND" as const,
      status: "trading" as const,
      createdAt: seededAt,
      updatedAt: seededAt,
    }))).onConflictDoUpdate({
      target: instruments.symbol,
      set: {
        company: sql`excluded.company`,
        exchange: sql`excluded.exchange`,
        sector: sql`excluded.sector`,
        referencePrice: sql`excluded.reference_price`,
        previousClose: sql`excluded.previous_close`,
        status: "trading",
        updatedAt: seededAt,
      },
    });

    await tx.insert(tradingAccounts).values([
      { id: ids.accounts.viewer, userId: ids.users.viewer, accountNumber: "FIN-VIEWER-001", name: "Viewer Paper Account", cashBalance: 486_200_000, buyingPower: 486_200_000, realizedPnl: 24_514_000, createdAt: seededAt, updatedAt: seededAt },
      { id: ids.accounts.trader, userId: ids.users.trader, accountNumber: "FIN-TRADER-001", name: "Trader Paper Account", cashBalance: 486_200_000, buyingPower: 486_200_000, realizedPnl: 24_514_000, createdAt: seededAt, updatedAt: seededAt },
      { id: ids.accounts.admin, userId: ids.users.admin, accountNumber: "FIN-ADMIN-001", name: "Admin Paper Account", cashBalance: 486_200_000, buyingPower: 486_200_000, realizedPnl: 24_514_000, createdAt: seededAt, updatedAt: seededAt },
    ]).onConflictDoUpdate({
      target: tradingAccounts.id,
      set: { userId: sql`excluded.user_id`, name: sql`excluded.name`, status: "active", updatedAt: seededAt },
    });

    await tx.insert(userSettings).values(Object.values(ids.users).map((userId) => ({
      userId,
      theme: "dark" as const,
      tableDensity: "compact" as const,
      quoteCadenceMs: 500,
      performanceTelemetry: true,
      timezone: "Asia/Ho_Chi_Minh",
      preferences: { landingScreen: "dashboard", currency: "VND", paperTradingBanner: true, confirmDestructiveActions: true },
      updatedAt: seededAt,
    }))).onConflictDoUpdate({
      target: userSettings.userId,
      set: { theme: "dark", tableDensity: "compact", quoteCadenceMs: 500, performanceTelemetry: true, preferences: sql`excluded.preferences`, updatedAt: seededAt },
    });

    for (const accountId of Object.values(ids.accounts)) {
      await tx.insert(positions).values(positionRows.map((position) => ({
        accountId,
        ...position,
        realizedPnl: 0,
        updatedAt: seededAt,
      }))).onConflictDoUpdate({
        target: [positions.accountId, positions.instrumentSymbol],
        set: { quantity: sql`excluded.quantity`, averageCost: sql`excluded.average_cost`, updatedAt: seededAt },
      });
    }

    await tx.insert(orders).values([
      { id: ids.orders.open, publicId: "FIN-20260714-1042", accountId: ids.accounts.trader, instrumentSymbol: "FPT", createdByUserId: ids.users.trader, side: "buy", orderType: "limit", status: "open", quantity: 1_000, limitPrice: 126_400, filledQuantity: 0, reservedAmount: 0, submittedAt: new Date("2026-07-14T02:42:18.000Z"), createdAt: seededAt, updatedAt: seededAt },
      { id: ids.orders.partial, publicId: "FIN-20260714-1038", accountId: ids.accounts.trader, instrumentSymbol: "HPG", createdByUserId: ids.users.trader, side: "sell", orderType: "limit", status: "partial", quantity: 500, limitPrice: 31_500, filledQuantity: 200, reservedAmount: 0, submittedAt: new Date("2026-07-14T02:18:42.000Z"), createdAt: seededAt, updatedAt: seededAt },
      { id: ids.orders.filled, publicId: "FIN-20260626-0724", accountId: ids.accounts.trader, instrumentSymbol: "FPT", createdByUserId: ids.users.trader, side: "buy", orderType: "limit", status: "filled", quantity: 800, limitPrice: 109_500, filledQuantity: 800, reservedAmount: 0, submittedAt: new Date("2026-06-26T03:14:22.000Z"), createdAt: seededAt, updatedAt: seededAt },
    ]).onConflictDoNothing({ target: orders.id });

    await tx.insert(executions).values({
      id: ids.execution,
      orderId: ids.orders.filled,
      accountId: ids.accounts.trader,
      instrumentSymbol: "FPT",
      quantity: 800,
      price: 109_500,
      fee: 131_400,
      executedAt: new Date("2026-06-26T03:15:02.000Z"),
    }).onConflictDoNothing({ target: executions.id });

    await tx.insert(cashLedger).values({
      id: ids.ledger,
      accountId: ids.accounts.trader,
      type: "deposit",
      amount: 486_200_000,
      balanceAfter: 486_200_000,
      description: "Deterministic paper-trading opening balance",
      createdAt: seededAt,
    }).onConflictDoNothing({ target: cashLedger.id });

    const actionRows = [
      { id: ids.actions.fpt, reference: "CA-FPT-2026-0714", instrumentSymbol: "FPT", type: "cash_dividend" as const, status: "upcoming" as const, title: "2026 interim dividend", description: "FPT Corporation will pay a simulated interim cash dividend of ₫2,000 per eligible share.", exDate: "2026-07-22", recordDate: "2026-07-23", paymentDate: "2026-08-08", cashAmount: 2_000, requiresResponse: false, source: "MOCK-ISSUER-FPT-0714" },
      { id: ids.actions.vcb, reference: "CA-VCB-2026-0728", instrumentSymbol: "VCB", type: "voting" as const, status: "upcoming" as const, title: "Annual shareholder vote", description: "Simulated annual shareholder voting event for eligible VCB holdings.", exDate: "2026-07-28", recordDate: "2026-07-29", paymentDate: "2026-07-29", cashAmount: null, requiresResponse: true, source: "MOCK-ISSUER-VCB-0728" },
      { id: ids.actions.hpg, reference: "CA-HPG-2026-0804", instrumentSymbol: "HPG", type: "bonus_shares" as const, status: "announced" as const, title: "Bonus shares 10:1", description: "Simulated distribution of one bonus share for every ten eligible HPG shares.", exDate: "2026-08-04", recordDate: "2026-08-05", paymentDate: "2026-08-20", cashAmount: null, ratioNumerator: 1, ratioDenominator: 10, requiresResponse: false, source: "MOCK-ISSUER-HPG-0804" },
      { id: ids.actions.mwg, reference: "CA-MWG-2026-0824", instrumentSymbol: "MWG", type: "stock_dividend" as const, status: "announced" as const, title: "Stock dividend 5%", description: "Simulated five-percent MWG stock dividend.", exDate: "2026-08-24", recordDate: "2026-08-25", paymentDate: "2026-09-15", cashAmount: null, ratioNumerator: 5, ratioDenominator: 100, requiresResponse: false, source: "MOCK-ISSUER-MWG-0824" },
      { id: ids.actions.ssi, reference: "CA-SSI-2026-0811", instrumentSymbol: "SSI", type: "rights_offering" as const, status: "upcoming" as const, title: "Rights offering 5:1", description: "Simulated SSI rights offering for eligible paper-trading positions.", exDate: "2026-08-11", recordDate: "2026-08-12", paymentDate: "2026-08-12", cashAmount: null, ratioNumerator: 1, ratioDenominator: 5, requiresResponse: true, source: "MOCK-ISSUER-SSI-0811" },
      { id: ids.actions.vnm, reference: "CA-VNM-2026-0818", instrumentSymbol: "VNM", type: "cash_dividend" as const, status: "upcoming" as const, title: "Cash dividend ₫2,000", description: "Simulated VNM cash dividend for eligible holdings.", exDate: "2026-08-18", recordDate: "2026-08-19", paymentDate: "2026-09-05", cashAmount: 2_000, requiresResponse: false, source: "MOCK-ISSUER-VNM-0818" },
    ];

    await tx.insert(corporateActions).values(actionRows.map((action) => ({
      ...action,
      currency: "VND",
      taxRateBps: 0,
      createdByUserId: ids.users.admin,
      publishedByUserId: ids.users.admin,
      publishedAt: seededAt,
      createdAt: seededAt,
      updatedAt: seededAt,
    }))).onConflictDoUpdate({
      target: corporateActions.id,
      set: { title: sql`excluded.title`, description: sql`excluded.description`, status: sql`excluded.status`, updatedAt: seededAt },
    });

    await tx.insert(corporateActionResponses).values({
      id: ids.response,
      corporateActionId: ids.actions.vcb,
      accountId: ids.accounts.trader,
      userId: ids.users.trader,
      responseType: "abstain",
      status: "submitted",
      payload: { choice: "abstain" },
      respondedAt: seededAt,
      createdAt: seededAt,
      updatedAt: seededAt,
    }).onConflictDoNothing({ target: corporateActionResponses.id });

    await tx.insert(auditLogs).values({
      id: ids.audit,
      actorUserId: ids.users.admin,
      action: "DATABASE_SEED",
      module: "Persistence",
      resourceType: "database",
      resourceId: "finops",
      outcome: "success",
      origin: "db:seed",
      summary: "Applied deterministic FinOps demo data",
      metadata: { version: 1 },
      createdAt: seededAt,
    }).onConflictDoNothing({ target: auditLogs.id });
  });
}

seed()
  .then(() => console.log("FinOps deterministic seed completed."))
  .catch((error: unknown) => {
    console.error("FinOps seed failed.", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
