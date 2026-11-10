/* Offline assets are intentionally scoped only to coding-academy/. */
const CACHE = 'lama-coding-academy-v5';
const ASSETS = ['./', './index.html', './icon.svg', './manifest.webmanifest', './practice.html', './practice.js', './studio.html', './studio.js', './projects-data.js', './python.html', './python-app.js', './python-lessons.js', './python-runner.mjs', './python-harness.py', './python-i18n.js', './progress.html', './progress.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('lama-coding-academy-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const scope = new URL('./', self.location.href);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
