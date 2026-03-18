import "./auth-guard.js";

describe("AuthGuard", () => {
  test("getLoginRedirectUrl encodes return", () => {
    expect(window.AuthGuard.getLoginRedirectUrl("snake")).toBe("../login/index.html?return=snake");
    expect(window.AuthGuard.getLoginRedirectUrl("ttt")).toBe("../login/index.html?return=ttt");
    expect(window.AuthGuard.getLoginRedirectUrl("weird value")).toBe("../login/index.html?return=weird%20value");
  });

  test("isLoggedIn returns false on errors", () => {
    expect(window.AuthGuard.isLoggedIn(() => { throw new Error("x"); })).toBe(false);
  });

  test("isLoggedIn uses provided getter", () => {
    expect(window.AuthGuard.isLoggedIn(() => null)).toBe(false);
    expect(window.AuthGuard.isLoggedIn(() => ({ email: "a@b.com" }))).toBe(true);
  });
});

