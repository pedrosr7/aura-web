import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const section = (readme.match(/^## [^\n]*\/plan[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m) || [])[0] || "";

// What the app reads: shared/.../feature/goal/presentation/PlanLink.kt in the Aura repo.
const PARAMETERS = ["c", "d", "t", "cat", "lvl", "days", "dur", "eq", "hard", "src"];

test("the README has a section for the /plan link, with a table row for each parameter the app reads", () => {
  assert.ok(section.length > 0, "no section about /plan");
  for (const parameter of PARAMETERS) {
    assert.match(section, new RegExp(`^\\| \`${parameter}\` \\|`, "m"), `${parameter} has no row`);
  }
});

test("the README's examples are plan links, and use only the parameters it documents", () => {
  const examples = [...section.matchAll(/https:\/\/aura\.pampaiter\.com\/plan[^\s`)]*/g)].map((match) => match[0]);
  assert.ok(examples.length >= 4, `only ${examples.length} examples`);
  for (const example of examples) {
    const keys = example.split("?")[1]?.split("&").map((pair) => pair.split("=")[0]) ?? [];
    for (const key of keys) assert.ok(PARAMETERS.includes(key), `${example} uses ${key}`);
  }
});

test("the README does not promise the parameter the app dropped", () => {
  assert.ok(!/^\| `int` \|/m.test(section));
  assert.ok(!/[?&]int=/.test(section));
});
