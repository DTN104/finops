import assert from "node:assert/strict";
import test from "node:test";

import { calculatePortfolio, calculatePosition, initialPositions } from "@/lib/portfolio";

test("portfolio metrics and allocation are calculated from position data", () => {
  const portfolio = calculatePortfolio(initialPositions, 486_200_000, 24_514_000);

  assert.equal(portfolio.positions.length, 6);
  assert.equal(portfolio.marketValue, 798_453_000);
  assert.equal(portfolio.costBasis, 755_547_000);
  assert.equal(portfolio.unrealizedPnl, 42_906_000);
  assert.equal(portfolio.totalReturn, 67_420_000);
  assert.equal(portfolio.netAssetValue, 1_284_653_000);
  assert.ok(Math.abs(portfolio.allocations.reduce((total, allocation) => total + allocation.percent, 0) - 100) < 0.0001);
});

test("position P&L and day movement are derived from quantity and prices", () => {
  const fpt = calculatePosition(initialPositions.FPT);

  assert.equal(fpt.costBasis, 269_040_000);
  assert.equal(fpt.marketValue, 303_360_000);
  assert.equal(fpt.unrealizedPnl, 34_320_000);
  assert.equal(fpt.dayPnl, 6_240_000);
});
