import assert from "node:assert/strict";
import test from "node:test";

import { applyPerformanceTick, createPerformanceRows, PERFORMANCE_ROW_COUNT, PERFORMANCE_UPDATES_PER_TICK } from "./performance-lab";

test("performance ticks are deterministic and preserve unchanged row identities", () => {
  const rows = createPerformanceRows();
  const updated = applyPerformanceTick(rows, 7);
  const repeated = applyPerformanceTick(rows, 7);
  const changed = updated.filter((row, index) => row !== rows[index]);

  assert.equal(rows.length, PERFORMANCE_ROW_COUNT);
  assert.equal(changed.length, PERFORMANCE_UPDATES_PER_TICK);
  assert.deepEqual(updated, repeated);
});
