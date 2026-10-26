const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const manifest = JSON.parse(fs.readFileSync("documentation/page-manifest.json", "utf8"));
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  for (const entry of manifest.slice(0, 15)) {
    const route = entry.file === "index" ? "index.html" : `pages/${entry.file}.html`;
    await page.goto(`http://127.0.0.1:4173/${route}`, { waitUntil: "networkidle" });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dir = "ltr";
        for (const img of document.images) img.loading = "eager";
      }, theme);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((img) => img.decode().catch(() => null)));
        await Promise.all(
          [...document.images].map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve;
                }),
          ),
        );
      });
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({
          path: `tests/screenshots/${entry.file}-${theme}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  await page.goto("http://127.0.0.1:4173/");
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dir = "ltr";
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "tests/screenshots/hero-final.png" });
  await browser.close();
})();
