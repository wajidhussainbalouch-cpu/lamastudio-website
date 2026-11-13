/* LAMA Coding Academy PWA — static-asset-only offline cache.
 * Never persist authentication callbacks, query tokens, personalized URLs,
 * or any dynamic request in the service-worker cache.
 * External Pyodide CDN resources are intentionally outside this scope.
 */
const CACHE = 'lama-coding-academy-v12';
const ASSETS = ['./', './index.html', './icon.svg', './manifest.webmanifest', './beginner-coach.js', './beginner-ui.js', './beginner-ui.css', './quiz.html', './quiz-data.js', './quiz-core.js', './quiz-backup.js', './quiz.js', './practice.html', './practice.js', './studio.html', './studio.js', './projects-data.js', './python.html', './python-app.js', './python-lessons.js', './python-runner.mjs', './python-harness.py', './python-i18n.js', './progress.html', './progress.js', './account.html', './account.js', './cloud-config.js', './cloud-core.js', './privacy.html', './diagnostics.html', './diagnostics.js'];
const SCOPE = new URL('./', self.location.href);
const STATIC_ASSETS = new Set(ASSETS.map(asset => new URL(asset, SCOPE).href));

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('lama-coding-academy-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;

  // Auth confirmation/recovery URLs may contain one-time codes in the query.
  // Let the browser/network handle them. Never save these in CacheStorage.
  if (url.search || url.hash || request.cache === 'no-store') return;

  if (!STATIC_ASSETS.has(url.href)) {
    // The service worker never caches or intercepts dynamic requests.
    // Navigation to an unknown offline path may still use the static homepage.
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(() => caches.match(new URL('index.html', SCOPE).href))
      );
    }
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response.ok || response.type !== 'basic' ||
            /(?:private|no-store)/i.test(response.headers.get('cache-control') || '') ||
            response.headers.has('set-cookie')) {
          return response;
        }
        const copy = response.clone();
        return caches.open(CACHE)
          .then(cache => cache.put(request, copy))
          .then(() => response)
          .catch(() => response);
      }).catch(() => request.mode === 'navigate'
        ? caches.match(new URL('index.html', SCOPE).href)
        : Response.error());
    })
  );
});
