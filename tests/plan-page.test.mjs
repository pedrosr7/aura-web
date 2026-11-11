import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const PlanBridge = createRequire(import.meta.url)("../assets/js/plan-bridge.js");
const page = read("plan.html");
const bridge = read("assets/js/plan-bridge.js");

test("the plan page is not for search engines, and the sitemap does not list it", () => {
  assert.match(page, /<meta\s+name="robots"\s+content="noindex/i);
  assert.ok(!/\/plan/.test(read("sitemap.xml")));
});

test("the page keeps nothing and counts nothing: no cookies, no storage, no requests, no analytics", () => {
  const code = page + bridge;
  for (const forbidden of ["document.cookie", "localStorage", "sessionStorage", "indexedDB", "fetch(", "XMLHttpRequest", "sendBeacon", "umami", "WebSocket"]) {
    assert.ok(!code.includes(forbidden), `the page uses ${forbidden}`);
  }
});

test("the page loads only its own scripts, and the files it names are in the repository", () => {
  const sources = [...page.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(sources.length >= 2, `scripts: ${sources}`);
  for (const source of sources) {
    assert.ok(source.startsWith("/assets/"), `${source} is not the site's own`);
    assert.ok(existsSync(new URL(`..${source}`, import.meta.url)), `${source} is missing`);
  }
});

test("every text the page asks for exists in both languages", () => {
  const keys = [...page.matchAll(/data-i18n="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(new Set(keys).size >= 5, `keys: ${keys}`);
  for (const key of keys) {
    assert.ok(PlanBridge.TEXTS.es[key], `${key} is missing in Spanish`);
    assert.ok(PlanBridge.TEXTS.en[key], `${key} is missing in English`);
  }
});
