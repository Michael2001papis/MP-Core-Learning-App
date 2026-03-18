import { test, expect } from "@playwright/test";

const galaxyS22UltraPortrait = { width: 412, height: 915 };
const galaxyS22UltraLandscape = { width: 915, height: 412 };

const PATHS = [
  "/pages/home/index.html",
  "/pages/login/index.html",
  "/pages/about/index.html",
  "/pages/contact/index.html",
  "/pages/privacy/index.html",
  "/pages/terms/index.html",
  "/pages/404/index.html",
  "/pages/games/snake/index.html",
  "/pages/games/tic-tac-toe/index.html",
];

async function expectNoHorizontalScroll(page) {
  const ok = await page.evaluate(() => {
    const d = document.documentElement;
    return d.scrollWidth <= d.clientWidth + 1;
  });
  expect(ok, "Expected no horizontal scroll").toBe(true);
}

test.describe("Galaxy S22 Ultra", () => {
  for (const viewport of [galaxyS22UltraPortrait, galaxyS22UltraLandscape]) {
    test.describe(`viewport ${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport });

      for (const path of PATHS) {
        test(`no horizontal scroll: ${path}`, async ({ page }) => {
          if (path.includes("/pages/games/")) {
            // Seed a logged-in user so auth-gated pages (games) render fully.
            await page.context().addInitScript(() => {
              try {
                localStorage.setItem("loggedInUser", JSON.stringify({ name: "Test", email: "test@example.com", avatar: "👤" }));
                localStorage.setItem("gameHubUsers", JSON.stringify([{ name: "Test", email: "test@example.com", password: "123456", avatar: "👤" }]));
              } catch (e) {}
            });
          }
          await page.goto(path, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(400);
          await expectNoHorizontalScroll(page);
        });
      }
    });
  }
});

