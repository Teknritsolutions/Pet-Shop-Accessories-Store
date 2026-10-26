const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage({ reducedMotion: "reduce" });
  fs.mkdirSync("tests/artifacts/reviews", { recursive: true });
  let checks = 0;
  for (const route of ["index.html", "pages/grooming.html", "pages/shop.html"]) {
    await page.goto("http://127.0.0.1:4173/" + route);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 640, 820, 1024, 1279])
      for (const dir of ["ltr", "rtl"])
        for (const theme of ["light", "dark"]) {
          await page.setViewportSize({ width, height: 844 });
          await page.evaluate(
            ({ dir, theme }) => {
              document.documentElement.dir = dir;
              document.documentElement.dataset.theme = theme;
            },
            { dir, theme },
          );
          await page.locator("#menu-toggle").click();
          const nav = page.locator("#main-navigation");
          const box = await nav.boundingBox();
          assert(Math.abs(box.y) < 1 && Math.abs(box.height - 844) < 2);
          assert(box.x >= -1 && box.x + box.width <= width + 1);
          assert.equal(
            await page.evaluate(() => getComputedStyle(document.body).overflow),
            "hidden",
          );
          assert(await page.locator(".mobile-menu-heading").isVisible());
          await page.locator("#main-navigation .nav-dropdown-toggle").click();
          assert(await page.locator("#home-submenu").isVisible());
          await page.locator("#main-navigation .nav-dropdown-toggle").click();
          await page.locator(".mobile-menu-heading [data-menu-close]").click();
          assert.equal(await nav.isVisible(), false);
          await page.locator("#menu-toggle").click();
          await page.keyboard.press("Escape");
          assert.equal(await nav.isVisible(), false);
          assert.equal(
            await page.evaluate(() => document.body.classList.contains("navigation-open")),
            false,
          );
          checks++;
          if (
            route === "index.html" &&
            dir === "ltr" &&
            theme === "light" &&
            [390, 820].includes(width)
          ) {
            await page.locator("#menu-toggle").click();
            await page.screenshot({ path: `tests/artifacts/reviews/mobile-menu-${width}.png` });
            await page.locator(".mobile-menu-heading [data-menu-close]").click();
          }
        }
  }
  await browser.close();
  console.log(
    `Passed ${checks} mobile/tablet menu layouts, dropdowns, close actions, and scroll-lock checks.`,
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
