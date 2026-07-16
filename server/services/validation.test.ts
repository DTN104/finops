import assert from "node:assert/strict";
import test from "node:test";

import { corporateActionInputSchema, settingsInputSchema } from "@/server/services/operations.service";
import { placeOrderInputSchema } from "@/server/services/trading.service";

test("order persistence input enforces exchange lots and ticks", () => {
  const valid = placeOrderInputSchema.safeParse({
    accountId: "10000000-0000-4000-8000-000000000002",
    symbol: "FPT",
    side: "buy",
    quantity: 100,
    limitPrice: 126_400,
  });
  assert.equal(valid.success, true);
  assert.equal(placeOrderInputSchema.safeParse({ ...valid.data, quantity: 50 }).success, false);
  assert.equal(placeOrderInputSchema.safeParse({ ...valid.data, limitPrice: 126_450 }).success, false);
});

test("corporate action persistence validates date order", () => {
  const input = {
    reference: "CA-FPT-TEST",
    symbol: "FPT",
    type: "cash_dividend" as const,
    title: "Test dividend",
    description: "Deterministic corporate action test description.",
    exDate: "2026-08-02",
    recordDate: "2026-08-01",
    paymentDate: "2026-08-10",
    source: "TEST-SOURCE",
  };
  assert.equal(corporateActionInputSchema.safeParse(input).success, false);
  assert.equal(corporateActionInputSchema.safeParse({ ...input, recordDate: "2026-08-03" }).success, true);
});

test("settings persistence rejects unsupported realtime cadence", () => {
  const input = {
    theme: "dark" as const,
    tableDensity: "compact" as const,
    quoteCadenceMs: 500,
    performanceTelemetry: true,
    timezone: "Asia/Ho_Chi_Minh",
    preferences: {},
  };
  assert.equal(settingsInputSchema.safeParse(input).success, true);
  assert.equal(settingsInputSchema.safeParse({ ...input, quoteCadenceMs: 50 }).success, false);
});
