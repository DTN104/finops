import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import { usePortfolioStore } from "@/components/trading/portfolio-store";

const buyDraft = { symbol: "FPT", side: "buy", quantity: 100, limitPrice: 126_400, orderType: "LIMIT" } as const;
const sellDraft = { symbol: "FPT", side: "sell", quantity: 100, limitPrice: 126_300, orderType: "LIMIT" } as const;

afterEach(() => usePortfolioStore.getState().reset());

test("submitted orders are added to shared state and a buy fill updates the portfolio", () => {
  usePortfolioStore.getState().reset();
  const before = usePortfolioStore.getState();
  const order = before.submitOrder(buyDraft, "trader", "Alex Morgan");
  const submitted = usePortfolioStore.getState();

  assert.equal(submitted.orders[0]?.id, order.id);
  assert.equal(submitted.orders[0]?.status, "OPEN");
  assert.ok(submitted.buyingPower < before.buyingPower);
  assert.equal(submitted.fillOrder(order.id), true);

  const filled = usePortfolioStore.getState();
  assert.equal(filled.orders[0]?.status, "FILLED");
  assert.equal(filled.orders[0]?.filledQuantity, 100);
  assert.equal(filled.positions.FPT.quantity, 2_500);
  assert.ok(filled.positions.FPT.averageCost > 112_100);
  assert.ok(filled.cashBalance < before.cashBalance);
  assert.equal(filled.fillOrder(order.id), false);
  assert.equal(filled.cancelOrder(order.id, "trader", "Alex Morgan"), false);
});

test("cancelling an open buy refunds reserved buying power exactly once", () => {
  usePortfolioStore.getState().reset();
  const startingPower = usePortfolioStore.getState().buyingPower;
  const order = usePortfolioStore.getState().submitOrder(buyDraft, "trader", "Alex Morgan");

  assert.equal(usePortfolioStore.getState().cancelOrder(order.id, "trader", "Alex Morgan"), true);
  const cancelled = usePortfolioStore.getState();
  assert.equal(cancelled.orders[0]?.status, "CANCELLED");
  assert.equal(cancelled.buyingPower, startingPower);
  assert.equal(cancelled.cancelOrder(order.id, "trader", "Alex Morgan"), false);
  assert.equal(cancelled.fillOrder(order.id), false);
});

test("a filled sell reduces the position and adds net proceeds and realized P&L", () => {
  usePortfolioStore.getState().reset();
  const before = usePortfolioStore.getState();
  const order = before.submitOrder(sellDraft, "trader", "Alex Morgan");
  assert.equal(usePortfolioStore.getState().fillOrder(order.id), true);

  const filled = usePortfolioStore.getState();
  assert.equal(filled.positions.FPT.quantity, 2_300);
  assert.equal(filled.cashBalance - before.cashBalance, 12_611_055);
  assert.equal(filled.buyingPower - before.buyingPower, 12_611_055);
  assert.equal(filled.realizedPnl - before.realizedPnl, 1_420_000);
});

test("Trader ownership and terminal status rules protect cancellation", () => {
  usePortfolioStore.getState().reset();
  const order = usePortfolioStore.getState().submitOrder(buyDraft, "admin", "Sam Rivera");

  assert.equal(usePortfolioStore.getState().cancelOrder(order.id, "trader", "Alex Morgan"), false);
  assert.equal(usePortfolioStore.getState().cancelOrder(order.id, "admin", "Sam Rivera"), true);
  assert.equal(usePortfolioStore.getState().cancelOrder(order.id, "admin", "Sam Rivera"), false);
});
