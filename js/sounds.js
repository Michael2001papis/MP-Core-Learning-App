/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
/**
 * אפקטי סאונד - Web Audio API (ללא קבצי אודיו חיצוניים)
 */
const SOUNDS = {
  _ctx: null,
  _muted: false,

  init() {
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._muted = localStorage.getItem("gameHubMuted") === "true";
    } catch (e) {
      console.warn("Audio not supported");
    }
  },

  play(freq, duration, type = "sine") {
    if (this._muted || !this._ctx) return;
    try {
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.connect(gain);
      gain.connect(this._ctx.destination);
      osc.frequency.value = freq;
      osc.type = type;
      gain.gain.setValueAtTime(0.15, this._ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this._ctx.currentTime + duration);
      osc.start(this._ctx.currentTime);
      osc.stop(this._ctx.currentTime + duration);
    } catch (e) {}
  },

  click() {
    this.play(600, 0.08, "sine");
  },

  eat() {
    this.play(880, 0.1, "sine");
    setTimeout(() => this.play(1100, 0.08, "sine"), 80);
  },

  win() {
    this.play(523, 0.15);
    setTimeout(() => this.play(659, 0.15), 120);
    setTimeout(() => this.play(784, 0.15), 240);
    setTimeout(() => this.play(1047, 0.3), 360);
  },

  tie() {
    this.play(440, 0.2);
    setTimeout(() => this.play(440, 0.2), 150);
  },

  toggleMute() {
    this._muted = !this._muted;
    localStorage.setItem("gameHubMuted", this._muted);
    return this._muted;
  },

  isMuted() {
    return this._muted;
  }
};
