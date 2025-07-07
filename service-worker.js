const CACHE_NAME = "roomoo-v7"; // Ganti versi saat update file
const urlsToCache = [
  "index.html",
  "script.js",
  "manifest.json",
  "icon.png",
  "icon512.png"
];

// Saat instalasi pertama
self.addEventListener("install", event => {
  console.log("📦 Installing Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("✅ Caching app shell...");
      return cache.addAll(urlsToCache);
    })
  );
});

// Saat aktivasi, hapus cache versi lama
self.addEventListener("activate", event => {
  console.log("⚙️ Activating Service Worker...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      );
    })
  );
  return self.clients.claim();
});

// Intersep permintaan fetch
self.addEventListener("fetch", event => {
  const requestURL = new URL(event.request.url);

  // Hanya cache GET dari origin yang sama
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            requestURL.origin === location.origin
          ) {
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, networkResponse.clone())
            );
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // fallback ke cache jika offline
      return cachedResponse || fetchPromise;
    })
  );
});
