/**
 * E2E tests - Game Hub
 * Run: npm run test:e2e
 * Prerequisites: npm install, npm run dev (or CI runs it)
 */
import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows Game Hub title", async ({ page }) => {
    await page.goto("/pages/home/index.html");
    await expect(page.locator("h1")).toContainText("Game Hub");
  });

  test("game cards exist", async ({ page }) => {
    await page.goto("/pages/home/index.html");
    await expect(page.locator(".game-card--ttt")).toBeVisible();
    await expect(page.locator(".game-card--snake")).toBeVisible();
    await expect(page.locator(".game-card--login")).toBeVisible();
  });

  test("theme toggle works", async ({ page }) => {
    await page.goto("/pages/home/index.html");
    await expect(page.locator("#themeBtn")).toBeVisible();
    await page.click("#themeBtn");
    await expect(page.locator("html")).toHaveClass(/theme-light/);
  });
});
