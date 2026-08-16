/* Sürüm değişince eski önbellek silinir. Güncelleme yaparken KASA numarasını artırın. */
const KASA = "tki-rezerv-v3";
const DOSYALAR = ["./","./index.html","./manifest.json","./icon-192.png",
                  "./icon-512.png","./icon-maskable.png","./apple-touch-icon.png","./favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(KASA).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== KASA).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  const sayfaMi = e.request.mode === "navigate" || e.request.destination === "document";

  if(sayfaMi){
    /* Sayfa: önce ağdan al, yoksa önbellekten ver — güncelleme hep görünür */
    e.respondWith(
      fetch(e.request).then(y => {
        const kopya = y.clone();
        caches.open(KASA).then(c => c.put("./index.html", kopya));
        return y;
      }).catch(() => caches.match("./index.html").then(v => v || caches.match("./")))
    );
    return;
  }

  /* Diğer dosyalar: önbellekten ver, arka planda tazele */
  e.respondWith(
    caches.match(e.request).then(v => {
      const agdan = fetch(e.request).then(y => {
        if(y.ok && new URL(e.request.url).origin === location.origin){
          const kopya = y.clone();
          caches.open(KASA).then(c => c.put(e.request, kopya));
        }
        return y;
      }).catch(() => v);
      return v || agdan;
    })
  );
});
