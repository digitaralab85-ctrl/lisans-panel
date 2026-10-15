// DigitaraLab Lisans — çevrimdışı kabuk. Yalnız bu sitenin kendi dosyaları önbelleğe girer;
// JSONBin (başka köken) isteklerine hiç dokunulmaz. Sayfa her açılışta önce ağdan istenir.
const CACHE = 'dl-lisans-0.3.2-51cc77f7fd';
const SHELL = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('dl-lisans-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put('./', c)); }
      return r;
    }).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
