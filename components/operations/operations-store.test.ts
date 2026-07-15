import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import { useAuditStore } from "@/components/operations/audit-store";
import { defaultSettings, useOperationsStore } from "@/components/operations/operations-store";

afterEach(() => {
  useOperationsStore.getState().reset();
  useAuditStore.getState().reset();
});

test("create, publish, role and settings mutations append immutable audit entries", () => {
  const store = useOperationsStore.getState();
  const action = store.saveAction({
    symbol: "FPT",
    title: "Final dividend",
    type: "Cash Dividend",
    currency: "VND",
    exDate: "2026-09-01",
    recordDate: "2026-09-02",
    paymentDate: "2026-09-15",
    amountPerShare: 1_000,
    description: "A deterministic simulated final dividend.",
    sourceReference: "MOCK-FPT-FINAL",
  }, "Sam Rivera");

  assert.equal(store.publishAction(action.id, "Sam Rivera"), true);
  assert.equal(store.updateUserRole("user_018", "admin", "Sam Rivera"), true);
  store.updateSettings({ ...defaultSettings, tableDensity: "comfortable" }, "Sam Rivera");

  const actions = useAuditStore.getState().logs.slice(0, 4).map((log) => log.action);
  assert.deepEqual(actions, ["SETTINGS_UPDATE", "USER_ROLE_UPDATE", "CA_PUBLISH", "CA_CREATE"]);
  assert.equal(useOperationsStore.getState().actions[0]?.status, "UPCOMING");
});

test("corporate action date order is validated", () => {
  assert.throws(() => useOperationsStore.getState().saveAction({
    symbol: "FPT",
    title: "Invalid dates",
    type: "Cash Dividend",
    currency: "VND",
    exDate: "2026-09-03",
    recordDate: "2026-09-02",
    paymentDate: "2026-09-01",
    amountPerShare: 1_000,
    description: "A deliberately invalid simulated dividend.",
    sourceReference: "MOCK-INVALID",
  }, "Sam Rivera"));
  assert.equal(useAuditStore.getState().logs[0]?.action, "ORDER_CREATE");
});
