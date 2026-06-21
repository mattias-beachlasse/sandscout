/* SandScout service worker (network-first app shell so updates show immediately) */
const CACHE = 'sandscout-v3';
const ASSETS = ['index.html', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{})); });
self.addEventListener('activate', e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    e.respondWith(fetch(req).then(resp => { const c = resp.clone(); caches.open(CACHE).then(ca => ca.put('index.html', c)).catch(()=>{}); return resp; }).catch(() => caches.match('index.html')));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => { const c = resp.clone(); caches.open(CACHE).then(ca => ca.put(req, c)).catch(()=>{}); return resp; })));
  }
});
