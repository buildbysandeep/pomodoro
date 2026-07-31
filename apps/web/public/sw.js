const CACHE_NAME = "pomodoro-v1";
const PRECACHE_ASSETS = ["/", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  // Network-first for API calls, cache fallback
  if (request.url.includes("/api/") || request.url.includes("/socket.io/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Stale-while-revalidate for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? { title: "Pomodoro", body: "" };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-sessions") {
    event.waitUntil(syncPendingSessions());
  }
});

async function syncPendingSessions() {
  // Background sync placeholder: read from IndexedDB and send to server
  // Implementation would queue sessions in IndexedDB while offline
}
