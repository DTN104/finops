import assert from "node:assert/strict";
import test from "node:test";

import { dashboardData } from "@/lib/mock-data";

test("dashboard fixtures are deterministic and cover the authored cards", () => {
  assert.equal(dashboardData.metrics.length, 4);
  assert.equal(dashboardData.equityHeights.length, 25);
  assert.deepEqual(dashboardData.watchlist.map((quote) => quote.symbol), ["FPT", "VCB", "HPG", "MWG", "SSI"]);
  assert.deepEqual(dashboardData.holdings.map((holding) => holding.symbol), ["FPT", "VCB", "HPG", "MWG"]);
});
