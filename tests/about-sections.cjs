const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/pages/about.html");
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const i of document.images) i.loading = "eager";
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  });
  let checks = 0;
  for (const theme of ["light", "dark"])
    for (const dir of ["ltr", "rtl"])
      for (const width of [320, 390, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(
          ({ theme, dir }) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dir = dir;
          },
          { theme, dir },
        );
        await page.waitForTimeout(100);
        const r = await page.evaluate(() => {
          const box = (e) => e.getBoundingClientRect();
          const collection = document.querySelector(".about-collection"),
            visit = document.querySelector(".visit-window"),
            team = [...document.querySelectorAll(".split")].find((e) =>
              e.textContent.includes("The people behind the counter"),
            );
          const v = box(visit),
            a = box(visit.firstElementChild),
            b = box(visit.lastElementChild);
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            collectionTop: Math.abs(
              box(collection.firstElementChild).top - box(collection.lastElementChild).top,
            ),
            equalColumns: Math.abs(a.width - b.width),
            outerGaps: Math.abs(v.left - (innerWidth - v.right)),
            notes: team.querySelectorAll(".number-list li").length,
          };
        });
        assert(!r.overflow, `${width} overflow`);
        assert(r.outerGaps < 2, `${width} outer gaps`);
        assert.equal(r.notes, 2);
        if (width > 900) {
          assert(r.collectionTop < 2);
          assert(r.equalColumns < 2);
        }
        if (theme === "light" && dir === "ltr" && [390, 1440].includes(width))
          for (const selector of [
            ".about-collection",
            ".visit-window",
            '.split:has(img[src*="team-store"])',
          ]) {
            const el = page.locator(selector);
            if (await el.count())
              await el.screenshot({
                path: `tests/artifacts/reviews/about-${selector.includes("collection") ? "collection" : selector.includes("visit") ? "visit" : "team"}-${width}.png`,
              });
          }
        checks++;
      }
  await browser.close();
  console.log(`Passed ${checks} About section checks.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
