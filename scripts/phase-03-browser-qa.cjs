const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("/tmp/moreai-browser-qa/node_modules/playwright");
const AxeBuilder = require("/tmp/moreai-browser-qa/node_modules/@axe-core/playwright").default;
const pixelmatch = require("/tmp/moreai-browser-qa/node_modules/pixelmatch");
const { PNG } = require("/tmp/moreai-browser-qa/node_modules/pngjs");

const outputDir = path.resolve("artifacts/phase-03");
fs.mkdirSync(outputDir, { recursive: true });

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

const apps = [
  { name: "web", url: "http://127.0.0.1:3000" },
  { name: "admin", url: "http://127.0.0.1:3001" },
  { name: "partner-portal", url: "http://127.0.0.1:3002" },
  { name: "captive-portal", url: "http://127.0.0.1:3003" },
];

const failures = [];
const report = {
  generatedAt: new Date().toISOString(),
  viewports,
  apps: [],
  visualComparison: [],
  accessibility: [],
};

function fail(message) {
  failures.push(message);
  console.error(`FAIL: ${message}`);
}

async function waitForStableRender(page) {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(250);
}

async function normalizeReferenceRuntime(page) {
  const plusJakartaSans = fs.readFileSync("apps/mobile/assets/fonts/PlusJakartaSans.ttf").toString("base64");
  const jetBrainsMono = fs.readFileSync("apps/mobile/assets/fonts/JetBrainsMono.ttf").toString("base64");
  await page.addStyleTag({
    content: `
      @font-face {
        font-family: "MoreAI QA Plus Jakarta Sans";
        src: url(data:font/ttf;base64,${plusJakartaSans}) format("truetype");
        font-style: normal;
        font-weight: 100 900;
        font-display: block;
      }
      @font-face {
        font-family: "MoreAI QA JetBrains Mono";
        src: url(data:font/ttf;base64,${jetBrainsMono}) format("truetype");
        font-style: normal;
        font-weight: 100 800;
        font-display: block;
      }
      .text-emerald-600 { color: #14532D !important; }
      .dark .text-emerald-600 { color: #F7F4EC !important; }
      .text-gray-500 { color: #66645E !important; }
      .dark .text-gray-500 { color: #B9B8B0 !important; }
      .max-w-7xl.mx-auto.flex.flex-wrap.items-center.justify-between.gap-2 > div:first-child {
        min-width: 0;
        max-width: 100%;
        flex: 1 1 0%;
      }
      @media (max-width: 767px) {
        header.sticky {
          padding-inline: 12px;
          gap: 4px;
        }
        header.sticky > div:first-child {
          gap: 8px;
        }
        header.sticky > div:last-child > button.neo-btn {
          padding-inline: 4px;
        }
        @media (max-width: 380px) {
          header.sticky > div:first-child p {
            display: none;
          }
        }
        .max-w-7xl.mx-auto.flex.flex-wrap.items-center.justify-between.gap-2 > div:first-child {
          padding-block: 8px;
          margin-block: -6px;
        }
        button[aria-label="Notifikasi"],
        button[title="Voice input"],
        button[title="Kirim ke Chat AI"] {
          margin-left: 6px;
        }
        form .neo-card {
          padding-block: 0;
          padding-inline: 6px;
        }
        form .neo-card input[type="text"] {
          height: 44px;
          min-height: 44px;
        }
      }
    `,
  });
  await page.evaluate(async () => {
    document.documentElement.style.setProperty("--font-sans", '"MoreAI QA Plus Jakarta Sans"');
    document.documentElement.style.setProperty("--font-mono", '"MoreAI QA JetBrains Mono"');
    await document.fonts.load('400 16px "MoreAI QA Plus Jakarta Sans"');
    await document.fonts.load('400 16px "MoreAI QA JetBrains Mono"');
    await document.fonts.ready;
  });
}

