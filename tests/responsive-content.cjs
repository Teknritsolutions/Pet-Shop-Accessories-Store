const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const routes = JSON.parse(fs.readFileSync("documentation/page-manifest.json", "utf8")).map((p) =>
  p.file === "index" ? "index.html" : `pages/${p.file}.html`,
);
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const failures = [];
  let checks = 0;
  fs.mkdirSync("tests/artifacts/reviews/responsive", { recursive: true });
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:4173/${route}`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const img of document.images) img.loading = "eager";
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    for (const width of [320, 390, 640, 768, 820, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const dir of ["ltr", "rtl"]) {
        await page.evaluate((dir) => {
          document.documentElement.dir = dir;
        }, dir);
        await page.waitForTimeout(100);
        const clipped = await page.evaluate(() => {
          const results = [];
          for (const el of document.querySelectorAll(
            "main h1, main h2, main h3, main p, main .btn, main .bi",
          )) {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height || getComputedStyle(el).visibility === "hidden") continue;
            let ancestor = el.parentElement;
            while (ancestor && ancestor.tagName !== "BODY") {
              const css = getComputedStyle(ancestor),
                a = ancestor.getBoundingClientRect();
              if (
                ["hidden", "clip"].includes(css.overflowY) &&
                (r.top < a.top - 2 || r.bottom > a.bottom + 2)
              ) {
                results.push(
                  `${el.className || el.tagName}: ${el.textContent.trim().slice(0, 65)} clipped by ${ancestor.className}`,
                );
                break;
              }
              ancestor = ancestor.parentElement;
            }
          }
          return [...new Set(results)];
        });
        if (clipped.length) failures.push({ route, width, dir, clipped });
        checks++;
      }
      if ([390, 820].includes(width)) {
        await page.evaluate(() => {
          document.documentElement.dir = "ltr";
        });
        await page.screenshot({
          path: `tests/artifacts/reviews/responsive/${route.replaceAll("/", "-")}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  await browser.close();
  fs.writeFileSync(
    "tests/artifacts/reviews/responsive-content.json",
    JSON.stringify({ checks, failures }, null, 2),
  );
  console.log(JSON.stringify({ checks, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
