import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const PlanBridge = createRequire(import.meta.url)("../assets/js/plan-bridge.js");

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";

const SEARCH = "?c=hyrox-madrid&d=2026-12-05&t=HYROX&cat=pro&lvl=intermediate&days=1%2C3%2C5&dur=60&eq=box&hard=&src=catchupheats";
const APP_STORE = "https://apps.apple.com/us/app/aura-ai-training-coach/id6773849897";
const GOOGLE_PLAY = "https://play.google.com/store/apps/details?id=com.pampa.aura";
const TEXT_KEYS = ["label", "titleStores", "subStores", "titleQr", "subQr", "installedHint", "reopen"];

class Element {
  constructor(hidden = false) {
    this.hidden = hidden;
    this.textContent = "";
    this.attributes = {};
    this.children = [];
  }

  setAttribute(name, value) { this.attributes[name] = String(value); }

  getAttribute(name) { return name in this.attributes ? this.attributes[name] : null; }

  appendChild(child) { this.children.push(child); return child; }
}

// The page's elements by id, as plan.html declares them: the two views start hidden.
function pageWith() {
  const ids = ["stores", "store-first", "store-second", "reopen", "reopen-box", "qr", "qr-code"];
  const byId = Object.fromEntries(ids.map((id) => [id, new Element(id === "stores" || id === "qr")]));
  const texts = TEXT_KEYS.map((key) => { const element = new Element(); element.setAttribute("data-i18n", key); return element; });
  return {
    byId,
    texts,
    documentElement: { lang: "es" },
    getElementById: (id) => byId[id],
    querySelectorAll: () => texts,
    createElementNS: () => new Element(),
  };
}

const rendered = (environment) => {
  const page = pageWith();
  PlanBridge.render(page, { search: SEARCH, maxTouchPoints: 0, language: "es-ES", ...environment });
  return page;
};

test("an iPhone in English gets the App Store first and the answers on «already installed»", () => {
  const page = rendered({ userAgent: IPHONE, maxTouchPoints: 5, language: "en-US" });
  const en = PlanBridge.TEXTS.en;
  assert.equal(page.byId.stores.hidden, false);
  assert.equal(page.byId.qr.hidden, true);
  assert.equal(page.byId["store-first"].getAttribute("href"), APP_STORE);
  assert.equal(page.byId["store-first"].textContent, en.appStore);
  assert.equal(page.byId["store-second"].getAttribute("href"), GOOGLE_PLAY);
  assert.equal(page.byId["store-second"].textContent, en.playStore);
  assert.equal(page.byId.reopen.getAttribute("href"), `aura://plan${SEARCH}`);
  assert.equal(page.byId["reopen-box"].hidden, false);
  assert.equal(page.documentElement.lang, "en");
  assert.deepEqual(page.texts.map((element) => element.textContent), TEXT_KEYS.map((key) => en[key]));
});

test("an Android in Spanish gets Google Play first and the same answers on «already installed»", () => {
  const page = rendered({ userAgent: ANDROID, maxTouchPoints: 5 });
  const es = PlanBridge.TEXTS.es;
  assert.equal(page.byId["store-first"].getAttribute("href"), GOOGLE_PLAY);
  assert.equal(page.byId["store-first"].textContent, es.playStore);
  assert.equal(page.byId["store-second"].getAttribute("href"), APP_STORE);
  assert.equal(page.byId.reopen.getAttribute("href"), `aura://plan${SEARCH}`);
  assert.equal(page.documentElement.lang, "es");
  assert.deepEqual(page.texts.map((element) => element.textContent), TEXT_KEYS.map((key) => es[key]));
});

test("a computer gets the QR of the whole https link, and no stores", () => {
  const page = rendered({ userAgent: MAC });
  const matrix = PlanBridge.qrMatrix(`https://aura.pampaiter.com/plan${SEARCH}`);
  const [svg] = page.byId["qr-code"].children;
  assert.equal(page.byId.qr.hidden, false);
  assert.equal(page.byId.stores.hidden, true);
  assert.equal(page.byId["qr-code"].children.length, 1);
  assert.equal(svg.getAttribute("viewBox"), `0 0 ${matrix.length + 8} ${matrix.length + 8}`);
  assert.equal(svg.getAttribute("aria-label"), PlanBridge.TEXTS.es.qrLabel);
  assert.equal(svg.children[1].getAttribute("d"), PlanBridge.qrPath(matrix, 4));
  assert.ok(svg.children[1].getAttribute("d").length > 100);
});

test("a computer that opened /plan with no answers gets the QR of the plain link", () => {
  const page = rendered({ userAgent: MAC, search: "" });
  const plain = PlanBridge.qrPath(PlanBridge.qrMatrix("https://aura.pampaiter.com/plan"), 4);
  assert.equal(page.byId["qr-code"].children[0].children[1].getAttribute("d"), plain);
});

test("a computer with a link too long for a scannable QR gets the stores, with no «already installed»", () => {
  const page = rendered({ userAgent: MAC, search: `?x=${"a".repeat(1000)}` });
  assert.equal(page.byId.stores.hidden, false);
  assert.equal(page.byId.qr.hidden, true);
  assert.equal(page.byId["qr-code"].children.length, 0);
  assert.equal(page.byId["store-first"].getAttribute("href"), APP_STORE);
  assert.equal(page.byId["reopen-box"].hidden, true);
});

test("the page hands the browser's own values to render, as they are", () => {
  const page = readFileSync(new URL("../plan.html", import.meta.url), "utf8");
  const call = /PlanBridge\.render\(\s*document,\s*\{\s*search:\s*location\.search,\s*userAgent:\s*navigator\.userAgent,\s*maxTouchPoints:\s*navigator\.maxTouchPoints,\s*language:\s*navigator\.language,?\s*\}\s*\)/;
  assert.match(page, call);
});

test("the page sends no more than its origin to the font service, and has no link preview in one language only", () => {
  const page = readFileSync(new URL("../plan.html", import.meta.url), "utf8");
  assert.match(page, /<meta\s+name="referrer"\s+content="(strict-origin|no-referrer)"/);
  assert.ok(!/property="og:|name="twitter:/.test(page), "the page still carries preview tags");
});
