/**
 * © 2025–2026 מיכאל פפיסמדוב. כל הזכויות שמורות. GssWuoly (Game Hub).
 * Source: https://github.com/Michael2001papis/GssWuoly.git | עודכן: 2025
 */
/**
 * Service Worker - Game Hub
 * Network First – רענון רגיל תמיד יביא גרסה עדכנית
 * Cache רק כ-fallback כשאין אינטרנט (Offline)
 */
const CACHE_NAME = "gamehub-v3";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/pages/home/index.html",
  "/pages/login/index.html",
  "/pages/about/index.html",
  "/pages/contact/index.html",
  "/pages/terms/index.html",
  "/pages/privacy/index.html",
  "/pages/404/index.html",
  "/pages/games/tic-tac-toe/index.html",
  "/pages/games/snake/index.html",
  "/css/app.css",
  "/js/auth.js",
  "/js/analytics.js",
  "/js/app-common.js",
  "/js/standalone.js",
  "/js/toast.js",
  "/js/sounds.js",
  "/assets/favicon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function networkFirstFallbackCache(request) {
  return fetch(request).then((res) => {
    if (res.ok && (request.mode === "navigate" || request.url.match(/\.(js|css|svg|json)$/))) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(request, clone));
    }
    return res;
  }).catch(() => caches.match(request));
}

self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate" && !e.request.url.match(/\.(js|css|svg|json|woff2?)$/)) return;
  e.respondWith(networkFirstFallbackCache(e.request));
});
