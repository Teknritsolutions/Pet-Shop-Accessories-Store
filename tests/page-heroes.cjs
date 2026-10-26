const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  fs.mkdirSync("tests/artifacts/reviews", { recursive: true });
  let checks = 0;
  for (const route of ["about", "shop", "brands", "grooming", "blog", "contact"]) {
    await page.goto(`http://127.0.0.1:4173/pages/${route}.html`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll(".hero-banner img")].map((i) => i.decode()));
    });
    for (const theme of ["light", "dark"])
      for (const dir of ["ltr", "rtl"])
        for (const width of [320, 390, 768, 820, 1024, 1280, 1440, 1920]) {
          await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
          await page.evaluate(
            ({ theme, dir }) => {
              document.documentElement.dataset.theme = theme;
              document.documentElement.dir = dir;
              scrollTo(0, 0);
            },
            { theme, dir },
          );
          await page.waitForTimeout(100);
          const r = await page.evaluate(() => {
            const hero = document.querySelector(".hero-banner").getBoundingClientRect(),
              title = document.querySelector(".hero-banner h1").getBoundingClientRect();
            return {
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
              center: Math.abs((title.left + title.right) / 2 - innerWidth / 2),
              bottom: hero.bottom,
              height: innerHeight,
            };
          });
          assert(!r.overflow, `${route} ${theme} ${dir} ${width} overflow`);
          assert(r.center < 2, `${route} ${width} text center ${r.center}`);
          assert(
            Math.abs(r.bottom - r.height) < 2,
            `${route} ${theme} ${dir} ${width} screen fit ${JSON.stringify(r)}`,
          );
          if (dir === "ltr" && [390, 1440].includes(width))
            await page
              .locator(".hero-banner")
              .screenshot({ path: `tests/artifacts/reviews/hero-${route}-${theme}-${width}.png` });
          checks++;
        }
  }
  await browser.close();
  console.log(`Passed ${checks} hero layout checks.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
