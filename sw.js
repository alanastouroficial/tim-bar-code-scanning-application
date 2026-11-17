const CACHE = "tim-bsa-v3";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const sameOrigin = e.request.url.startsWith(self.location.origin);
  // Página e arquivos do app: busca a versão nova na rede; sem internet, usa a guardada
  if (sameOrigin) {
    e.respondWith(fetch(e.request).then((res) => {
      if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); }
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html"))));
    return;
  }
  // Fontes: guardadas depois da primeira vez
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    if (res.ok && e.request.url.includes("fonts.g")) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); }
    return res;
  })));
});
