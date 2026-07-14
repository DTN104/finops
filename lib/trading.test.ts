import assert from "node:assert/strict";
import test from "node:test";

import { canPlaceOrders, estimateOrder, validateOrder } from "@/lib/trading";

const context = {
  role: "trader" as const,
  buyingPower: 486_200_000,
  positionQuantity: 2_400,
  averageCost: 112_100,
};

const validBuy = {
  symbol: "FPT",
  side: "buy",
  quantity: 1_000,
  limitPrice: 126_400,
  orderType: "LIMIT",
} as const;

test("only Trader and Admin roles can place mock orders", () => {
  assert.equal(canPlaceOrders("viewer"), false);
  assert.equal(canPlaceOrders("trader"), true);
  assert.equal(canPlaceOrders("admin"), true);

  const viewerResult = validateOrder(validBuy, { ...context, role: "viewer" });
  assert.equal(viewerResult.success, false);
  if (!viewerResult.success) {
    assert.ok(viewerResult.issues.some((issue) => issue.code === "permission"));
  }

  assert.equal(validateOrder(validBuy, context).success, true);
  assert.equal(validateOrder(validBuy, { ...context, role: "admin" }).success, true);
});

test("buy estimate applies the deterministic 0.15% fee", () => {
  const estimate = estimateOrder(validBuy, context);
  assert.equal(estimate.gross, 126_400_000);
  assert.equal(estimate.fee, 189_600);
  assert.equal(estimate.total, 126_589_600);
  assert.equal(estimate.buyingPowerAfter, 359_610_400);
});

test("quantity and price must use valid positive trading lots and ticks", () => {
  const invalidQuantity = validateOrder({ ...validBuy, quantity: 150 }, context);
  assert.equal(invalidQuantity.success, false);
  if (!invalidQuantity.success) {
    assert.ok(invalidQuantity.issues.some((issue) => issue.code === "quantity"));
  }

  const invalidPrice = validateOrder({ ...validBuy, limitPrice: 126_450 }, context);
  assert.equal(invalidPrice.success, false);
  if (!invalidPrice.success) {
    assert.ok(invalidPrice.issues.some((issue) => issue.code === "price"));
  }
});

test("buy orders cannot exceed available buying power", () => {
  const result = validateOrder(validBuy, { ...context, buyingPower: 100_000_000 });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.issues.some((issue) => issue.code === "buying_power"));
  }
});

test("sell orders cannot exceed the available position", () => {
  const result = validateOrder({ ...validBuy, side: "sell", quantity: 2_500 }, context);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.issues.some((issue) => issue.code === "position"));
  }
});

test("sell estimate reports proceeds, remaining position and realized P&L", () => {
  const estimate = estimateOrder({ side: "sell", quantity: 800, limitPrice: 126_300 }, context);
  assert.equal(estimate.gross, 101_040_000);
  assert.equal(estimate.fee, 151_560);
  assert.equal(estimate.proceeds, 100_888_440);
  assert.equal(estimate.positionRemaining, 1_600);
  assert.equal(estimate.realizedPnl, 11_360_000);
});
