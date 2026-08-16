const KASA = "tki-rezerv-v2";
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
  e.respondWith(caches.match(e.request).then(v => v || fetch(e.request).then(y => {
    if(y.ok && new URL(e.request.url).origin === location.origin){
      const kopya = y.clone();
      caches.open(KASA).then(c => c.put(e.request, kopya));
    }
    return y;
  }).catch(() => caches.match("./index.html"))));
});
