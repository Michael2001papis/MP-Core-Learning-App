/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
/**
 * הודעות Toast – במקום alert()
 */
const Toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement("div");
    this.container.id = "toastContainer";
    this.container.setAttribute("aria-live", "polite");
    document.body.appendChild(this.container);
  },

  show(msg, type = "info") {
    this.init();
    const el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.textContent = msg;
    this.container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast--visible"));
    setTimeout(() => {
      el.classList.remove("toast--visible");
      setTimeout(() => el.remove(), 300);
    }, 3500);
  },

  success(msg) { this.show(msg, "success"); },
  error(msg) { this.show(msg, "error"); },
  info(msg) { this.show(msg, "info"); }
};
