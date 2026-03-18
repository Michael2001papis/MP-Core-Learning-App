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
      let score = 0;
      if (p.length >= 6) score++;
      if (p.length >= 10) score++;
      if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
      if (/\d/.test(p)) score++;
      if (/[^a-zA-Z0-9]/.test(p)) score++;
      const el = document.getElementById("passwordStrength");
      if (el) {
        el.classList.remove("weak","medium","strong");
        const bars = el.querySelectorAll(".strength-bar");
        const text = el.querySelector(".strength-text");
        bars.forEach((b,i)=>{ b.style.background = i < score ? (score<=2?"#ef4444":score<=3?"#f59e0b":"#22c55e") : "transparent"; });
        text.textContent = p.length ? (score<=2?"חלשה":score<=3?"בינונית":"חזקה") : "";
      }
    });
  }
  // אם המשתמש כבר מחובר – מעבר ישיר, בלי טופס
  const loggedUser = typeof AUTH !== "undefined" && AUTH.getLoggedUser ? AUTH.getLoggedUser() : null;
  if (loggedUser) {
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get("return") || "index";
    if (returnTo === "ttt") window.location.href = "../games/tic-tac-toe/index.html";
    else if (returnTo === "snake") window.location.href = "../games/snake/index.html";
    else window.location.href = "../home/index.html";
    return;
  }

  const tabBtns = document.querySelectorAll(".tab-btn");
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");
  const signinFormEl = signinForm && signinForm.querySelector("form");
  const signupFormEl = signupForm && signupForm.querySelector("form");
  if (!signinFormEl || !signupFormEl) return;

  function getReturnUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("return") || "index";
  }

  function redirectAfterLogin() {
    const returnTo = getReturnUrl();
    if (returnTo === "ttt") {
      window.location.href = "../games/tic-tac-toe/index.html";
    } else if (returnTo === "snake") {
      window.location.href = "../games/snake/index.html";
    } else {
      window.location.href = "../home/index.html";
    }
  }

  // מעבר בין טאבים
  tabBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      const tab = btn.getAttribute("data-tab");
      
      tabBtns.forEach(function(b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      signinForm.classList.remove("active");
      signupForm.classList.remove("active");

      if (tab === "signin") {
        signinForm.classList.add("active");
      } else {
        signupForm.classList.add("active");
      }
    });
  });

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
