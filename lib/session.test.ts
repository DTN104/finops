import assert from "node:assert/strict";
import test from "node:test";

import { canManageOperations, getDemoUser } from "@/lib/session";

test("demo roles resolve to distinct deterministic users", () => {
  const trader = getDemoUser("trader");
  const viewer = getDemoUser("viewer");
  const admin = getDemoUser("admin");

  assert.equal(trader?.name, "Alex Morgan");
  assert.equal(trader?.roleLabel, "Demo Trader");
  assert.equal(viewer?.name, "Jordan Lee");
  assert.equal(viewer?.roleLabel, "Demo Viewer");
  assert.equal(admin?.name, "Sam Rivera");
  assert.equal(admin?.roleLabel, "Demo Admin");
  assert.equal(getDemoUser("owner"), null);
});

test("only Admin can manage operational data", () => {
  assert.equal(canManageOperations("viewer"), false);
  assert.equal(canManageOperations("trader"), false);
  assert.equal(canManageOperations("admin"), true);
});
