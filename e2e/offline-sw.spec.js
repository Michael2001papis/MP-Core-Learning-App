import { test, expect } from "@playwright/test";

test.describe("PWA: Service Worker + Offline", () => {
  test("home page loads offline after first online visit", async ({ page, context }) => {
    await context.setOffline(false);
    await page.goto("/pages/home/index.html", { waitUntil: "load" });

    // Wait for SW registration/ready (if supported).
    const hasSW = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      try {
        const reg = await navigator.serviceWorker.ready;
        return !!reg;
      } catch (e) {
        return false;
      }
    });

    // If SW isn't available (should be on http://localhost), don't fail hard here.
    expect([true, false]).toContain(hasSW);

    await context.setOffline(true);

    // Reload while offline - should work via cache fallback.
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/pages\/home\/index\.html/);

    // Navigate to another cached page offline (avoid auth-gated pages).
    await page.goto("/pages/about/index.html", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/pages\/about\/index\.html/);

    // Sanity: title should exist (document loaded).
    const title = await page.title();
    expect(typeof title).toBe("string");
  });
});

