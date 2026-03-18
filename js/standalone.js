/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
/**
 * תאורה ונגישות – Fallback מינימלי כש-APP לא נטען
 * מקור אמת: app-common.js. קובץ זה רק לגיבוי בדפים בודדים.
 */
(function() {
  var THEME_KEY = "gameHubTheme";
  var A11Y_KEY = "gameHubAccessibility";

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme();
  }

  function applyTheme() {
    var t = getTheme();
    document.documentElement.classList.toggle("theme-light", t === "light");
    document.documentElement.classList.toggle("theme-dark", t === "dark");
    if (typeof SOUNDS !== "undefined") SOUNDS.init();
  }

  function getA11y() {
    try {
      return JSON.parse(localStorage.getItem(A11Y_KEY) || "{}");
    } catch { return {}; }
  }

  function setA11y(opts) {
    localStorage.setItem(A11Y_KEY, JSON.stringify(opts));
    applyA11y(opts);
  }

  function applyA11y(opts) {
    opts = opts || getA11y();
    var r = document.documentElement;
    r.classList.toggle("a11y-big-text", !!opts.bigText);
    r.classList.toggle("a11y-high-contrast", !!opts.highContrast);
    r.classList.toggle("a11y-reduce-motion", !!opts.reduceMotion);
    r.classList.toggle("a11y-focus-visible", !!opts.focusVisible);
    r.classList.toggle("a11y-spacing", !!opts.spacing);
    r.classList.toggle("a11y-large-cursor", !!opts.largeCursor);
    r.classList.toggle("a11y-underline-links", !!opts.underlineLinks);
    r.classList.toggle("a11y-dyslexia", !!opts.dyslexiaFont);
  }

  function initThemeAndA11y() {
    applyTheme();
    if (typeof APP !== "undefined" && APP.initThemeBtn) return;
    var themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", function() {
        var t = getTheme() === "dark" ? "light" : "dark";
        setTheme(t);
        this.textContent = t === "dark" ? "🌙" : "☀️";
      });
      if (getTheme() === "light") themeBtn.textContent = "☀️";
    }
    var modal = document.getElementById("accessibilityModal");
    if (!modal) return;
    var map = {
      optBigText: "bigText", optHighContrast: "highContrast", optReduceMotion: "reduceMotion",
      optFocusVisible: "focusVisible", optSpacing: "spacing",
      optLargeCursor: "largeCursor", optUnderlineLinks: "underlineLinks", optDyslexiaFont: "dyslexiaFont"
    };
    var opts = getA11y();
    for (var id in map) {
      var el = document.getElementById(id);
      if (el) el.checked = !!opts[map[id]];
    }
    modal.querySelectorAll("input[type=checkbox]").forEach(function(cb) {
      cb.addEventListener("change", function() {
        var o = getA11y();
        o[map[this.id] || this.id] = this.checked;
        setA11y(o);
      });
    });
    modal.addEventListener("click", function(e) {
      if (e.target === modal) modal.classList.remove("active");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeAndA11y);
  } else {
    initThemeAndA11y();
  }
  window._standaloneTheme = { getTheme: getTheme, setTheme: setTheme, getA11y: getA11y, setA11y: setA11y, applyA11y: applyA11y };
})();
