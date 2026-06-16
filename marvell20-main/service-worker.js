const CACHE_NAME = "marvell-20-v90";
const APP_SHELL = [
  "./index.html",
  "./photobooth.html",
  "./app.js",
  "./styles.css",
  "./invitation.css",
  "./invitation.js",
  "./manifest.json",
  "./icons/marvell-logo-favicon.svg",
  "./icons/apple-touch-icon.png",
  "./background.PNG",
  "./burgundy.png",
  "./singleblack.png",
  "./singlegarden.webp",
  "./stripburgundy.jpeg",
  "./stripblack.png",
  "./stripgarden.png",
  "./vendor/gifenc.global.js",
  "./vendor/gifenc.esm.js",
  "./whattoexpect.webp",
  "./lily.mp4",
  "./JOHN_MICHEL_CELLO-SAINT_SAENS_CARNIVAL_OF_ANIMALS_THE_SWAN.mp3",
  "./JOHN_MICHEL_CELLO-SAINT_SAENS_CARNIVAL_OF_ANIMALS_THE_SWAN.ogg",
  "./marvell florist logo.svg",
  "./marvell-florist-logo-outline.svg",
  "./Inter-VariableFont_opsz,wght.ttf",
  "./Inter-Italic-VariableFont_opsz,wght.ttf",
  "./Relationship of mélodrame.ttf",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(APP_SHELL.map((asset) => cache.add(asset))).then((results) => {
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.warn(`[service-worker] Skipping uncached optional asset: ${APP_SHELL[index]}`);
          }
        });
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/d/") ||
    url.pathname.startsWith("/image/") ||
    url.pathname.startsWith("/archive/image/")
  ) return;

  const fileName = url.pathname.split("/").pop() || "index.html";
  const freshFiles = new Set([
    "index.html",
    "photobooth.html",
    "invitation.js",
    "invitation.css",
    "app.js",
    "styles.css",
    "service-worker.js",
  ]);
  const shouldFetchFresh = event.request.mode === "navigate" || freshFiles.has(fileName);

  event.respondWith(
    fetch(event.request).then((response) => {
      if (!response.ok) return response;
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => {
      if (shouldFetchFresh) {
        return caches.match(event.request).then((cached) => cached || caches.match("./photobooth.html") || caches.match("./index.html"));
      }

      return caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          if (!response.ok) return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        }).catch(() => caches.match("./photobooth.html") || caches.match("./index.html"));
      });
    })
  );
});
