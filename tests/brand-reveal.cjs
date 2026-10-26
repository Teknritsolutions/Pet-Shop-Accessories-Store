const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto("http://127.0.0.1:4173/pages/brands.html");
  const card = page.locator(".brand-photo-card").nth(1),
    heading = card.locator("h3");
  const opacity = () => heading.evaluate((e) => getComputedStyle(e).opacity);
  assert.equal(await opacity(), "0");
  await card.hover();
  await page.waitForTimeout(300);
  assert.equal(await opacity(), "1");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  assert.equal(await opacity(), "0");
  await card.locator("a").focus();
  await page.waitForTimeout(300);
  assert.equal(await opacity(), "1");
  await card.screenshot({ path: "tests/artifacts/reviews/brand-reveal-hover.png" });
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto("http://127.0.0.1:4173/pages/brands.html");
  assert.equal(
    await mobile
      .locator(".brand-photo-card h3")
      .first()
      .evaluate((e) => getComputedStyle(e).opacity),
    "1",
  );
  await browser.close();
  console.log("Photo-only default, hover reveal, keyboard focus, and touch visibility passed.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
