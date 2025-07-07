self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("roomoo-cache").then(cache => {
      return cache.addAll([
        "index.html",
        "script.js",
        "manifest.json",
        "icon.png",
        "icon512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
