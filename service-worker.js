

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

// document.getElementById("webSearchForm")
// .addEventListener("submit", function(event) {
//   event.preventDefault();

//   const query = document.getElementById("webSearchInput")
//     .value.trim();

//   if (!query) return;

//   const searchURL =
//     "https://www.google.com/search?q=" +
//     encodeURIComponent(query) +
//     "&safe=active";

//   window.open(searchURL, "_blank", "noopener,noreferrer");
// });
