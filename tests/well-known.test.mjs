import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const aasa = JSON.parse(readFileSync(new URL("../.well-known/apple-app-site-association", import.meta.url), "utf8"));
const block = aasa.applinks.details[0];
const paths = block.components.map((component) => component["/"]);

test("the iPhone opens /plan in the app, for prod, staging and dev", () => {
  assert.deepEqual(block.appIDs, [
    "2RJBN4MWS8.com.pampa.aura.ios",
    "2RJBN4MWS8.com.pampa.aura.ios.staging",
    "2RJBN4MWS8.com.pampa.aura.ios.dev",
  ]);
  assert.ok(paths.includes("/plan"), `the paths are ${paths}`);
});

test("opening /plan in the app leaves the share and team links as they were", () => {
  assert.ok(paths.includes("/share/*"));
  assert.ok(paths.includes("/team/*"));
  assert.equal(aasa.applinks.details.length, 1);
});
