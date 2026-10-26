const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173/pages/shop.html");
  await page.evaluate(() => localStorage.removeItem("mp-cart"));
  await page.reload();
  const buttons = page.locator("[data-cart-key]"),
    badge = page.locator("#cart-count");
  assert.equal(await badge.innerText(), "0");
  await buttons.nth(0).click();
  assert.equal(await badge.innerText(), "1");
  assert.equal(await buttons.nth(0).locator("span").innerText(), "Added");
  assert.equal(await buttons.nth(0).getAttribute("aria-pressed"), "true");
  await buttons.nth(1).click();
  assert.equal(await badge.innerText(), "2");
  await buttons.nth(0).click();
  assert.equal(await badge.innerText(), "1");
  assert.equal(await buttons.nth(0).locator("span").innerText(), "Add");
  await page.reload();
  assert.equal(await badge.innerText(), "1");
  assert.equal(await buttons.nth(1).locator("span").innerText(), "Added");
  await page.goto("http://127.0.0.1:4173/pages/about.html");
  assert.equal(await badge.innerText(), "1");
  await page.locator("#cart-toggle").click();
  assert.equal(await page.locator("#cart-items li").count(), 1);
  await page.locator("#cart-items button").click();
  assert.equal(await badge.innerText(), "0");
  await page.goto("http://127.0.0.1:4173/pages/shop.html");
  await page.locator("#shop-search").fill("brush");
  assert.equal(await page.locator("[data-product]:visible").count(), 1);
  await page.locator("button[type=reset]").click();
  await page.waitForFunction(
    () => document.querySelectorAll("[data-product]:not([hidden])").length === 8,
  );
  assert.equal(await page.locator("[data-product]:visible").count(), 8);
  let checks = 0;
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const i of document.images) i.loading = "eager";
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  });
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
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${theme} ${dir} ${width} overflow`,
        );
        if (theme === "light" && dir === "ltr" && [390, 1440].includes(width)) {
          for (const [selector, name] of [
            [".catalog-finder", "filters"],
            [".collection-promo", "comfort"],
            [".order-concierge", "order"],
          ])
            await page
              .locator(selector)
              .screenshot({ path: `tests/artifacts/reviews/shop-${name}-${width}.png` });
          const button = page.locator(".concierge-action .btn");
          assert.equal(await button.innerText(), "Request an order");
          assert.equal(await button.evaluate((e) => e.getBoundingClientRect().height), 48);
        }
        checks++;
      }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    `Cart toggling, removal, persistence, filtering and ${checks} responsive checks passed.`,
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
