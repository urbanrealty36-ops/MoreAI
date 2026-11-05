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

async function screenshotReferenceComparison(browser, viewport) {
  const source = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const target = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  try {
    await source.goto("http://127.0.0.1:3100", { waitUntil: "domcontentloaded" });
    await target.goto("http://127.0.0.1:3000/__visual", { waitUntil: "domcontentloaded" });
    await waitForStableRender(source);
    await waitForStableRender(target);

    const selector = "div.min-h-screen.flex.flex-col";
    const sourceRoot = source.locator(selector).first();
    const targetRoot = target.locator(selector).first();
    await sourceRoot.waitFor({ state: "visible", timeout: 15000 });
    await targetRoot.waitFor({ state: "visible", timeout: 15000 });

    const stem = `web-reference-${viewport.width}x${viewport.height}`;
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
  const appReport = { name: app.name, screenshots: [], overflow: [], fontFamily: null };
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
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
        });
        fail(`${app.name} ${viewport.width}px: horizontal overflow detected`);
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
        await page.keyboard.press("Tab");
        const focus = await page.evaluate(() => {
          const element = document.activeElement;
          const style = element ? getComputedStyle(element) : null;
          return {
            tag: element?.tagName ?? null,
            outlineStyle: style?.outlineStyle ?? null,
            outlineWidth: style?.outlineWidth ?? null,
          };
        });
        if (!focus.tag || focus.tag === "BODY" || focus.outlineStyle === "none" || focus.outlineWidth === "0px") {
          fail(`${app.name}: keyboard focus is not visibly indicated on the first Tab stop`);
        }
      }

      if (viewport.width === 390 || viewport.width === 1440) {
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        report.accessibility.push({
          app: app.name,
          viewport: viewport.width,
          violations: axe.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.length,
            targets: violation.nodes.slice(0, 10).map((node) => node.target),
          })),
          passes: axe.passes.length,
          incomplete: axe.incomplete.length,
        });
        for (const violation of axe.violations) {
          fail(`${app.name} ${viewport.width}px: axe ${violation.impact} violation ${violation.id} — ${violation.help} (${violation.nodes.length} nodes)`);
        }
      }
      if (pageErrors.length) {
        for (const message of pageErrors) fail(`${app.name} ${viewport.width}px: browser runtime error: ${message}`);
      }
    } finally {
      await page.close();
    }
  }
  report.apps.push(appReport);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      await screenshotReferenceComparison(browser, viewport);
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
    accessibility: report.accessibility.map(({ app, viewport, violations }) => ({ app, viewport, violationCount: violations.length })),
    appOverflow: report.apps.map(({ name, overflow }) => ({ name, overflow })),
    failures,
  }, null, 2));

  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
