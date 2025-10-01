// Minimal service worker for static caching
const CACHE_NAME = 'ali-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/main.js',
  '/assets/icons/logo-mark.svg',
  '/assets/icons/favicon.svg'
];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(networkRes => {
      const copy = networkRes.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return networkRes;
    }).catch(() => res))
  );
});
