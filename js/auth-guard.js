/**
 * Simple auth guard helpers for pages.
 * Keeps page scripts smaller and unit-testable.
 */
(function () {
  "use strict";

  function isLoggedIn(getLoggedUserFn) {
    try {
      var fn = getLoggedUserFn || (typeof AUTH !== "undefined" && AUTH.getLoggedUser);
      return !!(fn && fn());
    } catch (e) {
      return false;
    }
  }

  function getLoginRedirectUrl(returnTo) {
    var r = returnTo || "index";
    return "../login/index.html?return=" + encodeURIComponent(r);
  }

  window.AuthGuard = {
    isLoggedIn: isLoggedIn,
    getLoginRedirectUrl: getLoginRedirectUrl,
  };
})();

