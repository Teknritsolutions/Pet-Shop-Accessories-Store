const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  const issues = [];
  let checks = 0;
  for (const entry of JSON.parse(fs.readFileSync("documentation/page-manifest.json", "utf8"))) {
    await page.goto(
      "http://127.0.0.1:4173/" +
        (entry.file === "index" ? "index.html" : `pages/${entry.file}.html`),
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      const data = await page.evaluate(() => ({
        buttons: [...document.querySelectorAll("main .btn,main .btn-text,main .product-action")]
          .filter((e) => e.getBoundingClientRect().width)
          .map((e) => ({
            text: e.textContent.trim(),
            font: parseFloat(getComputedStyle(e).fontSize),
            height: e.getBoundingClientRect().height,
            padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].map((key) =>
              parseFloat(getComputedStyle(e)[key]),
            ),
          })),
        paragraphs: [...document.querySelectorAll("main p")]
          .filter(
            (e) =>
              e.getBoundingClientRect().width &&
              !e.matches(".small,.signup-note,.demo-note,.form-message,.field-error") &&
              !e.closest(".form-message"),
          )
          .map((e) => ({
            text: e.textContent.trim().slice(0, 60),
            font: parseFloat(getComputedStyle(e).fontSize),
          })),
      }));
      for (const b of data.buttons) {
        checks++;
        if (b.font !== 16 || b.height < 48 || JSON.stringify(b.padding) !== "[11,18,11,18]")
          issues.push({ page: entry.file, width, ...b });
      }
      for (const p of data.paragraphs) {
        checks++;
        if (p.font < 17) issues.push({ page: entry.file, width, ...p });
      }
    }
  }
  await page.goto("http://127.0.0.1:4173/");
  await page.goto("http://127.0.0.1:4173/pages/home-2.html");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    for (const width of [
      320, 360, 375, 390, 414, 420, 480, 640, 768, 820, 1024, 1280, 1440, 1920,
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        ),
        `Home 2 at ${width}`,
      );
    }
  }
  await page.goto("http://127.0.0.1:4173/");
  assert.equal(await page.locator(".story-portrait").count(), 3);
  for (const img of await page.locator(".story-portrait").all()) {
    const box = await img.boundingBox();
    assert(box.width >= 64 && box.height >= 64, "Portrait visible size");
  }
  fs.writeFileSync("tests/readability-report.json", JSON.stringify({ checks, issues }, null, 2));
  await browser.close();
  assert.equal(issues.length, 0, JSON.stringify(issues));
  console.log(`Passed ${checks} readable paragraph and button measurements.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
