// Lama School Suite: online-first PWA shell. Do not cache school records or credentials.
const CACHE_NAME = 'lama-school-shell-v1';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  // Network-only: never serve stale authenticated dashboards or school data.
  // This fetch handler enables installability on browsers that require one.
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});
