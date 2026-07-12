const CACHE_NAME = "assetflow-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/dashboard",
  "/login",
  "https://cdn-icons-png.flaticon.com/512/3616/3616223.png"
];

// Install Service Worker
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker
self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

// Cache intercept fetch
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        if (cachedResponse.redirected) {
          return Response.redirect(cachedResponse.url, 307);
        }
        return cachedResponse;
      }
      return fetch(e.request).then((response) => {
        if (response.redirected) {
          return Response.redirect(response.url, 307);
        }
        return response;
      }).catch(() => {
        // Fallback for API offline loads
        return new Response("AssetFlow Offline Service Active: Server connection disconnected.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" })
        });
      });
    })
  );
});
