
const CACHE_NAME = "jehuapp-v1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
    })()
  );
});

// Keep requests online so private account
// pages and messages are not stored in cache.
self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});
