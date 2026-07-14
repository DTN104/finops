import assert from "node:assert/strict";
import test from "node:test";

import { getDemoUser } from "@/lib/session";

test("demo roles resolve to distinct deterministic users", () => {
  const trader = getDemoUser("trader");
  const viewer = getDemoUser("viewer");

  assert.equal(trader?.name, "Alex Morgan");
  assert.equal(trader?.roleLabel, "Demo Trader");
  assert.equal(viewer?.name, "Jordan Lee");
  assert.equal(viewer?.roleLabel, "Demo Viewer");
  assert.equal(getDemoUser("admin"), null);
});
