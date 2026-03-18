/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
(function () {
  "use strict";

  function getReturnTo(search) {
    try {
      var params = new URLSearchParams(search || (typeof window !== "undefined" ? window.location.search : ""));
      return params.get("return") || "index";
    } catch (e) {
      return "index";
    }
  }

  function getHrefForReturnTo(returnTo) {
    if (returnTo === "ttt") return "../games/tic-tac-toe/index.html";
    if (returnTo === "snake") return "../games/snake/index.html";
    return "../home/index.html";
  }

  function calcPasswordStrengthScore(password) {
    var p = String(password || "");
    var score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  }

  function getPasswordStrengthLabel(score, hasInput) {
    if (!hasInput) return "";
    if (score <= 2) return "חלשה";
    if (score <= 3) return "בינונית";
    return "חזקה";
  }

  function getPasswordStrengthColor(score) {
    if (score <= 2) return "#ef4444";
    if (score <= 3) return "#f59e0b";
    return "#22c55e";
  }

  window.PageUtils = {
    getReturnTo: getReturnTo,
    getHrefForReturnTo: getHrefForReturnTo,
    calcPasswordStrengthScore: calcPasswordStrengthScore,
    getPasswordStrengthLabel: getPasswordStrengthLabel,
    getPasswordStrengthColor: getPasswordStrengthColor,
  };
})();