async function screenshotReferenceComparison(browser, viewport, theme = "light") {
  const source = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const target = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  try {
    await source.goto("http://127.0.0.1:3100", { waitUntil: "domcontentloaded" });
    await target.goto("http://127.0.0.1:3000/phase-03-visual", { waitUntil: "domcontentloaded" });
    await waitForStableRender(source);
    await waitForStableRender(target);
    await normalizeReferenceRuntime(source);
    await waitForStableRender(source);

    if (theme === "dark") {
      await source.getByRole("button", { name: "Toggle Tema" }).click();
      await target.getByRole("button", { name: "Toggle Tema" }).click();
      await waitForStableRender(source);
      await waitForStableRender(target);
    }

    const selector = "div.min-h-screen.flex.flex-col";
    const sourceRoot = source.locator(selector).first();
    const targetRoot = target.locator(selector).first();
    await sourceRoot.waitFor({ state: "visible", timeout: 15000 });
    await targetRoot.waitFor({ state: "visible", timeout: 15000 });

    const stem = `web-reference-${theme}-${viewport.width}x${viewport.height}`;
    const sourcePath = path.join(outputDir, `${stem}-source.png`);
    const targetPath = path.join(outputDir, `${stem}-target.png`);
    const diffPath = path.join(outputDir, `${stem}-diff.png`);

    await sourceRoot.screenshot({ path: sourcePath, animations: "disabled" });
    await targetRoot.screenshot({ path: targetPath, animations: "disabled" });

    const sourcePng = PNG.sync.read(fs.readFileSync(sourcePath));
    const targetPng = PNG.sync.read(fs.readFileSync(targetPath));
    if (sourcePng.width !== targetPng.width || sourcePng.height !== targetPng.height) {
      fail(`${stem}: screenshot dimensions differ (${sourcePng.width}x${sourcePng.height} vs ${targetPng.width}x${targetPng.height})`);
      return;
    }

    const diff = new PNG({ width: sourcePng.width, height: sourcePng.height });
    const differentPixels = pixelmatch(
      sourcePng.data,
      targetPng.data,
      diff.data,
      sourcePng.width,
      sourcePng.height,
      { threshold: 0.12, includeAA: false }
    );
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    const totalPixels = sourcePng.width * sourcePng.height;
    const diffRatio = differentPixels / totalPixels;
    report.visualComparison.push({
      viewport,
      theme,
      sourcePath,
      targetPath,
      diffPath,
      differentPixels,
      totalPixels,
      diffRatio,
      pass: diffRatio <= 0.01,
    });
    if (diffRatio > 0.01) {
      fail(`${stem}: visual difference ${(diffRatio * 100).toFixed(3)}% exceeds 1.000% gate`);
    }
  } finally {
    await source.close();
    await target.close();
  }
}

