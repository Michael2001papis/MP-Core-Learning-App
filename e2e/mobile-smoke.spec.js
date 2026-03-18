import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["iPhone 12"] });

test.describe("Mobile smoke", () => {
  test("home renders and remains navigable on mobile viewport", async ({ page }) => {
    await page.goto("/pages/home/index.html", { waitUntil: "domcontentloaded" });

    // Basic visible anchors to ensure layout isn't broken.
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("a, button").first()).toBeVisible();

    // Theme toggle exists (as in existing E2E), but don't over-constrain.
    const themeBtn = page.locator("#themeBtn");
    await expect(themeBtn).toHaveCount(1);
  });
});

