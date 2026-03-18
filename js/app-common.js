/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
/**
 * פונקציות משותפות: theme, clock, session, accessibility
 */
const APP = {
  ACCESSIBILITY_KEY: "gameHubAccessibility",

  init() {
    if (typeof console !== "undefined" && console.info) {
      console.info("%c© 2025–2026 מיכאל פפיסמדוב. GssWuoly (Game Hub). כל הזכויות שמורות.", "font-size:11px;color:#6366f1;");
    }
    this.applyTheme();
    this.initThemeBtn();
    this.applyAccessibility();
    this.initClock();
    this.touchToInitAudio();
    this.startActivityTracking();
    this.initAccessibilityModal();
    this.initMoreMenu();
    this.initErrorHandler();
  },

  initErrorHandler() {
    window.addEventListener("unhandledrejection", function(e) {
      var msg = ((e.reason && (e.reason.message || String(e.reason))) || "").toLowerCase();
      if (msg.indexOf("fetch") >= 0 || msg.indexOf("network") >= 0 || msg.indexOf("failed") >= 0) {
        if (typeof Toast !== "undefined") Toast.error("בעיית חיבור. בדוק את האינטרנט ונסה שוב.");
      }
    });
  },

  initMoreMenu() {
    var actions = document.querySelector(".app-topbar-actions");
    if (!actions) return;
    if (document.getElementById("moreMenuWrap")) return;
    var p = (location.pathname || "").replace(/\\/g, "/");
    var base = (p.indexOf("/games/") >= 0) ? "../../" : "../";
    var wrap = document.createElement("div");
    wrap.className = "more-menu-wrap";
    wrap.id = "moreMenuWrap";
    wrap.innerHTML = '<button type="button" class="app-icon-btn more-btn" id="moreMenuBtn" aria-label="עוד" aria-expanded="false" aria-haspopup="true">עוד..</button>' +
      '<div class="more-dropdown" id="moreDropdown" role="menu" aria-hidden="true">' +
      '<a href="' + base + 'about/index.html" role="menuitem">אודות</a>' +
      '<a href="' + base + 'contact/index.html" role="menuitem">צור קשר</a>' +
      '<a href="' + base + 'privacy/index.html" role="menuitem">מדיניות פרטיות</a>' +
      '<a href="' + base + 'terms/index.html" role="menuitem">תנאי שימוש</a>' +
      '</div>';
    actions.insertBefore(wrap, actions.firstChild);
    var btn = document.getElementById("moreMenuBtn");
    var dd = document.getElementById("moreDropdown");
    if (!btn || !dd) return;
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      var open = dd.classList.toggle("active");
      btn.setAttribute("aria-expanded", open);
      dd.setAttribute("aria-hidden", !open);
    });
    dd.querySelectorAll("a").forEach(function(a) {
      a.addEventListener("click", function() { dd.classList.remove("active"); btn.setAttribute("aria-expanded", "false"); dd.setAttribute("aria-hidden", "true"); });
    });
    document.addEventListener("click", function closeMore(e) {
      if (!dd.contains(e.target) && e.target !== btn) {
        dd.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
        dd.setAttribute("aria-hidden", "true");
      }
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && dd.classList.contains("active")) {
        dd.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
        dd.setAttribute("aria-hidden", "true");
      }
    });
  },

  getAccessibility() {
    try {
      return JSON.parse(localStorage.getItem(this.ACCESSIBILITY_KEY) || "{}");
    } catch { return {}; }
  },

  setAccessibility(opts) {
    localStorage.setItem(this.ACCESSIBILITY_KEY, JSON.stringify(opts));
    this.applyAccessibility();
  },

  applyAccessibility() {
    const opts = this.getAccessibility();
    const root = document.documentElement;
    root.classList.toggle("a11y-big-text", !!opts.bigText);
    root.classList.toggle("a11y-high-contrast", !!opts.highContrast);
    root.classList.toggle("a11y-reduce-motion", !!opts.reduceMotion);
    root.classList.toggle("a11y-focus-visible", !!opts.focusVisible);
    root.classList.toggle("a11y-spacing", !!opts.spacing);
    root.classList.toggle("a11y-large-cursor", !!opts.largeCursor);
    root.classList.toggle("a11y-underline-links", !!opts.underlineLinks);
    root.classList.toggle("a11y-dyslexia", !!opts.dyslexiaFont);
  },

  initAccessibilityModal() {
    var modal = document.getElementById("accessibilityModal");
    if (!modal) return;
    var opts = this.getAccessibility();
    var map = { optBigText: "bigText", optHighContrast: "highContrast", optReduceMotion: "reduceMotion", optFocusVisible: "focusVisible", optSpacing: "spacing", optLargeCursor: "largeCursor", optUnderlineLinks: "underlineLinks", optDyslexiaFont: "dyslexiaFont" };
    for (var id in map) {
      var el = document.getElementById(id);
      if (el) el.checked = !!opts[map[id]];
    }
    modal.querySelectorAll("input[type=checkbox]").forEach(function(cb) {
      cb.addEventListener("change", function() {
        var o = APP.getAccessibility();
        o[map[this.id] || this.id] = this.checked;
        APP.setAccessibility(o);
      });
    });
    modal.addEventListener("click", function(e) {
      if (e.target === modal) modal.classList.remove("active");
    });
    var settingsBtn = document.getElementById("settingsBtn");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", function() {
        modal.classList.toggle("active");
      });
    }
    document.addEventListener("keydown", function escClose(e) {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        modal.classList.remove("active");
      }
    });
  },

  startActivityTracking() {
    const update = () => this.updateActivity();
    ["click", "keydown", "scroll"].forEach(ev => document.addEventListener(ev, update, { passive: true }));
    this.updateActivity();
  },

  getTheme() {
    return localStorage.getItem("gameHubTheme") || "dark";
  },

  setTheme(theme) {
    localStorage.setItem("gameHubTheme", theme);
    this.applyTheme();
  },

  applyTheme() {
    const theme = this.getTheme();
    document.documentElement.classList.toggle("theme-light", theme === "light");
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    if (typeof SOUNDS !== "undefined") SOUNDS.init();
    this.updateThemeBtnIcon();
  },

  initThemeBtn() {
    const btn = document.getElementById("themeBtn");
    if (!btn) return;
    this.updateThemeBtnIcon();
    btn.addEventListener("click", () => {
      const next = this.getTheme() === "dark" ? "light" : "dark";
      this.setTheme(next);
    });
  },

  updateThemeBtnIcon() {
    const btn = document.getElementById("themeBtn");
    if (!btn) return;
    btn.textContent = this.getTheme() === "light" ? "☀️" : "🌙";
    btn.title = this.getTheme() === "light" ? "מצב בהיר (לחץ למעבר לכהה)" : "מצב כהה (לחץ למעבר לבהיר)";
    btn.setAttribute("aria-label", this.getTheme() === "light" ? "מצב בהיר – החלף לכהה" : "מצב כהה – החלף לבהיר");
  },

  initClock() {
    const el = document.getElementById("appClock");
    if (!el) return;
    const update = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) +
        " • " + now.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
    };
    update();
    setInterval(update, 1000);
  },

  touchToInitAudio() {
    if (typeof SOUNDS === "undefined") return;
    const init = () => {
      SOUNDS.init();
      document.removeEventListener("click", init);
      document.removeEventListener("touchstart", init);
    };
    document.addEventListener("click", init, { once: true });
    document.addEventListener("touchstart", init, { once: true });
  },

  updateActivity() {
    localStorage.setItem("gameHubLastActivity", Date.now().toString());
  },

  checkSessionTimeout() {
    const TIMEOUT_MS = 10 * 60 * 1000; // 10 דקות
    const last = parseInt(localStorage.getItem("gameHubLastActivity") || "0", 10);
    if (last && Date.now() - last > TIMEOUT_MS && typeof AUTH !== "undefined") {
      AUTH.logout();
      return true;
    }
    return false;
  }
};
