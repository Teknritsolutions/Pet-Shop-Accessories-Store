const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const urls = [
  "https://ravivarmaadepu123.github.io/boutique-yarn-and-craft-supply/pages/",
  "https://teknrit-maker.github.io/High-End-Event-Planning/pages/index.html",
  "https://teknrit-maker.github.io/FoodTruck/Pages/menu.html",
];
(async () => {
  fs.mkdirSync("tests/references", { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  await Promise.all(
    urls.map(async (url, index) => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: `tests/references/reference-${index + 1}.png`,
          fullPage: true,
        });
        console.log(
          JSON.stringify(
            await page.evaluate(() => ({
              title: document.title,
              headings: [...document.querySelectorAll("h1,h2")]
                .slice(0, 8)
                .map((e) => e.textContent.trim()),
              buttons: [...document.querySelectorAll(".btn,button")]
                .slice(0, 6)
                .map((e) => ({
                  label: e.textContent.trim(),
                  radius: getComputedStyle(e).borderRadius,
                  font: getComputedStyle(e).fontSize,
                })),
              paragraph: document.querySelector("p")
                ? getComputedStyle(document.querySelector("p")).fontSize
                : null,
            })),
            null,
            2,
          ),
        );
      } catch (error) {
        console.log(`${url}: ${error.message}`);
      }
      await page.close();
    }),
  );
  await browser.close();
})();
