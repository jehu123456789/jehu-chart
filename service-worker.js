const CACHE_NAME = "jehuapp-v1";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/video.html",
  "/sicentific.html",
  "/icon-192.png",
  "/icon-512.png"
];

// Install and save the app files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Load pages and files
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Do not cache Supabase requests
  if (url.hostname.includes("supabase.co")) return;

  // Pages: try internet first, then saved page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          return await caches.match(request) ||
                 await caches.match("/index.html");
        })
    );
    return;
  }

  // Other files: use saved copy first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});







