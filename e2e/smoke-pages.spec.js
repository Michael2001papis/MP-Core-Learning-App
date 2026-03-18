import { test, expect } from "@playwright/test";

const CASES = [
  { path: "/pages/home/index.html", allowLoginRedirect: false },
  { path: "/pages/login/index.html", allowLoginRedirect: false },
  // Games may redirect to login when user isn't authenticated.
  { path: "/pages/games/snake/index.html", allowLoginRedirect: true },
  { path: "/pages/games/tic-tac-toe/index.html", allowLoginRedirect: true },
  { path: "/pages/about/index.html", allowLoginRedirect: false },
  { path: "/pages/contact/index.html", allowLoginRedirect: false },
  { path: "/pages/privacy/index.html", allowLoginRedirect: false },
  { path: "/pages/terms/index.html", allowLoginRedirect: false },
  { path: "/pages/404/index.html", allowLoginRedirect: false },
];

test.describe("Smoke: core pages", () => {
  for (const { path, allowLoginRedirect } of CASES) {
    test(`loads without console errors: ${path}`, async ({ page }) => {
      const consoleErrors = [];
      const failedRequests = [];

      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text() || "";
        // Firefox may report Google Fonts failures as console errors; not an app JS error.
        if (text.includes("downloadable font: download failed")) return;
        consoleErrors.push(text);
      });

      page.on("requestfailed", (req) => {
        failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
      });

      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res, "navigation response should exist").toBeTruthy();
      expect(res.status(), `HTTP status for ${path}`).toBeLessThan(400);

      // Let late scripts/styles settle.
      await page.waitForTimeout(600);

      const finalUrl = page.url();
      if (allowLoginRedirect) {
        const ok = finalUrl.includes(path) || finalUrl.includes("/pages/login/index.html");
        expect(ok, `Expected ${path} to load or redirect to login, got ${finalUrl}`).toBe(true);
      } else {
        expect(finalUrl, `Unexpected redirect from ${path} to ${finalUrl}`).toContain(path);
      }

      expect(consoleErrors, `Console errors on ${path}`).toEqual([]);

      const relevantFailures = failedRequests.filter((f) => {
        if (!f.url) return false;
        // Ignore third-party font requests.
        if (f.url.includes("fonts.googleapis.com") || f.url.includes("fonts.gstatic.com")) return false;
        // Ignore aborted requests caused by navigation/redirects.
        if (String(f.failure || "").includes("ERR_ABORTED") || String(f.failure || "").includes("NS_BINDING_ABORTED")) return false;
        return true;
      });
      expect(relevantFailures, `Failed requests on ${path}`).toEqual([]);
    });
  }
});

