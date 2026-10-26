const { chromium, expect } = require("@playwright/test");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage();
  let checks = 0;
  for (const route of ["index.html", "pages/home-2.html", "pages/about.html", "pages/shop.html"]) {
    await page.goto("http://127.0.0.1:4173/" + route);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("#search-toggle").count(), 0);
    assert.equal(await page.locator("#main-navigation > a").first().innerText(), "About");
    for (const width of [320, 390, 820, 1024, 1280, 1440, 1920])
      for (const direction of ["ltr", "rtl"]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate((dir) => (document.documentElement.dir = dir), direction);
        await page.evaluate(
          () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
        );
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${route} overflow ${width}`,
        );
        if (width >= 1280) {
          const layout = await page.evaluate(() => {
            const rect = (s) => document.querySelector(s).getBoundingClientRect(),
              nav = rect(".main-nav"),
              header = rect(".header-inner"),
              tools = rect(".header-tools"),
              brand = rect(".header-inner > .brand");
            return {
              brandGap:
                document.documentElement.dir === "rtl"
                  ? brand.left - nav.right
                  : nav.left - brand.right,
              toolsGap:
                document.documentElement.dir === "rtl"
                  ? nav.left - tools.right
                  : tools.left - nav.right,
              itemGaps: [...document.querySelector(".main-nav").children]
                .map((e) => e.getBoundingClientRect())
                .filter((r) => r.width)
                .sort((a, b) => a.left - b.left)
                .map((r, i, items) => (i ? r.left - items[i - 1].right : null))
                .filter((n) => n !== null),
              shopHeight: rect(".header-shop-button").height,
              overlap:
                Math.min(nav.right, tools.right) - Math.max(nav.left, tools.left) > 0 ||
                Math.min(nav.right, brand.right) - Math.max(nav.left, brand.left) > 0,
            };
          });
          assert(
            Math.abs(layout.brandGap - layout.toolsGap) < 2,
            `Balanced navigation spacing ${width}: ${layout.brandGap}/${layout.toolsGap}`,
          );
          assert(
            layout.itemGaps.every((gap) => Math.abs(gap - 24) < 2),
            `Even item spacing ${width}: ${layout.itemGaps}`,
          );
          assert.equal(layout.shopHeight, 48, `Single-line shop action ${width}`);
          assert(!layout.overlap, `Header overlap ${width}`);
          await page.locator(".nav-dropdown").hover();
          await expect(page.locator("#home-submenu")).toBeVisible();
          if (route.includes("home") || route === "index.html") {
            const active = page.locator('#home-submenu [aria-current="page"]');
            await expect(active).toHaveCount(1);
            assert(
              await active.evaluate(
                (e) => getComputedStyle(e).backgroundColor !== "rgba(0, 0, 0, 0)",
              ),
            );
          }
          await page.locator("main").hover();
          await expect(page.locator("#home-submenu")).toBeHidden();
          await page.locator(".main-nav .nav-dropdown-toggle").focus();
          await page.keyboard.press("ArrowDown");
          await expect(page.locator("#home-submenu")).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(page.locator("#home-submenu")).toBeHidden();
        } else {
          await page.locator("#menu-toggle").click();
          await expect(page.locator(".mobile-nav-utilities .btn-primary")).toBeVisible();
          await page.locator(".main-nav .nav-dropdown-toggle").click();
          await expect(page.locator("#home-submenu")).toBeVisible();
          await page.keyboard.press("Escape");
          await page.keyboard.press("Escape");
        }
        await page.locator("#cart-toggle").click();
        await expect(page.locator("#cart-panel")).toBeVisible();
        await expect(page.locator("#cart-panel a")).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(page.locator("#cart-panel")).toBeHidden();
        checks++;
      }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => (document.documentElement.dir = "ltr"));
    await page.locator(".nav-dropdown").hover();
    fs.mkdirSync("tests/artifacts/reviews", { recursive: true });
    await page.screenshot({
      path: `tests/artifacts/reviews/header-${route.replaceAll("/", "-")}.png`,
    });
  }
  for (const route of ["index.html", "pages/shop.html"]) {
    await page.goto("http://127.0.0.1:4173/" + route);
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const img of document.images) img.loading = "eager";
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
      document.documentElement.dataset.theme = "dark";
    });
    for (let i = 0; i < 10; i++) {
      await page.setViewportSize({ width: 1920, height: 1000 });
      await page.evaluate(() => (document.documentElement.dir = "ltr"));
      await page.evaluate(() => (document.documentElement.dir = "rtl"));
      await page.setViewportSize({ width: 320, height: 1000 });
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      const result = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        elements: [...document.querySelectorAll("body *")]
          .filter((e) => {
            const b = e.getBoundingClientRect();
            return b.width && (b.left < -1 || b.right > innerWidth + 1) && !e.closest("[hidden]");
          })
          .slice(0, 10)
          .map((e) => ({
            class: e.className,
            left: e.getBoundingClientRect().left,
            right: e.getBoundingClientRect().right,
          })),
      }));
      assert(result.scroll <= result.client + 1, JSON.stringify({ route, i, ...result }));
    }
  }
  await browser.close();
  console.log(`Passed ${checks} header layout and interaction checks.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
