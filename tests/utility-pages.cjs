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
  let checks = 0;
  for (const route of ["404", "coming-soon"]) {
    await page.goto(`http://127.0.0.1:4173/pages/${route}.html`);
    assert.equal(await page.locator("header,footer,.brand-logo,.brand").count(), 0);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    });
    for (const theme of ["light", "dark"])
      for (const dir of ["ltr", "rtl"])
        for (const width of [320, 390, 820, 1024, 1440, 1920]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.evaluate(
            ({ theme, dir }) => {
              document.documentElement.dataset.theme = theme;
              document.documentElement.dir = dir;
            },
            { theme, dir },
          );
          await page.waitForTimeout(80);
          assert(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${route} ${width} overflow`,
          );
          const left = await page
            .locator(".utility-controls")
            .evaluate((e) => e.getBoundingClientRect().left);
          assert(dir === "rtl" ? left < 40 : left > width / 2);
          if (dir === "ltr" && [390, 1440].includes(width))
            await page.screenshot({
              path: `tests/artifacts/reviews/utility-${route}-${theme}-${width}.png`,
              fullPage: true,
            });
          checks++;
        }
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.locator("#theme-toggle").click();
    assert.notEqual(await page.evaluate(() => document.documentElement.dataset.theme), before);
    await page.locator("#direction-toggle").click();
    const direction = await page.evaluate(() => document.documentElement.dir);
    await page.reload();
    assert.equal(await page.evaluate(() => document.documentElement.dir), direction);
  }
  assert((await page.locator("[data-time=days]").innerText()) !== "00");
  await page.locator("#launch-email").fill("person@example.com");
  await page.locator("#launch-form button").click();
  assert((await page.locator("#launch-message").innerText()).includes("Thank you"));
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    `Passed ${checks} standalone layouts, theme/RTL toggles and persistence, countdown, and notification preview.`,
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
