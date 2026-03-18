import "./page-utils.js";

describe("PageUtils", () => {
  test("getHrefForReturnTo routes correctly", () => {
    expect(window.PageUtils.getHrefForReturnTo("ttt")).toBe("../games/tic-tac-toe/index.html");
    expect(window.PageUtils.getHrefForReturnTo("snake")).toBe("../games/snake/index.html");
    expect(window.PageUtils.getHrefForReturnTo("index")).toBe("../home/index.html");
    expect(window.PageUtils.getHrefForReturnTo("anything")).toBe("../home/index.html");
  });

  test("getReturnTo reads query param", () => {
    expect(window.PageUtils.getReturnTo("?return=snake")).toBe("snake");
    expect(window.PageUtils.getReturnTo("?return=ttt")).toBe("ttt");
    expect(window.PageUtils.getReturnTo("")).toBe("index");
    expect(window.PageUtils.getReturnTo("?")).toBe("index");
  });

  test("calcPasswordStrengthScore returns 0..5", () => {
    expect(window.PageUtils.calcPasswordStrengthScore("")).toBe(0);
    expect(window.PageUtils.calcPasswordStrengthScore("12345")).toBe(1); // >=6 false
    expect(window.PageUtils.calcPasswordStrengthScore("123456")).toBeGreaterThanOrEqual(1);
    expect(window.PageUtils.calcPasswordStrengthScore("Aa123456!")).toBeGreaterThanOrEqual(4);
    expect(window.PageUtils.calcPasswordStrengthScore("Aa1234567890!")).toBeLessThanOrEqual(5);
  });

  test("strength label behavior", () => {
    expect(window.PageUtils.getPasswordStrengthLabel(2, true)).toBe("חלשה");
    expect(window.PageUtils.getPasswordStrengthLabel(3, true)).toBe("בינונית");
    expect(window.PageUtils.getPasswordStrengthLabel(4, true)).toBe("חזקה");
    expect(window.PageUtils.getPasswordStrengthLabel(4, false)).toBe("");
  });
});

