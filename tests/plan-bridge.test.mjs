import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const PlanBridge = createRequire(import.meta.url)("../assets/js/plan-bridge.js");

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPAD = "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const FULL = "?c=hyrox-madrid&d=2099-03-14&t=HYROX&cat=pro&lvl=intermediate&days=1,3,5&dur=60&eq=box&hard=running,strength&src=catchupheats";

test("the page reads the phone's operating system, and an iPad that poses as a Mac is still an iPad", () => {
  assert.equal(PlanBridge.platformOf(IPHONE, 5), "ios");
  assert.equal(PlanBridge.platformOf(IPAD, 5), "ios");
  assert.equal(PlanBridge.platformOf(MAC, 5), "ios");
  assert.equal(PlanBridge.platformOf(ANDROID, 5), "android");
});

test("a computer is a computer, with or without a touch screen on a PC", () => {
  assert.equal(PlanBridge.platformOf(MAC, 0), "desktop");
  assert.equal(PlanBridge.platformOf(WINDOWS, 0), "desktop");
  assert.equal(PlanBridge.platformOf(WINDOWS, 10), "desktop");
  assert.equal(PlanBridge.platformOf("", undefined), "desktop");
});

test("the phone sees the stores and the computer sees the QR", () => {
  assert.equal(PlanBridge.viewFor("ios"), "stores");
  assert.equal(PlanBridge.viewFor("android"), "stores");
  assert.equal(PlanBridge.viewFor("desktop"), "qr");
});

test("an iPhone gets the App Store first and an Android gets Google Play first", () => {
  const ios = PlanBridge.storesFor("ios");
  const android = PlanBridge.storesFor("android");
  assert.deepEqual(ios.map((store) => store.id), ["appstore", "playstore"]);
  assert.deepEqual(android.map((store) => store.id), ["playstore", "appstore"]);
  assert.equal(ios[0].url, "https://apps.apple.com/us/app/aura-ai-training-coach/id6773849897");
  assert.equal(ios[1].url, "https://play.google.com/store/apps/details?id=com.pampa.aura");
  assert.deepEqual(PlanBridge.storesFor("desktop"), []);
});

test("Spanish when the browser is in Spanish, English for every other language", () => {
  for (const spanish of ["es", "es-ES", "ES-mx", "es-419"]) assert.equal(PlanBridge.languageOf(spanish), "es", spanish);
  for (const other of ["en", "en-US", "pt-BR", "ca-ES", "fr", "", undefined]) assert.equal(PlanBridge.languageOf(other), "en", String(other));
});

test("every text exists in both languages, with the same keys and none of them empty", () => {
  const es = PlanBridge.TEXTS.es;
  const en = PlanBridge.TEXTS.en;
  assert.ok(Object.keys(es).length >= 8, `only ${Object.keys(es).length} texts`);
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  for (const [key, value] of [...Object.entries(es), ...Object.entries(en)]) {
    assert.equal(typeof value, "string", key);
    assert.ok(value.trim().length > 0, `${key} is empty`);
  }
});

test("«already installed» opens the app's own link with the same answers, untouched", () => {
  assert.equal(PlanBridge.reopenLink(FULL), `aura://plan${FULL}`);
  assert.equal(PlanBridge.reopenLink("?days=1%2C3%2C5&hard=&src=x"), "aura://plan?days=1%2C3%2C5&hard=&src=x");
  assert.equal(PlanBridge.reopenLink("?c=a&c=b&LVL=Advanced"), "aura://plan?c=a&c=b&LVL=Advanced");
});

test("a plan page opened with no answers still opens the app, and its QR is the plain link", () => {
  assert.equal(PlanBridge.reopenLink(""), "aura://plan");
  assert.equal(PlanBridge.reopenLink("?"), "aura://plan");
  assert.equal(PlanBridge.webLink(""), "https://aura.pampaiter.com/plan");
  assert.equal(PlanBridge.webLink("?"), "https://aura.pampaiter.com/plan");
});

test("whatever the address carries, the links stay on the app's own scheme and the site's own address", () => {
  for (const odd of ["javascript:alert(1)", "//evil.example/x", "?x=1#frag", "#only-a-fragment", "?a=<b>", " ?a=1"]) {
    assert.ok(PlanBridge.reopenLink(odd).startsWith("aura://plan"), odd);
    assert.ok(PlanBridge.webLink(odd).startsWith("https://aura.pampaiter.com/plan"), odd);
    assert.ok(!PlanBridge.reopenLink(odd).includes("#"), odd);
    assert.ok(!PlanBridge.webLink(odd).includes("#"), odd);
  }
  assert.equal(PlanBridge.reopenLink("?x=1#frag"), "aura://plan?x=1");
  assert.equal(PlanBridge.webLink("?x=1#frag"), "https://aura.pampaiter.com/plan?x=1");
  assert.equal(PlanBridge.reopenLink("javascript:alert(1)"), "aura://plan");
});

test("the QR holds the whole https link with its answers, and is a real QR code", () => {
  const link = PlanBridge.webLink(FULL);
  assert.equal(link, `https://aura.pampaiter.com/plan${FULL}`);
  const matrix = PlanBridge.qrMatrix(link);
  const size = matrix.length;
  assert.ok(size >= 21 && (size - 21) % 4 === 0, `size ${size}`);
  assert.ok(matrix.every((row) => row.length === size));
  const finder = (top, left) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        assert.equal(matrix[top + r][left + c], edge || core, `finder at ${top},${left} cell ${r},${c}`);
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  assert.notDeepEqual(PlanBridge.qrMatrix("https://aura.pampaiter.com/plan?c=a"), matrix);
});