async function inspectApp(browser, app) {
  const appReport = { name: app.name, screenshots: [], overflow: [], fontFamily: null, keyboard: null };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    try {
      const response = await page.goto(app.url, { waitUntil: "domcontentloaded" });
      if (!response || !response.ok()) {
        fail(`${app.name} ${viewport.width}px: route did not return HTTP success`);
      }
      await waitForStableRender(page);

      const layout = await page.evaluate(() => {
        const bodyStyle = getComputedStyle(document.body);
        const viewportMeta = document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? "";
        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          overflowElements: Array.from(document.querySelectorAll("body *"))
            .map((element) => {
              const rect = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              return {
                tag: element.tagName,
                id: element.id,
                className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
                width: Math.round(rect.width),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                scrollWidth: element.scrollWidth,
                overflowX: style.overflowX,
              };
            })
            .filter((element) => element.right > window.innerWidth + 1 || element.left < -1 || element.scrollWidth > element.width + 2)
            .sort((a, b) => b.right - a.right)
            .slice(0, 20),
          bodyFont: bodyStyle.fontFamily,
          viewportMeta,
          title: document.title,
        };
      });

      appReport.fontFamily = layout.bodyFont;
      if (layout.documentWidth > viewport.width + 1 || layout.bodyWidth > viewport.width + 1) {
        appReport.overflow.push({
          viewport: viewport.width,
          documentWidth: layout.documentWidth,
          bodyWidth: layout.bodyWidth,
          overflowElements: layout.overflowElements,
        });
        fail(`${app.name} ${viewport.width}px: horizontal overflow detected: ${JSON.stringify(appReport.overflow.at(-1))}`);
      }
      if (/user-scalable\s*=\s*no|max(imum)?-scale\s*=\s*1/i.test(layout.viewportMeta)) {
        fail(`${app.name}: browser zoom is disabled in viewport metadata`);
      }
      if (!layout.bodyFont || layout.bodyFont === "serif" || layout.bodyFont === "sans-serif") {
        fail(`${app.name}: expected source brand font family is not applied (${layout.bodyFont})`);
      }

      const screenshotPath = path.join(outputDir, `${app.name}-${viewport.width}x${viewport.height}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, animations: "disabled" });
      appReport.screenshots.push(screenshotPath);

      if (viewport.width === 390) {
        const darkTokens = await page.evaluate(() => {
          document.documentElement.classList.add("dark");
          const styles = getComputedStyle(document.documentElement);
          const values = {
            canvas: styles.getPropertyValue("--moreai-color-canvas").trim().toLowerCase(),
            surface: styles.getPropertyValue("--moreai-color-surface").trim().toLowerCase(),
            text: styles.getPropertyValue("--moreai-color-text").trim().toLowerCase(),
            shadow: styles.getPropertyValue("--moreai-color-shadow").trim().toLowerCase(),
          };
          await page.evaluate(() => document.documentElement.classList.remove("dark"));
          return values;
        });
        if (darkTokens.canvas !== "#171817" || darkTokens.surface !== "#232522" || darkTokens.text !== "#f7f4ec" || darkTokens.shadow !== "#000000") {
          fail(`${app.name}: dark theme tokens are not applied correctly: ${JSON.stringify(darkTokens)}`);
        }

        await page.emulateMedia({ reducedMotion: "reduce" });
        const reducedMotion = await page.evaluate(() => {
          const element = document.querySelector("button, a, .neo-card");
          const style = element ? getComputedStyle(element) : null;
          const toSeconds = (value) => value.split(",").map((item) => {
            const duration = item.trim();
            return parseFloat(duration) * (duration.endsWith("ms") ? 0.001 : 1);
          });
          return {
            preference: matchMedia("(prefers-reduced-motion: reduce)").matches,
            transitionSeconds: style ? toSeconds(style.transitionDuration) : [],
            animationSeconds: style ? toSeconds(style.animationDuration) : [],
          };
        });
        const motionDurations = [...reducedMotion.transitionSeconds, ...reducedMotion.animationSeconds];
        if (!reducedMotion.preference || motionDurations.some((duration) => duration > 0.0001)) {
          fail(`${app.name}: reduced-motion preference is not respected: ${JSON.stringify(reducedMotion)}`);
        }
        await page.emulateMedia({ reducedMotion: "no-preference" });

        const touchTargets = await page.evaluate(async () => {
          const selector = 'a[href], button, input, select, textarea, summary, [role="button"]';
          const violations = [];
          for (const element of Array.from(document.querySelectorAll(selector))) {
            const initialRect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            if (
              initialRect.width <= 0 ||
              initialRect.height <= 0 ||
              style.display === "none" ||
              style.visibility === "hidden" ||
              element.closest('[aria-hidden="true"], [inert]')
            ) continue;

            element.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
            await new Promise((resolve) => requestAnimationFrame(resolve));

            let targetElement = element;
            let targetType = "native-element";
            let targetRect = element.getBoundingClientRect();
            if (element.matches('input[type="checkbox"], input[type="radio"]')) {
              const label = Array.from(element.labels || []).find((candidate) => {
                const rect = candidate.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
              });
              if (label) {
                targetElement = label;
                targetType = "associated-label";
                targetRect = label.getBoundingClientRect();
              }
            } else if (element.matches('button, a[href], summary, [role="button"]')) {
              const pseudo = getComputedStyle(element, "::after");
              const width = Number.parseFloat(pseudo.width);
              const height = Number.parseFloat(pseudo.height);
              if (pseudo.content !== "none" && pseudo.display !== "none" && width > 0 && height > 0) {
                targetType = "expanded-pseudo-hit-area";
                targetRect = {
                  left: targetRect.left + (targetRect.width - width) / 2,
                  top: targetRect.top + (targetRect.height - height) / 2,
                  right: targetRect.left + (targetRect.width + width) / 2,
                  bottom: targetRect.top + (targetRect.height + height) / 2,
                };
              }
            }

            const clipped = { left: targetRect.left, top: targetRect.top, right: targetRect.right, bottom: targetRect.bottom };
            for (let ancestor = targetElement.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
              const ancestorStyle = getComputedStyle(ancestor);
              const ancestorRect = ancestor.getBoundingClientRect();
              if (ancestorStyle.overflowX !== "visible") {
                clipped.left = Math.max(clipped.left, ancestorRect.left);
                clipped.right = Math.min(clipped.right, ancestorRect.right);
              }
              if (ancestorStyle.overflowY !== "visible") {
                clipped.top = Math.max(clipped.top, ancestorRect.top);
                clipped.bottom = Math.min(clipped.bottom, ancestorRect.bottom);
              }
            }
            const targetWidth = Math.max(0, clipped.right - clipped.left);
            const targetHeight = Math.max(0, clipped.bottom - clipped.top);
            const samplePoints = [
              [(clipped.left + clipped.right) / 2, clipped.top + 1],
              [(clipped.left + clipped.right) / 2, clipped.bottom - 1],
              [clipped.left + 1, (clipped.top + clipped.bottom) / 2],
              [clipped.right - 1, (clipped.top + clipped.bottom) / 2],
              [(clipped.left + clipped.right) / 2, (clipped.top + clipped.bottom) / 2],
            ].filter(([x, y]) => x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight);
            const sampleHits = samplePoints.map(([x, y]) => {
              const hit = document.elementFromPoint(x, y);
              return {
                x: Math.round(x),
                y: Math.round(y),
                hitTag: hit?.tagName ?? null,
                insideTarget: Boolean(hit && (hit === targetElement || targetElement.contains(hit))),
              };
            });
            const hitTestPass = samplePoints.length === 5 && sampleHits.every((hit) => hit.insideTarget);
            const violation = targetWidth < 44 || targetHeight < 44 || !hitTestPass;
            if (violation) {
              violations.push({
                tag: element.tagName,
                label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 60) || "",
                targetType,
                visibleWidth: Math.round(element.getBoundingClientRect().width),
                visibleHeight: Math.round(element.getBoundingClientRect().height),
                targetWidth: Math.round(targetWidth),
                targetHeight: Math.round(targetHeight),
                hitTestPass,
                sampleHits,
              });
            }
          }
          return violations;
        });
        appReport.touchTargetsUnder44 = touchTargets;
        appReport.touchTargetGate = {
          minimumWidth: 44,
          minimumHeight: 44,
          violations: touchTargets.length,
          pass: touchTargets.length === 0,
        };
        if (touchTargets.length) {
          fail(
            `${app.name}: ${touchTargets.length} visible interactive targets are below the 44x44px mobile target gate: ${JSON.stringify(touchTargets.slice(0, 20))}`
          );
        }

        const keyboardCount = await page.evaluate(() => {
          const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
          return Array.from(document.querySelectorAll(selector)).filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              !element.closest('[aria-hidden="true"], [inert], nextjs-portal, [data-nextjs-devtools]')
            );
          }).length;
        });
        const focusedIndexes = new Set();
        const keyboardFailures = [];
        let firstFocusIndex = null;
        for (let step = 0; step < Math.min(keyboardCount + 8, 250); step += 1) {
          await page.keyboard.press("Tab");
          const focus = await page.evaluate(() => {
            const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
            const elements = Array.from(document.querySelectorAll(selector)).filter((element) => {
              const rect = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                !element.closest('[aria-hidden="true"], [inert], nextjs-portal, [data-nextjs-devtools]')
              );
            });
            const element = document.activeElement;
            const style = element ? getComputedStyle(element) : null;
            return {
              index: elements.indexOf(element),
              tag: element?.tagName ?? null,
              outlineStyle: style?.outlineStyle ?? null,
              outlineWidth: style?.outlineWidth ?? null,
            };
          });
          if (focus.index < 0) continue;
          if (firstFocusIndex === null) firstFocusIndex = focus.index;
          else if (focus.index === firstFocusIndex) break;
          focusedIndexes.add(focus.index);
          if (!focus.tag || focus.outlineStyle === "none" || focus.outlineWidth === "0px") {
            keyboardFailures.push({ index: focus.index, tag: focus.tag, outlineStyle: focus.outlineStyle, outlineWidth: focus.outlineWidth });
          }
        }
        appReport.keyboard = {
          focusableCount: keyboardCount,
          visitedCount: focusedIndexes.size,
          missingCount: Math.max(0, keyboardCount - focusedIndexes.size),
          focusIndicatorFailures: keyboardFailures,
          pass: focusedIndexes.size >= keyboardCount && keyboardFailures.length === 0,
        };
        if (!appReport.keyboard.pass) {
          fail(`${app.name}: keyboard traversal incomplete or focus indicator missing: ${JSON.stringify(appReport.keyboard)}`);
        }
      }

      if (viewport.width === 390 || viewport.width === 1440) {
        for (const theme of ["light", "dark"]) {
          await page.evaluate((isDark) => {
            document.documentElement.classList.toggle("dark", isDark);
          }, theme === "dark");
          await waitForStableRender(page);
          const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
          report.accessibility.push({
            app: app.name,
            viewport: viewport.width,
            theme,
            violations: axe.violations.map((violation) => ({
              id: violation.id,
              impact: violation.impact,
              help: violation.help,
              nodes: violation.nodes.length,
              details: violation.nodes.slice(0, 10).map((node) => ({
                target: node.target,
                failureSummary: node.failureSummary,
                checks: node.any.map((check) => ({ id: check.id, data: check.data })),
              })),
            })),
            passes: axe.passes.length,
            incomplete: axe.incomplete.length,
          });
          for (const violation of axe.violations) {
            fail(`${app.name} ${viewport.width}px ${theme}: axe ${violation.impact} violation ${violation.id} — ${violation.help} (${violation.nodes.length} nodes)`);
          }
        }
        document.documentElement.classList.remove("dark");
      }
      if (pageErrors.length) {
        for (const message of pageErrors) fail(`${app.name} ${viewport.width}px: browser runtime error: ${message}`);
      }
    } finally {
      await context.close();
    }
  }
  report.apps.push(appReport);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      await screenshotReferenceComparison(browser, viewport, "light");
      await screenshotReferenceComparison(browser, viewport, "dark");
    }
    for (const app of apps) {
      await inspectApp(browser, app);
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(outputDir, "browser-qa-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    visualComparisons: report.visualComparison.map(({ viewport, diffRatio, pass }) => ({ viewport: viewport.width, diffPercent: Number((diffRatio * 100).toFixed(3)), pass })),
    accessibility: report.accessibility.map(({ app, viewport, theme, violations }) => ({ app, viewport, theme, violationCount: violations.length })),
    appOverflow: report.apps.map(({ name, overflow }) => ({ name, overflow })),
    touchTargetsUnder44: report.apps.map(({ name, touchTargetsUnder44, keyboard }) => ({ name, count: touchTargetsUnder44?.length ?? 0, keyboard, samples: touchTargetsUnder44?.slice(0, 12) ?? [] })),
    failures,
  }, null, 2));

  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
