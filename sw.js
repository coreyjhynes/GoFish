/* GoFish service worker — offline shell.
   Same-origin GETs: stale-while-revalidate (app shell, data, libs).
   Cross-origin GETs (tiles, forecasts): network-first, falling back to the
   last cached copy — so visited chart areas and the last forecast still
   render 60 miles from a cell tower. */
const SHELL = "gbi-shell-v1";
const EXT = "gbi-ext-v1";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(["./", "./index.html"])));
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  if (url.origin === location.origin) {
    // stale-while-revalidate — waitUntil keeps the background refetch alive
    // after we respond, otherwise the cache never actually updates
    const work = caches.open(SHELL).then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => {
        if (r && r.ok) c.put(e.request, r.clone());
        return r;
      }).catch(() => hit);
      return { hit, net };
    });
    e.respondWith(work.then(w => w.hit || w.net));
    e.waitUntil(work.then(w => w.net).catch(() => {}));
  } else {
    // network-first with cached fallback (tiles, APIs)
    e.respondWith(
      fetch(e.request).then(r => {
        if (r && (r.ok || r.type === "opaque")) {
          const clone = r.clone();
          caches.open(EXT).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return r;
      }).catch(() => caches.match(e.request))
    );
  }
});
