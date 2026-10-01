/* Cambia la versión cada vez que subas cambios, así el celular descarga lo nuevo. */
const CACHE = "vibracion33-v1.5.0";
const CACHE_MAZO = "vibracion33-mazo";   // ilustraciones de las cartas (no se borra al actualizar)
const BASE = ["./","index.html","manifest.json","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== CACHE_MAZO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put("index.html", c)); return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const destino = req.url.includes("upload.wikimedia.org") ? CACHE_MAZO : CACHE;
        const copia = res.clone(); caches.open(destino).then(c => c.put(req, copia));
      }
      return res;
    }))
  );
});
