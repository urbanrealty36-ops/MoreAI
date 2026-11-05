import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../../../", import.meta.url);
const tokens = JSON.parse(readFileSync(new URL("../tokens.json", import.meta.url), "utf8"));
const tokenCss = readFileSync(new URL("../src/tokens.css", import.meta.url), "utf8");
const sourceCss = readFileSync(new URL("../../../vendor/reference-ui/app/globals.css", import.meta.url), "utf8");

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

test("canonical palette and dark surfaces match MoreAI design tokens", () => {
  assert.equal(tokens.colors.core.ink, "#171717");
  assert.equal(tokens.colors.core.canvas, "#F7F4EC");
  assert.equal(tokens.colors.core.white, "#FFFFFF");
  assert.equal(tokens.colors.accent.mint, "#C9F2D5");
  assert.equal(tokens.colors.accent.lavender, "#D9D5FF");
  assert.equal(tokens.colors.dark.background, "#171817");
  assert.equal(tokens.colors.dark.surface, "#232522");
});

test("native and web foundations share spacing, radius, border and motion scales", () => {
  assert.equal(tokens.spacing.base, 4);
  assert.equal(tokens.spacing.lg, 16);
  assert.equal(tokens.radius.lg, 16);
  assert.equal(tokens.border.standard, 2);
  assert.equal(tokens.interaction.mobileTapTargetMin, 44);
  assert.equal(tokens.motion.fast, 120);
  assert.equal(tokens.motion.standard, 180);
  assert.equal(tokens.motion.emphasis, 260);
});

