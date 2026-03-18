/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
/**
 * Analytics helper - מוכן להטמעת Google Analytics / Plausible
 * להפעלה: הגדר window.GAMEHUB_ANALYTICS = { provider: "ga", id: "G-XXXX" } או
 *          { provider: "plausible", domain: "yoursite.com" }
 * לפני טעינת analytics.js
 */
(function () {
  "use strict";

  var config = (typeof window !== "undefined" && window.GAMEHUB_ANALYTICS) || {};

  function pageview(path, title) {
    if (config.provider === "ga" && config.id && typeof window.gtag === "function") {
      window.gtag("config", config.id, { page_path: path, page_title: title });
    }
    if (config.provider === "plausible" && typeof window.plausible === "function") {
      window.plausible("pageview", { u: path });
    }
  }

  function event(name, props) {
    if (config.provider === "ga" && config.id && typeof window.gtag === "function") {
      window.gtag("event", name, props);
    }
    if (config.provider === "plausible" && typeof window.plausible === "function") {
      window.plausible(name, { props: props });
    }
  }

  window.GameHubAnalytics = {
    pageview: pageview,
    event: event,
    trackGameStart: function (gameName) {
      event("game_start", { game: gameName });
    },
    trackGameEnd: function (gameName, score) {
      event("game_end", { game: gameName, score: score });
    },
    trackLogin: function (method) {
      event("login", { method: method });
    },
    trackSignup: function () {
      event("signup", {});
    },
  };

  // Backwards-compatible alias for older/other modules expecting ANALYTICS.track(...)
  if (typeof window !== "undefined" && !window.ANALYTICS) {
    window.ANALYTICS = {
      track: function (name, props) {
        try { event(name, props || {}); } catch (e) {}
      },
    };
  }

  if (config.provider && (config.id || config.domain)) {
    var path = typeof location !== "undefined" ? (location.pathname || "/") : "/";
    var title = typeof document !== "undefined" && document.title ? document.title : "";
    pageview(path, title);
  }
})();
