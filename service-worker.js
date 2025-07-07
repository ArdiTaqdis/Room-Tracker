const CACHE_VERSION = new Date().toISOString().slice(0, 10); // Versi harian
const CACHE_NAME = `roomoo-v3${CACHE_VERSION}`;

const urlsToCache = [
  "index.html",
  "manifest.json",
  "icon.png",
  "icon512.png",
  "script.js"
];

self.addEventListener("install", (event) => {
  console.log(`🔧 Installing Service Worker: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching app shell...");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("✅ Activating Service Worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🧹 Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
