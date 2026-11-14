import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const PlanBridge = createRequire(import.meta.url)("../assets/js/plan-bridge.js");

const ANDROID_TABLET_AS_COMPUTER = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const LINUX_PC = ANDROID_TABLET_AS_COMPUTER;
const CHROMEBOOK = "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

test("an Android tablet, or a phone asked for the desktop site, still gets the stores", () => {
  assert.equal(PlanBridge.platformOf(ANDROID_TABLET_AS_COMPUTER, 5), "android");
});

test("a Linux computer without a touch screen, and a Chromebook, are computers", () => {
  assert.equal(PlanBridge.platformOf(LINUX_PC, 0), "desktop");
  assert.equal(PlanBridge.platformOf(CHROMEBOOK, 10), "desktop");
});

test("a link long enough to make a QR code too dense to scan from a screen gives no QR", () => {
  assert.equal(PlanBridge.qrMatrix(PlanBridge.webLink(`?x=${"a".repeat(1000)}`)), null);
});

test("a link with a few tracking parameters on top of the answers still gets its QR", () => {
  const search = "?c=hyrox-madrid&lvl=advanced&days=1,3,5&dur=60&eq=box&src=catchupheats&utm_source=instagram&utm_medium=story&utm_campaign=hyrox";
  assert.notEqual(PlanBridge.qrMatrix(PlanBridge.webLink(search)), null);
});
