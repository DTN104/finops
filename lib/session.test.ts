import assert from "node:assert/strict";
import test from "node:test";

import { canManageOperations, demoRoleSchema, getSessionMaxAge } from "@/lib/session";

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

test("remembering a device extends the demo session from 30 minutes to 30 days", () => {
  assert.equal(getSessionMaxAge(false), 30 * 60);
  assert.equal(getSessionMaxAge(true), 30 * 24 * 60 * 60);
});
