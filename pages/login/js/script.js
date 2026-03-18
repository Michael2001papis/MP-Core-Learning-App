/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
document.addEventListener("DOMContentLoaded", function() {
  if (typeof APP !== "undefined") {
    APP.init();
    APP.updateActivity();
  }
  const pwInput = document.getElementById("signupPassword");
  if (pwInput) {
    pwInput.addEventListener("input", function() {
      const p = this.value;
      const score = (typeof PageUtils !== "undefined" && PageUtils.calcPasswordStrengthScore)
        ? PageUtils.calcPasswordStrengthScore(p)
        : 0;
      const el = document.getElementById("passwordStrength");
      if (el) {
        el.classList.remove("weak","medium","strong");
        const bars = el.querySelectorAll(".strength-bar");
        const text = el.querySelector(".strength-text");
        const color = (typeof PageUtils !== "undefined" && PageUtils.getPasswordStrengthColor)
          ? PageUtils.getPasswordStrengthColor(score)
          : (score<=2?"#ef4444":score<=3?"#f59e0b":"#22c55e");
        bars.forEach((b,i)=>{ b.style.background = i < score ? color : "transparent"; });
        text.textContent = (typeof PageUtils !== "undefined" && PageUtils.getPasswordStrengthLabel)
          ? PageUtils.getPasswordStrengthLabel(score, !!p.length)
          : (p.length ? (score<=2?"חלשה":score<=3?"בינונית":"חזקה") : "");
      }
    });
  }
  // אם המשתמש כבר מחובר – מעבר ישיר, בלי טופס
  const loggedUser = typeof AUTH !== "undefined" && AUTH.getLoggedUser ? AUTH.getLoggedUser() : null;
  if (loggedUser) {
    const returnTo = (typeof PageUtils !== "undefined" && PageUtils.getReturnTo)
      ? PageUtils.getReturnTo(window.location.search)
      : "index";
    const href = (typeof PageUtils !== "undefined" && PageUtils.getHrefForReturnTo)
      ? PageUtils.getHrefForReturnTo(returnTo)
      : "../home/index.html";
    window.location.href = href;
    return;
  }

  const tabBtns = document.querySelectorAll(".tab-btn");
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");
  const signinFormEl = signinForm && signinForm.querySelector("form");
  const signupFormEl = signupForm && signupForm.querySelector("form");
  if (!signinFormEl || !signupFormEl) return;

  function setActiveTab(tab) {
    tabBtns.forEach(function (b) {
      const isActive = b.getAttribute("data-tab") === tab;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-selected", isActive ? "true" : "false");
      b.tabIndex = isActive ? 0 : -1;
    });

    const showSignin = tab === "signin";
    signinForm.classList.toggle("active", showSignin);
    signupForm.classList.toggle("active", !showSignin);
    signinForm.toggleAttribute("hidden", !showSignin);
    signupForm.toggleAttribute("hidden", showSignin);
  }

  function getReturnUrl() {
    return (typeof PageUtils !== "undefined" && PageUtils.getReturnTo)
      ? PageUtils.getReturnTo(window.location.search)
      : "index";
  }

  function redirectAfterLogin() {
    const returnTo = getReturnUrl();
    const href = (typeof PageUtils !== "undefined" && PageUtils.getHrefForReturnTo)
      ? PageUtils.getHrefForReturnTo(returnTo)
      : "../home/index.html";
    window.location.href = href;
  }

  // מעבר בין טאבים
  tabBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      const tab = btn.getAttribute("data-tab");
      setActiveTab(tab);
    });
  });

  // Ensure correct initial visibility (in case HTML/CSS changes)
  setActiveTab(document.querySelector(".tab-btn.active")?.getAttribute("data-tab") || "signin");

  function showMsg(msg, type) {
    if (typeof Toast !== "undefined") {
      if (type === "success") Toast.success(msg);
      else if (type === "error") Toast.error(msg);
      else Toast.info(msg);
    } else alert(msg);
  }

  // התחברות
  signinFormEl.addEventListener("submit", function(e) {
    e.preventDefault();
    const email = this.querySelector('input[name="email"]').value.trim();
    const password = this.querySelector('input[name="password"]').value;
    const result = AUTH.signin(email, password);
    if (result.success) {
      showMsg("ברוך הבא!", "success");
      redirectAfterLogin();
    } else {
      showMsg(result.error, "error");
    }
  });

  // הרשמה
  signupFormEl.addEventListener("submit", function(e) {
    e.preventDefault();
    const name = this.querySelector('input[name="name"]').value.trim();
    const email = this.querySelector('input[name="email"]').value.trim();
    const password = this.querySelector('input[name="password"]').value;
    const result = AUTH.signup(name, email, password);
    if (result.success) {
      showMsg("🎉 ברוך הבא " + name + "! נרשמת בהצלחה.", "success");
      redirectAfterLogin();
    } else {
      showMsg(result.error, "error");
    }
  });
});
