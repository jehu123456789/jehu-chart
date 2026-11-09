
const CACHE_NAME = "jehuapp-v4";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.png.png",
  "/video.html",
  "/sicentific.html"
];

// Firebase background notifications
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDCMjsdgXRBf370BSuyhgMgzA8ZZEN9AIU",
  authDomain: "jehuapp-b8928.firebaseapp.com",
  projectId: "jehuapp-b8928",
  storageBucket: "jehuapp-b8928.firebasestorage.app",
  messagingSenderId: "1087051550482",
  appId: "1:1087051550482:web:b2f5bed91d9b4c1d5e6dcb"
});

const messaging = firebase.messaging();

// Install and cache app pages
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(
        FILES_TO_CACHE.map(async file => {
          try {
            const response = await fetch(file);
            if (response.ok) {
              await cache.put(file, response);
            }
          } catch (error) {
            console.log("Could not cache:", file);
          }
        })
      );
    })
  );

  self.skipWaiting();
});

// Activate and remove old JehuApp caches
self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key =>
            key.startsWith("jehuapp-") && key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// Offline page and file support
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Do not cache Supabase, Firebase or other external requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      if (request.mode === "navigate") {
        try {
          const response = await fetch(request);

          if (response.ok) {
            await cache.put("/index.html", response.clone());
          }

          return response;
        } catch (error) {
          return (
            await cache.match(request) ||
            await cache.match("/index.html") ||
            await cache.match("/")
          );
        }
      }

      const cached = await cache.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok && response.type === "basic") {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return new Response("You are offline. This file is not saved yet.", {
          status: 503,
          headers: { "Content-Type": "text/plain" }
        });
      }
    })()
  );
});

// Receive background Firebase notifications
messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};

  return self.registration.showNotification(
    data.title || "JehuApp notification",
    {
      body: data.body || "You have a new notification.",
      icon: "/icon.png.png",
      badge: "/icon.png.png",
      tag: data.callId || "jehuapp-notification",
      renotify: true,
      data: {
        url: data.url || "/",
        callId: data.callId || ""
      }
    }
  );
});

// Open JehuApp when notification is clicked
self.addEventListener("notificationclick", event => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
