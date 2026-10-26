const { chromium, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const widths = [320, 360, 375, 390, 414, 420, 480, 640, 768, 820, 1024, 1280, 1440, 1920];
const manifest = JSON.parse(fs.readFileSync("documentation/page-manifest.json", "utf8"));
const routes = [
  ...manifest.map((p) => (p.file === "index" ? "index.html" : `pages/${p.file}.html`)),
  "documentation/index.html",
];
const base = "http://127.0.0.1:4173/";
const failures = [];
const errors = [];
const imageUsage = {};
fs.mkdirSync("tests/screenshots", { recursive: true });
for (const route of routes) {
  const html = fs.readFileSync(route, "utf8");
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route}: one H1`);
  assert(html.includes('name="description"'), `${route}: description`);
  assert(html.includes('rel="canonical"'), `${route}: canonical`);
  assert(html.includes("favicon.svg"), `${route}: favicon`);
  for (const match of html.matchAll(/\s(?:src|href)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
    const clean = decodeURIComponent(target.split(/[?#]/)[0]);
    const resolved = path.resolve(path.dirname(route), clean);
    assert(fs.existsSync(resolved), `${route}: broken local target ${target}`);
    if (target.includes("assets/images/") && match[0].trimStart().startsWith("src=")) {
      const normalized = path.relative(process.cwd(), resolved).replaceAll("\\", "/");
      (imageUsage[normalized] ??= []).push(route);
    }
  }
}
const repeats = Object.entries(imageUsage).filter(([, uses]) => uses.length > 1);
assert.equal(repeats.length, 0, `Repeated content imagery: ${JSON.stringify(repeats)}`);
fs.writeFileSync("documentation/image-usage.json", JSON.stringify(imageUsage, null, 2));
assert.equal((fs.readFileSync("index.html", "utf8").match(/<section /g) || []).length, 10);
assert.equal((fs.readFileSync("pages/home-2.html", "utf8").match(/<section /g) || []).length, 10);

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  let checks = 0;
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      const images = [...document.images];
      for (const img of images) img.loading = "eager";
      await Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              }),
        ),
      );
      await document.fonts.ready;
      await Promise.all(images.map((img) => img.decode().catch(() => null)));
    });
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((img) => !img.complete || !img.naturalWidth)
        .map((img) => img.src),
    );
    if (broken.length) failures.push({ route, broken });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        const result = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          const overflow = [...document.querySelectorAll("main *,header *,footer *")]
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return (
                r.width > 0 &&
                getComputedStyle(e).display !== "none" &&
                (r.left < -0.5 || r.right > viewport + 0.5) &&
                !e.closest("[hidden],.table-scroll")
              );
            })
            .map((e) => ({
              tag: e.tagName,
              class: e.className,
              left: e.getBoundingClientRect().left,
              right: e.getBoundingClientRect().right,
            }));
          const containers = [...document.querySelectorAll(".container")]
            .map((e) => e.getBoundingClientRect())
            .filter((r) => r.width > 0);
          const unbalanced = containers.some((r) => Math.abs(r.left - (viewport - r.right)) > 1);
          return {
            scroll: document.documentElement.scrollWidth > viewport + 1,
            overflow: overflow.slice(0, 8),
            unbalanced,
          };
        });
        checks++;
        if (result.scroll || result.overflow.length || result.unbalanced)
          failures.push({ route, theme, width, ...result });
        if (width === 1440 || width === 390) {
          await page.screenshot({
            path: `tests/screenshots/${route === "documentation/index.html" ? "documentation" : path.basename(route, ".html")}-${theme}-${width}.png`,
            fullPage: true,
          });
        }
      }
      // Every page also receives an RTL desktop and small-phone pass.
      await page.evaluate(() => (document.documentElement.dir = "rtl"));
      for (const width of [320, 820, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        // Direction changes and resize callbacks need to settle before Blink's scroll-width check.
        await page.waitForTimeout(80);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        );
        checks++;
        if (overflow)
          failures.push({
            route,
            theme,
            width,
            rtl: true,
            overflow,
            elements: await page.evaluate(() =>
              [...document.querySelectorAll("body *")]
                .filter((e) => {
                  const r = e.getBoundingClientRect();
                  return r.width && r.right > innerWidth + 1;
                })
                .slice(0, 10)
                .map((e) => ({
                  tag: e.tagName,
                  class: e.className,
                  right: e.getBoundingClientRect().right,
                })),
            ),
          });
      }
      await page.evaluate(() => (document.documentElement.dir = "ltr"));
    }
    console.log(`Reviewed ${route}`);
  }

  // Behavior checks exercise meaningful user flows.
  fs.writeFileSync(
    "tests/layout-report.json",
    JSON.stringify({ checks, failures, errors }, null, 2),
  );
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(base);
  await page.locator("#menu-toggle").click();
  assert(await page.locator("#main-navigation").evaluate((e) => e.classList.contains("open")));
  await page.locator(".nav-dropdown-toggle[aria-controls]").click();
  assert(await page.locator("#home-submenu").isVisible());
  await page.locator("#home-submenu a").nth(1).click();
  assert(page.url().includes("home-2"));
  await page.locator("#menu-toggle").click();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#menu-toggle").getAttribute("aria-expanded"), "false");
  await page.locator("#theme-toggle").click();
  const theme = await page.locator("html").getAttribute("data-theme");
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
  await page.setViewportSize({ width: 820, height: 900 });
  await page.locator("#direction-toggle").click();
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  await page.locator("#direction-toggle").click();
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(base + "pages/shop.html?pet=Cats");
  assert.equal(await page.locator("[data-product]:visible").count(), 2);
  await page.locator("#pet-filter").selectOption("");
  await page.locator("#sort-filter").selectOption("low");
  const prices = await page
    .locator("[data-product]:visible")
    .evaluateAll((cards) => cards.map((c) => Number(c.dataset.price)));
  assert.deepEqual(
    prices,
    [...prices].sort((a, b) => a - b),
  );
  await page.locator("#shop-search").fill("nothing-matches");
  assert(await page.locator("#product-empty").isVisible());
  await page.locator('button[type="reset"]').click();
  await expect(page.locator("[data-product]:visible")).toHaveCount(8);
  await page.goto(base + "pages/blog.html");
  assert.equal(await page.locator("[data-article]:visible").count(), 6);
  await page.locator(".care-notes summary").first().click();
  assert(
    await page
      .locator(".care-notes")
      .first()
      .evaluate((el) => el.open),
  );
  await page.goto(base + "pages/product-details.html");
  await page.locator("[data-gallery-src]").nth(1).click();
  assert((await page.locator("#gallery-main").getAttribute("src")).includes("bed-overhead"));
  await page.locator("#tab-specifications").click();
  assert(await page.locator("#panel-specifications").isVisible());
  await page.locator('[data-quantity="1"]').click();
  assert.equal(await page.locator("#quantity").inputValue(), "2");
  await page.locator("#product-enquiry").click();
  assert.equal(await page.locator("#field-product").inputValue(), "Restwell Linen Bed");
  assert.equal(await page.locator("#field-quantity").inputValue(), "2");
  await page.locator('[data-form="special-order"] button[type="submit"]').click();
  assert((await page.locator('[aria-invalid="true"]').count()) > 0);
  await page.locator("#field-name").fill("Test Pet Parent");
  await page.locator("#field-email").fill("test@example.com");
  await page.locator("#field-phone").fill("555-555-0148");
  await page.locator("#field-pet").selectOption("Dogs");
  await page.locator("#field-message").fill("A medium linen bed, please.");
  await page.locator('[name="consent"]').check();
  await page.locator('[data-form="special-order"] button[type="submit"]').click();
  assert((await page.locator(".form-message").textContent()).includes("passed validation"));
  await page.locator('.footer-bottom [data-policy="privacy"]').click();
  assert(await page.locator("#policy-dialog").isVisible());
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").getAttribute("class"), "icon-button dialog-close");
  await page.keyboard.press("Escape");
  assert(!(await page.locator("#policy-dialog").isVisible()));
  await page.goto(base + "pages/coming-soon.html");
  assert(Number(await page.locator('[data-time="days"]').textContent()) >= 0);
  await page.goto(base);
  await page.locator("#cart-toggle").click();
  assert(await page.locator("#cart-panel").isVisible());
  await page.keyboard.press("Escape");
  assert(!(await page.locator("#cart-panel").isVisible()));
  await page.goto(base + "pages/shop.html?q=brush");
  assert.equal(await page.locator("[data-product]:visible").count(), 1);
  const report = {
    date: new Date().toISOString(),
    pages: routes.length,
    widths,
    themes: ["light", "dark"],
    rtlWidths: [320, 820, 1440],
    layoutChecks: checks,
    contentImages: Object.keys(imageUsage).length,
    repeatedImages: repeats,
    failures,
    consoleErrors: [...new Set(errors)],
    behaviorChecks:
      "Navigation, dropdown, Escape, theme persistence, RTL, cart panel, search, filters, sorting, gallery, tabs, quantity, enquiry prefill, validation, policy focus, countdown",
  };
  fs.writeFileSync("tests/audit-report.json", JSON.stringify(report, null, 2));
  await browser.close();
  console.log(
    JSON.stringify({
      checks,
      failures: failures.length,
      errors: [...new Set(errors)],
    }),
  );
  assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 8), null, 2));
  assert.equal(errors.length, 0, "No browser errors");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
