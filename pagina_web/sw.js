// UDYCO Detenidos — guarda la página del registro para abrirla sin cobertura
const CACHE = "udyco-movil-1";
self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", ev => {
  if (ev.request.method !== "GET") return;
  ev.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const red = await Promise.race([fetch(ev.request),
        new Promise((_, no) => setTimeout(() => no(new Error("lento")), 4000))]);
      if (red && red.ok) cache.put(ev.request, red.clone());
      return red;
    } catch (_) {
      return (await cache.match(ev.request, { ignoreSearch: true }))
        || (ev.request.mode === "navigate" && await cache.match("./index.html")) || Response.error();
    }
  })());
});
