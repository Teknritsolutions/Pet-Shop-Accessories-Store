const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/pages/blog.html");
  assert.equal(await page.locator("#article-search,[data-article-filter]").count(), 0);
  assert.equal(await page.locator("[data-article]").count(), 6);
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const i of document.images) i.loading = "eager";
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  });
  let checks = 0;
  for (const theme of ["light", "dark"])
    for (const dir of ["ltr", "rtl"])
      for (const width of [320, 390, 640, 820, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(
          ({ theme, dir }) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dir = dir;
          },
          { theme, dir },
        );
        await page.waitForTimeout(100);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        if (theme === "light" && dir === "ltr" && [390, 1440].includes(width))
          await page
            .locator(".journal-feature")
            .screenshot({ path: `tests/artifacts/reviews/journal-feature-${width}.png` });
        checks++;
      }
  await page.locator("[data-article] summary").last().click();
  assert((await page.locator("[data-article] details").last().getAttribute("open")) !== null);
  await browser.close();
  console.log(
    `Passed ${checks} journal layouts, six stories, removed filters, and expandable notes.`,
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
