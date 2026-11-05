import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tokens = JSON.parse(readFileSync(new URL("../tokens.json", import.meta.url), "utf8"));
const tokenCss = readFileSync(new URL("../src/tokens.css", import.meta.url), "utf8");

function luminance(hex) {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

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
  assert.ok(tokenCss.includes("--moreai-color-ink: #171717"));
  assert.ok(tokenCss.includes("--moreai-color-canvas: #F7F4EC"));
  assert.ok(tokenCss.includes("--moreai-color-mint: #C9F2D5"));
  assert.ok(tokenCss.includes("--moreai-shadow-md: 3.5px 3.5px 0 #171717"));
});

test("semantic text and surface pairs meet WCAG AA normal-text contrast", () => {
  for (const [name, pair] of Object.entries(tokens.colors.semantic)) {
    assert.ok(
      contrastRatio(pair.foreground, pair.background) >= 4.5,
      `${name} contrast is below 4.5:1`
    );
  }
  assert.ok(contrastRatio(tokens.colors.core.ink, tokens.colors.core.canvas) >= 4.5);
  assert.ok(contrastRatio(tokens.colors.dark.text, tokens.colors.dark.background) >= 4.5);
});

test("all web surfaces import shared tokens and support keyboard/reduced motion", () => {
  for (const surface of ["web", "admin", "partner-portal", "captive-portal"]) {
    const css = readFileSync(
      new URL(`../../../apps/${surface}/src/app/globals.css`, import.meta.url),
      "utf8"
    );
    assert.ok(css.includes("packages/design-tokens/src/tokens.css"), `${surface} token import missing`);
    assert.ok(css.includes(":focus-visible"), `${surface} focus-visible style missing`);
    assert.ok(css.includes("prefers-reduced-motion: reduce"), `${surface} reduced-motion support missing`);
  }
});
