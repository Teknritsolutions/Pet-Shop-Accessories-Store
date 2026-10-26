const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/pages/home-2.html");
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const img of document.images) img.loading = "eager";
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  });
  let checks = 0;
  for (const theme of ["light", "dark"])
    for (const direction of ["ltr", "rtl"])
      for (const width of [
        320, 360, 375, 390, 414, 420, 480, 640, 768, 820, 1024, 1280, 1440, 1920,
      ]) {
        await page.evaluate(
          ({ theme, direction }) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dir = direction;
          },
          { theme, direction },
        );
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(
          () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
        );
        const result = await page.evaluate(() => {
          const box = (s) => document.querySelector(s).getBoundingClientRect();
          const image = box(".hero-2 .hero-image"),
            note = box(".hero-2 .image-note"),
            copy = box(".hero-2 .hero-copy");
          const buttons = [...document.querySelectorAll(".hero-2 .button-row a")].map((e) =>
            e.getBoundingClientRect(),
          );
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            captionInside:
              note.left >= image.left && note.right <= image.right && note.bottom <= image.bottom,
            aligned: Math.abs(image.top - copy.top) < 2 && Math.abs(image.bottom - copy.bottom) < 2,
            buttonsEqual:
              Math.abs(buttons[0].width - buttons[1].width) < 2 &&
              Math.abs(buttons[0].height - buttons[1].height) < 2,
          };
        });
        assert(!result.overflow, `Overflow ${width}`);
        assert(result.captionInside, `Caption ${width}`);
        assert(result.buttonsEqual, `Buttons ${width}`);
        if (width >= 768) assert(result.aligned, `Columns ${width}`);
        if (width >= 768) {
          const rows = await page.evaluate(() => {
            const r = (s) => document.querySelector(s).getBoundingClientRect();
            return [
              [".postcard-copy > .eyebrow", ".postcard-address > .eyebrow"],
              [".postcard-copy h2", ".postcard-address h3"],
              [".postcard-copy p", ".postcard-address dl"],
            ]
              .map(([a, b]) => Math.abs(r(a).top - r(b).top))
              .concat(Math.abs(r(".postcard-copy > .btn").bottom - r(".postcard-note").bottom));
          });
          assert(
            rows.every((delta) => delta < 2),
            `Postcard rows ${width}: ${rows}`,
          );
        }
        checks++;
        if (direction === "ltr" && [390, 1440].includes(width)) {
          fs.mkdirSync("tests/artifacts/reviews", { recursive: true });
          await page
            .locator(".hero-2")
            .screenshot({ path: `tests/artifacts/reviews/home-two-hero-${theme}-${width}.png` });
          await page
            .locator(".visit-postcard")
            .screenshot({ path: `tests/artifacts/reviews/postcard-${theme}-${width}.png` });
          await page
            .locator(".fieldkind-feature")
            .screenshot({ path: `tests/artifacts/reviews/fieldkind-${theme}-${width}.png` });
          await page
            .locator(".split:has(.routine-notes)")
            .screenshot({ path: `tests/artifacts/reviews/routine-${theme}-${width}.png` });
        }
      }
  await browser.close();
  console.log(`Passed ${checks} Home 2 hero alignment checks.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
