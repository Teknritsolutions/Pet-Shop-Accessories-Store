const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const route of ["contact"]) {
    await page.goto(`http://127.0.0.1:4173/pages/${route}.html`, { waitUntil: "networkidle" });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
      for (const width of [320, 390, 820, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
          ),
        );
        if (width === 390 || width === 1440)
          await page.screenshot({
            path: `tests/screenshots/${route}-${theme}-${width}.png`,
            fullPage: true,
          });
      }
    }
  }
  await page.goto("http://127.0.0.1:4173/pages/contact.html");
  await page.setViewportSize({ width: 320, height: 900 });
  await page.locator("#menu-toggle").click();
  await page.locator(".main-nav .nav-dropdown-toggle").click();
  await expect(page.locator("#home-submenu")).toBeVisible();
  await page.locator("[data-direction-mobile]").click();
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  await page.goto("http://127.0.0.1:4173/pages/blog.html");
  for (const width of [320, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const note = page.locator(".care-notes").first();
    await note.locator("summary").click();
    await expect(note).toHaveAttribute("open", "");
    await expect(note.locator(".care-notes-body")).toBeVisible();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
    );
    await note.locator("summary").click();
    await expect(note).not.toHaveAttribute("open", "");
  }
  await browser.close();
  console.log("Mobile contact, navigation, RTL, and inline care-tip checks passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
