const { chromium } = require("@playwright/test");
const fs = require("node:fs");
fs.mkdirSync("tests/artifacts/reviews", { recursive: true });
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  let checks = 0;
  for (const entry of JSON.parse(fs.readFileSync("documentation/page-manifest.json", "utf8"))) {
    const route = entry.file === "index" ? "index.html" : `pages/${entry.file}.html`;
    await page.goto("http://127.0.0.1:4173/" + route);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.locator(".site-footer a").filter({ hasText: "Template documentation" }).count(),
      0,
    );
    for (const link of await page.locator(".product-action").all()) {
      assert.equal((await link.innerText()).trim(), "Add");
      assert.equal(await link.evaluate((e) => e.tagName), "BUTTON");
      assert(await link.getAttribute("data-cart-key"));
      checks++;
    }
    for (const width of [320, 390, 640, 820, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))),
          ),
      );
      const issues = await page.evaluate(() => {
        const problems = [];
        if (window.innerWidth > 1024)
          for (const split of document.querySelectorAll(".split:has(> .editorial-image)")) {
            const image = split.querySelector(":scope > .editorial-image"),
              copy = split.querySelector(":scope > .split-copy");
            if (!copy) continue;
            const a = image.getBoundingClientRect(),
              b = copy.getBoundingClientRect();
            if (Math.abs(a.top - b.top) > 2 || Math.abs(a.bottom - b.bottom) > 2)
              problems.push({
                selector: "editorial alignment",
                top: [a.top, b.top],
                bottom: [a.bottom, b.bottom],
              });
            const cta = copy.querySelector(
              ":scope > .btn:last-child,:scope > .btn-text:last-child",
            );
            if (cta && Math.abs(cta.getBoundingClientRect().bottom - a.bottom) > 2)
              problems.push({ selector: "editorial CTA baseline" });
          }
        for (const grid of document.querySelectorAll(".grid,.horizontal-products")) {
          const rows = new Map();
          for (const c of grid.children) {
            if (!c.matches(".article-card,.product-card,.info-card,.pricing-card") || c.hidden)
              continue;
            const top = Math.round(c.getBoundingClientRect().top);
            if (!rows.has(top)) rows.set(top, []);
            rows.get(top).push(c);
          }
          for (const cards of rows.values()) {
            if (cards.length < 2) continue;
            for (const selector of ["h3", ".article-body p", ".product-bottom", ".btn-text"]) {
              const tops = cards
                .map((c) => c.querySelector(selector))
                .filter(Boolean)
                .map((e) => e.getBoundingClientRect().top);
              if (tops.length === cards.length && Math.max(...tops) - Math.min(...tops) > 2)
                problems.push({ selector, tops });
            }
          }
        }
        return {
          problems,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });
      assert.equal(issues.overflow, false, `${route} ${width}: overflow`);
      assert.deepEqual(
        issues.problems,
        [],
        `${route} ${width}: ${JSON.stringify(issues.problems)}`,
      );
      checks++;
    }
    if (entry.file === "index") {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.waitForTimeout(100);
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = "eager";
        await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
      });
      await page
        .locator(".brand-strip")
        .screenshot({ path: "tests/artifacts/reviews/brand-emblems.png" });
      await page
        .locator(".grid:has(.article-card)")
        .screenshot({ path: "tests/artifacts/reviews/aligned-articles.png" });
    }
  }
  await browser.close();
  console.log(`Passed ${checks} card alignment, action destination, and footer checks.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
