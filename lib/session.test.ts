import assert from "node:assert/strict";
import test from "node:test";

import { canManageOperations, demoRoleSchema } from "@/lib/session";

test("demo role validation accepts only persisted role codes", () => {
  assert.equal(demoRoleSchema.parse("trader"), "trader");
  assert.equal(demoRoleSchema.parse("viewer"), "viewer");
  assert.equal(demoRoleSchema.parse("admin"), "admin");
  assert.equal(demoRoleSchema.safeParse("owner").success, false);
});

test("only Admin can manage operational data", () => {
  assert.equal(canManageOperations("viewer"), false);
  assert.equal(canManageOperations("trader"), false);
  assert.equal(canManageOperations("admin"), true);
});
