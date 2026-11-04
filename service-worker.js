
const CACHE_NAME = "jehuapp-v3";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.png.png"
];

// Firebase configuration
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

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
    ])
  );
});

// Offline support
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

// Receive background Firebase notifications
messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};

  const title = data.title || "JehuApp incoming call";

  const options = {
    body: data.body || "Someone is trying to reach you on JehuApp.",
    icon: "/icon.png.png",
    badge: "/icon.png.png",
    tag: data.callId || "jehuapp-notification",
    renotify: true,
    data: {
      url: data.url || "/",
      callId: data.callId || ""
    }
  };

  return self.registration.showNotification(title, options);
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
