import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { designTokens, nativeTheme, webTheme } from "./index";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(path.join(packageRoot, "src/tokens.css"), "utf8");

describe("MoreAI design token contract", () => {
  it("preserves the approved reference palette", () => {
    assert.equal(designTokens.colors.core.ink, "#171717");
    assert.equal(designTokens.colors.core.canvas, "#F7F4EC");
    assert.equal(designTokens.colors.accent.mint, "#C9F2D5");
    assert.equal(designTokens.colors.dark.surface, "#232522");
  });
  it("exports matching foundations to web and native", () => {
    assert.equal(webTheme.colors.core.ink, nativeTheme.colors.ink);
    assert.equal(webTheme.colors.accent.mint, nativeTheme.colors.accent.mint);
    assert.equal(webTheme.spacing.lg, nativeTheme.spacing.lg);
    assert.equal(webTheme.radius.lg, nativeTheme.radius.lg);
  });
  it("preserves source-specific shadows and interaction timings", () => {
    assert.equal(designTokens.shadow.md, "3.5px 3.5px 0 #171717");
    assert.equal(designTokens.shadow.card, "3.5px 3.5px 0 #171717");
    assert.equal(designTokens.motion.fast, 120);
    assert.equal(designTokens.interaction.mobileTapTargetMin, 44);
  });
  it("publishes matching CSS custom properties", () => {
    assert.match(css, /--moreai-color-ink:\\s*#171717/);
    assert.match(css, /--moreai-color-canvas:\\s*#F7F4EC/);
    assert.match(css, /--moreai-color-mint:\\s*#C9F2D5/);
    assert.match(css, /--moreai-shadow-md:\\s*3\\.5px 3\\.5px 0 #171717/);
  });
});
