import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokenPath = path.join(root, "tokens.json");
const outputPath = path.join(root, "src/tokens.css");

const kebab = (value) => value.replace(/([a-z])([0-9])/g, "$1-$2").replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export function generateCss(tokens) {
  const c = tokens.colors;
  const s = tokens.spacing;
  const r = tokens.radius;
  const b = tokens.border;
  const sh = tokens.shadow;
  const m = tokens.motion;
  const t = tokens.typography;
  const i = tokens.interaction;
  const lines = [
    "/* Generated from packages/design-tokens/tokens.json. Do not edit by hand. */",
    ":root {",
    `  --moreai-color-ink: ${c.core.ink};`,
    `  --moreai-color-shadow: ${c.core.ink};`,
    `  --moreai-color-canvas: ${c.core.canvas};`,
    `  --moreai-color-white: ${c.core.white};`,
    `  --moreai-color-charcoal: ${c.core.charcoal};`,
    `  --moreai-color-muted: ${c.core.muted};`,
    `  --moreai-color-gray-300: ${c.core.gray300};`,
    `  --moreai-color-gray-200: ${c.core.gray200};`,
    `  --moreai-color-gray-100: ${c.core.gray100};`,
    `  --moreai-color-mint: ${c.accent.mint};`,
    `  --moreai-color-lavender: ${c.accent.lavender};`,
    `  --moreai-color-pink: ${c.accent.pink};`,
    `  --moreai-color-butter: ${c.accent.butter};`,
    `  --moreai-color-sky: ${c.accent.sky};`,
    `  --moreai-color-peach: ${c.accent.peach};`,
    `  --moreai-color-success: ${c.semantic.success.foreground};`,
    `  --moreai-color-success-contrast: ${c.semantic.success.contrastForeground};`,
    `  --moreai-surface-success: ${c.semantic.success.background};`,
    `  --moreai-color-warning: ${c.semantic.warning.foreground};`,
    `  --moreai-surface-warning: ${c.semantic.warning.background};`,
    `  --moreai-color-danger: ${c.semantic.danger.foreground};`,
    `  --moreai-surface-danger: ${c.semantic.danger.background};`,
    `  --moreai-color-info: ${c.semantic.info.foreground};`,
    `  --moreai-surface-info: ${c.semantic.info.background};`,
    `  --moreai-font-sans: ${t.fontFamily.sans};`,
    `  --moreai-font-data: ${t.fontFamily.data};`,
    `  --moreai-font-mono: ${t.fontFamily.mono};`,
    ...Object.entries(s).map(([key, value]) => `  --moreai-space-${key}: ${value}px;`),
    ...Object.entries(t.scale).map(([key, value]) => `  --moreai-font-size-${kebab(key)}: ${value}px;`),
    ...Object.entries(t.weight).map(([key, value]) => `  --moreai-font-weight-${kebab(key)}: ${value};`),
    ...Object.entries(r).map(([key, value]) => `  --moreai-radius-${key}: ${value}px;`),
    `  --moreai-border-subtle: ${b.subtle}px;`,
    `  --moreai-border-standard: ${b.standard}px;`,
    `  --moreai-border-featured: ${b.featured}px;`,
    `  --moreai-shadow-sm: ${sh.sm};`,
    `  --moreai-shadow-md: ${sh.md};`,
    `  --moreai-shadow-lg: ${sh.lg};`,
    `  --moreai-shadow-xl: ${sh.xl};`,
    `  --moreai-shadow-card: ${sh.card};`,
    `  --moreai-shadow-button: ${sh.button};`,
    `  --moreai-motion-fast: ${m.fast}ms;`,
    `  --moreai-motion-standard: ${m.standard}ms;`,
    `  --moreai-motion-emphasis: ${m.emphasis}ms;`,
    `  --moreai-motion-card: ${m.sourceCardTransition}ms;`,
    `  --moreai-button-height-desktop-min: ${Math.min(...i.desktopButtonHeights)}px;`,
    `  --moreai-button-height-desktop-max: ${Math.max(...i.desktopButtonHeights)}px;`,
    `  --moreai-button-height-compact: ${i.compactButtonHeight}px;`,
    `  --moreai-target-mobile-min: ${i.mobileTapTargetMin}px;`,
    `  --moreai-input-height-min: ${i.inputHeightMin}px;`,
    `  --moreai-input-height-max: ${i.inputHeightMax}px;`,
    "}",
    ".dark {",
    `  --moreai-color-canvas: ${c.dark.background};`,
    `  --moreai-color-shadow: ${c.dark.shadow};`,
    `  --moreai-color-surface: ${c.dark.surface};`,
    `  --moreai-color-surface-raised: ${c.dark.surfaceRaised};`,
    `  --moreai-color-text: ${c.dark.text};`,
    `  --moreai-color-muted: ${c.dark.muted};`,
    `  --moreai-color-border: ${c.dark.border};`,
    `  --moreai-color-card-border: ${c.dark.cardBorder};`,
    `  --moreai-shadow-card: ${sh.darkCard};`,
    `  --moreai-shadow-button: ${sh.darkButton};`,
    "}",
    ""
  ];
  return lines.join("\n");
}

const expected = generateCss(JSON.parse(readFileSync(tokenPath, "utf8")));
if (process.argv.includes("--check")) {
  const actual = readFileSync(outputPath, "utf8");
  if (actual !== expected) {
    console.error("Design token CSS is out of date. Run pnpm --filter @moreai/design-tokens tokens:generate.");
    process.exitCode = 1;
  } else {
    console.log("Design token CSS matches tokens.json.");
  }
} else {
  writeFileSync(outputPath, expected);
  console.log("Generated packages/design-tokens/src/tokens.css.");
}
