const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/pages/contact.html");
  assert((await page.locator(".store-map iframe").getAttribute("src")).includes("maps.google.com"));
  assert.equal(await page.locator(".map-placeholder").count(), 0);
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
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${width} overflow`,
        );
        if (theme === "light" && dir === "ltr" && [390, 1440].includes(width))
          for (const [selector, name] of [
            [".order-enquiry", "form"],
            [".contact-faq", "faq"],
            [".store-map", "map"],
          ])
            await page
              .locator(selector)
              .screenshot({ path: `tests/artifacts/reviews/contact-${name}-${width}.png` });
        checks++;
      }
  await page.locator(".contact-faq summary").first().click();
  assert((await page.locator(".contact-faq details").first().getAttribute("open")) !== null);
  await page.locator("[data-form=special-order] button[type=submit]").click();
  assert(await page.locator("[data-form=special-order] .field-error").first().innerText());
  await page.goto("http://127.0.0.1:4173/pages/blog.html");
  await page.locator(".journal-feature .btn").click();
  assert(page.url().endsWith("#journal"));
  assert(
    !(
      await page
        .locator(".journal-feature .btn")
        .evaluate((e) => getComputedStyle(e).backgroundColor)
    ).includes("13, 110, 253"),
  );
  await browser.close();
  console.log(
    `Passed ${checks} contact layouts, map integration, FAQ, form validation, and care-tip link.`,
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
