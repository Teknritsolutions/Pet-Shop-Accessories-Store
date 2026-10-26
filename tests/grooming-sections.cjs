const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/pages/grooming.html");
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const i of document.images) i.loading = "eager";
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  });
  for (const input of await page
    .locator(
      "[data-form=grooming] input:not([type=date]):not([type=checkbox]), [data-form=grooming] textarea",
    )
    .all())
    assert(await input.getAttribute("placeholder"));
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
        assert(
          await page.evaluate(() =>
            [...document.querySelectorAll(".pricing-card")].every((card) => {
              const button = card.querySelector(".btn");
              const unit = card.querySelector(".price small");
              return (
                button.getBoundingClientRect().height <= 50 &&
                unit.getBoundingClientRect().height <=
                  parseFloat(getComputedStyle(unit).lineHeight) + 1
              );
            }),
          ),
          `${width}: pricing buttons and price units should stay on one line`,
        );
        if (width > 900)
          assert(
            await page.evaluate(() => {
              const el = document.querySelector(".grooming-enquiry"),
                a = el.children[0].getBoundingClientRect(),
                b = el.children[1].getBoundingClientRect();
              return Math.abs(a.top - b.top) < 2 && Math.abs(a.bottom - b.bottom) < 2;
            }),
          );
        if (theme === "light" && dir === "ltr" && [390, 1440].includes(width))
          for (const [selector, name] of [
            [".grooming-services", "services"],
            [".grooming-process", "process"],
            [".grooming-enquiry", "enquiry"],
          ])
            await page
              .locator(selector)
              .screenshot({ path: `tests/artifacts/reviews/grooming-${name}-${width}.png` });
        checks++;
      }
  await page.locator("[data-form=grooming] button[type=submit]").click();
  assert(await page.locator("[data-form=grooming] .field-error").first().innerText());
  await browser.close();
  console.log(`Passed ${checks} grooming layouts, placeholders, and required-field validation.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
