import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tokens = JSON.parse(readFileSync(new URL("../tokens.json", import.meta.url), "utf8"));
const css = readFileSync(new URL("../src/tokens.css", import.meta.url), "utf8");

test("canonical palette preserves MoreAI source colors", () => {
  assert.equal(tokens.colors.core.ink, "#171717");
  assert.equal(tokens.colors.core.canvas, "#F7F4EC");
  assert.equal(tokens.colors.accent.mint, "#C9F2D5");
  assert.equal(tokens.colors.dark.surface, "#232522");
});

test("native and web foundations share spacing and radius scales", () => {
  assert.equal(tokens.spacing.lg, 16);
  assert.equal(tokens.radius.lg, 16);
  assert.equal(tokens.interaction.mobileTapTargetMin, 44);
});

test("reference-specific shadow measurements remain unchanged", () => {
  assert.equal(tokens.shadow.md, "3.5px 3.5px 0 #171717");
  assert.equal(tokens.shadow.card, "3.5px 3.5px 0 #171717");
  assert.equal(tokens.shadow.button, "3px 3px 0 #171717");
});

test("CSS variables publish core source values", () => {
  assert.ok(css.includes("--moreai-color-ink: #171717"));
  assert.ok(css.includes("--moreai-color-canvas: #F7F4EC"));
  assert.ok(css.includes("--moreai-color-mint: #C9F2D5"));
  assert.ok(css.includes("--moreai-shadow-md: 3.5px 3.5px 0 #171717"));
});
