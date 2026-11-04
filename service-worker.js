const CACHE_NAME = "jehuapp-v2";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});

 document.getElementById("webSearchForm")
.addEventListener("submit", function(event) {
   event.preventDefault();

  const query = document.getElementById("webSearchInput")
     .value.trim();

  if (!query) return;

  const searchURL =
   "https://www.google.com/search?q=" +
   encodeURIComponent(query) +
    "&safe=active";

   window.open(searchURL, "_blank", "noopener,noreferrer");
});




const CACHE_NAME = "jehuapp-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.png.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(response =>
        response || caches.match("/")
      )
    )
  );
});