test("pinned UI shadow and component measurements are preserved", () => {
  assert.equal(tokens.shadow.sm, "2px 2px 0 #171717");
  assert.equal(tokens.shadow.md, "3.5px 3.5px 0 #171717");
  assert.equal(tokens.shadow.lg, "5px 5px 0 #171717");
  assert.equal(tokens.shadow.xl, "7px 7px 0 #171717");
  assert.equal(tokens.shadow.card, "3.5px 3.5px 0 #171717");
  assert.equal(tokens.shadow.button, "3px 3px 0 #171717");
  assert.match(sourceCss, /\.neo-shadow\s*\{\s*box-shadow:\s*3\.5px 3\.5px 0px #171717/);
  assert.match(sourceCss, /\.neo-card\s*\{[^}]*box-shadow:\s*3\.5px 3\.5px 0px #171717/s);
  assert.match(sourceCss, /\.neo-btn\s*\{[^}]*box-shadow:\s*3px 3px 0px #171717/s);
});

test("CSS variables publish canonical token values", () => {
  assert.ok(tokenCss.includes("--moreai-color-ink: #171717"));
  assert.ok(tokenCss.includes("--moreai-color-canvas: #F7F4EC"));
  assert.ok(tokenCss.includes("--moreai-color-mint: #C9F2D5"));
  assert.ok(tokenCss.includes("--moreai-shadow-md: 3.5px 3.5px 0 #171717"));
  assert.ok(tokenCss.includes("--moreai-shadow-button: 3px 3px 0 #171717"));
  assert.ok(tokenCss.includes("--moreai-font-size-display-xl: 48px"));
  assert.ok(tokenCss.includes("--moreai-font-size-heading-1: 28px"));
  assert.ok(tokenCss.includes("--moreai-font-weight-extrabold: 800"));
  assert.ok(tokenCss.includes("--moreai-motion-card: 150ms"));
  assert.ok(tokenCss.includes("--moreai-target-mobile-min: 44px"));
  assert.ok(!tokenCss.includes("color-scheme:"), "source CSS must not change native control rendering");
});

test("semantic foreground/background pairs meet WCAG AA normal-text contrast", () => {
  for (const [name, pair] of Object.entries(tokens.colors.semantic)) {
    assert.ok(
      contrastRatio(pair.foreground, pair.background) >= 4.5,
      `${name} contrast is below 4.5:1`
    );
  }
  assert.ok(contrastRatio(tokens.colors.core.ink, tokens.colors.core.canvas) >= 4.5);
  assert.ok(contrastRatio(tokens.colors.dark.text, tokens.colors.dark.background) >= 4.5);
});

test("dark ink remains readable on every pastel accent surface", () => {
  for (const [name, surface] of Object.entries(tokens.colors.accent)) {
    assert.ok(
      contrastRatio(tokens.colors.core.ink, surface) >= 4.5,
      `ink on ${name} is below 4.5:1`
    );
  }
});

test("all web surfaces consume shared tokens and accessible focus/motion foundations", () => {
  for (const surface of ["web", "admin", "partner-portal", "captive-portal"]) {
    const css = readFileSync(
      new URL(`../../../apps/${surface}/src/app/globals.css`, import.meta.url),
      "utf8"
    );
    const layout = readFileSync(
      new URL(`../../../apps/${surface}/src/app/layout.tsx`, import.meta.url),
      "utf8"
    );

    assert.ok(css.includes("packages/design-tokens/src/tokens.css"), `${surface} token import missing`);
    assert.ok(css.includes(":focus-visible"), `${surface} focus-visible style missing`);
    assert.ok(css.includes("prefers-reduced-motion: reduce"), `${surface} reduced-motion support missing`);
    assert.equal((css.match(/:focus-visible/g) ?? []).length, 1, `${surface} has duplicate focus rules`);
    assert.equal((css.match(/prefers-reduced-motion: reduce/g) ?? []).length, 1, `${surface} has duplicate motion rules`);
    assert.ok(layout.includes("Plus_Jakarta_Sans"), `${surface} Plus Jakarta Sans font missing`);
    assert.ok(layout.includes("JetBrains_Mono"), `${surface} JetBrains Mono font missing`);
    assert.ok(!/userScalable:\s*false|max(imum)?Scale:\s*1/.test(layout), `${surface} disables browser zoom`);
    assert.ok(!css.includes("@import url("), `${surface} uses an unbundled external CSS font import`);
  }
});

test("native Expo uses shared token aliases and pinned licensed font sources", () => {
  const nativeLayout = readFileSync(new URL("../../../apps/mobile/app/_layout.tsx", import.meta.url), "utf8");
  const nativeScreen = readFileSync(new URL("../../../apps/mobile/app/index.tsx", import.meta.url), "utf8");
  const nativePackage = JSON.parse(readFileSync(new URL("../../../apps/mobile/package.json", import.meta.url), "utf8"));
  const fontLicense = readFileSync(new URL("../../../apps/mobile/assets/fonts/OFL.txt", import.meta.url), "utf8");
  const fontReadme = readFileSync(new URL("../../../apps/mobile/assets/fonts/README.md", import.meta.url), "utf8");

  assert.ok(nativePackage.dependencies["expo-font"], "expo-font must be a direct mobile dependency");
  const fontDownloader = readFileSync(new URL("../../../apps/mobile/scripts/download-fonts.mjs", import.meta.url), "utf8");
  assert.ok(nativeLayout.includes("useFonts"), "native root must load the brand fonts");
  assert.ok(nativeLayout.includes('require("../assets/fonts/PlusJakartaSans.ttf")'));
  assert.ok(nativeLayout.includes('require("../assets/fonts/JetBrainsMono.ttf")'));
  assert.ok(fontDownloader.includes("fbe81817505e8aeadc53cc7a38a2b76fb57c333e"), "native font source must be pinned");
  assert.ok(fontDownloader.includes("0cb13a998ed525ba226d911b10d6c4c4f923a961"));
  assert.ok(fontDownloader.includes("aa310be8b717fe3774f9444dd89d5f4101cc6d10"));
  assert.ok(nativeScreen.includes("nativeTheme.typography.fontFamily.sans"));
  assert.ok(nativeScreen.includes("nativeTheme.typography.fontFamily.mono"));
  assert.ok(fontLicense.includes("SIL OPEN FONT LICENSE Version 1.1"));
  assert.ok(fontReadme.includes("bundled into the native app by Expo Metro"));
  assert.ok(fontReadme.includes("ignored by Git"));
});

test("web/native theme exports expose matching semantic foundations", () => {
  const themeSource = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
  assert.ok(themeSource.includes("export const webTheme"));
  assert.ok(themeSource.includes("export const nativeTheme"));
  assert.ok(themeSource.includes('sans: "MoreAIPlusJakartaSans"'));
  assert.ok(themeSource.includes('mono: "MoreAIJetBrainsMono"'));
});
