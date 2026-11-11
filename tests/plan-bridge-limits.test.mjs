import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const PlanBridge = createRequire(import.meta.url)("../assets/js/plan-bridge.js");

test("a link too long for a QR code gives no matrix, so the page can fall back to the stores", () => {
  assert.equal(PlanBridge.qrMatrix(PlanBridge.webLink(`?x=${"a".repeat(4000)}`)), null);
});

test("a link with no answers still makes a QR code", () => {
  assert.notEqual(PlanBridge.qrMatrix(PlanBridge.webLink("")), null);
});
