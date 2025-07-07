const CACHE_NAME = "roomoo-v1";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "icon.png",
  "icon512.png",
  "script.js",
  "style.css"
];

// Saat pertama kali install, simpan file ke cache
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker: Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching files...");
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktifkan dan hapus cache lama jika ada
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker: Activated");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🧹 Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Ambil file dari cache jika offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((res) => {
        return res || fetch(event.request);
      })
  );
});
