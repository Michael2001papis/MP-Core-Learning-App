/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
/**
 * Unit tests for AUTH module
 * הערה: auth.js נטען כ-script רגיל בדפדפן. הבדיקות משכפלות את הלוגיקה
 * כדי לבדוק אותה – יש לשמור סנכרון עם auth.js בעדכונים.
 * Run: npm test
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

const mockStorage = {};
const localStorageMock = {
  getItem: (k) => mockStorage[k] ?? null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
};
vi.stubGlobal("localStorage", localStorageMock);

// לוגיקה זהה ל-auth.js – יש לעדכן בעת שינוי auth.js
const AUTH = {
  USERS_KEY: "gameHubUsers",
  LOGGED_KEY: "loggedInUser",
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.USERS_KEY) || "[]");
    } catch {
      return [];
    }
  },
  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },
  getLoggedUser() {
    try {
      return JSON.parse(localStorage.getItem(this.LOGGED_KEY) || "null");
    } catch {
      return null;
    }
  },
  setLoggedUser(user) {
    if (user) {
      localStorage.setItem(this.LOGGED_KEY, JSON.stringify({ name: user.name, email: user.email, avatar: user.avatar || "👤" }));
    } else {
      localStorage.removeItem(this.LOGGED_KEY);
    }
  },
  logout() {
    this.setLoggedUser(null);
  },
  _validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
  },
  signup(name, email, password) {
    const em = (email || "").trim().toLowerCase();
    if (!em) return { success: false, error: "יש להזין כתובת אימייל." };
    if (!this._validEmail(em)) return { success: false, error: "כתובת האימייל אינה תקינה." };
    if ((password || "").length < 6) return { success: false, error: "הסיסמה חייבת להכיל לפחות 6 תווים." };
    if (!(name || "").trim()) return { success: false, error: "יש להזין שם." };
    const users = this.getUsers();
    if (users.some((u) => u.email === em)) {
      return { success: false, error: "אימייל זה כבר רשום. נסה להתחבר." };
    }
    users.push({ name: name.trim(), email: em, password, avatar: "👤" });
    this.saveUsers(users);
    this.setLoggedUser({ name: name.trim(), email: em, avatar: "👤" });
    return { success: true, isNewUser: true };
  },
  signin(email, password) {
    const em = (email || "").trim().toLowerCase();
    if (!em) return { success: false, error: "יש להזין כתובת אימייל." };
    if (!this._validEmail(em)) return { success: false, error: "כתובת האימייל אינה תקינה." };
    if (!(password || "").length) return { success: false, error: "יש להזין סיסמה." };
    const users = this.getUsers();
    const user = users.find((u) => u.email === em && u.password === password);
    if (!user) {
      return { success: false, error: "אימייל או סיסמה שגויים." };
    }
    this.setLoggedUser({ name: user.name, email: user.email, avatar: user.avatar || "👤" });
    return { success: true, isNewUser: false };
  },
};

describe("AUTH", () => {
  beforeEach(() => {
    mockStorage[AUTH.USERS_KEY] = "[]";
    mockStorage[AUTH.LOGGED_KEY] = "null";
  });

  describe("_validEmail", () => {
    it("accepts valid email", () => {
      expect(AUTH._validEmail("test@example.com")).toBe(true);
      expect(AUTH._validEmail("user@domain.co.il")).toBe(true);
    });
    it("rejects invalid email", () => {
      expect(AUTH._validEmail("")).toBe(false);
      expect(AUTH._validEmail("no-at")).toBe(false);
      expect(AUTH._validEmail("@nodomain")).toBe(false);
    });
  });

  describe("signup", () => {
    it("registers new user", () => {
      const r = AUTH.signup("Miki", "miki@test.com", "secret123");
      expect(r.success).toBe(true);
      expect(r.isNewUser).toBe(true);
      expect(AUTH.getLoggedUser()).toMatchObject({ name: "Miki", email: "miki@test.com" });
    });
    it("rejects short password", () => {
      const r = AUTH.signup("Miki", "m@t.com", "123");
      expect(r.success).toBe(false);
      expect(r.error).toContain("6");
    });
    it("rejects duplicate email", () => {
      AUTH.signup("First", "same@x.com", "pass1234");
      const r = AUTH.signup("Second", "same@x.com", "other123");
      expect(r.success).toBe(false);
    });
  });

  describe("signin", () => {
    beforeEach(() => {
      AUTH.signup("User", "u@x.com", "mypass");
      AUTH.logout();
    });
    it("logs in with correct credentials", () => {
      const r = AUTH.signin("u@x.com", "mypass");
      expect(r.success).toBe(true);
      expect(AUTH.getLoggedUser().email).toBe("u@x.com");
    });
    it("rejects wrong password", () => {
      const r = AUTH.signin("u@x.com", "wrong");
      expect(r.success).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears logged user", () => {
      AUTH.signup("X", "x@y.com", "pass1234");
      expect(AUTH.getLoggedUser()).not.toBeNull();
      AUTH.logout();
      expect(AUTH.getLoggedUser()).toBeNull();
    });
  });
});
