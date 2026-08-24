/**
 * lamaPixelStudio - Service Worker
 * Caches essential shell assets and tools for 100% offline browser operation.
 */

const CACHE_NAME = 'lamapixelstudio-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './style.css',
  './tools/resizer.html',
  './tools/compressor.html',
  './tools/cropper.html',
  './tools/png-to-jpg.html',
  './tools/svg-converter.html',
  './tools/jpg-to-png.html',
  './tools/webp-to-jpg.html',
  './tools/color-picker.html',
  './platforms/android.html',
  './platforms/ios.html',
  './info/about.html',
  './info/contact.html',
  './info/privacy.html',
  './info/terms.html',
  './js/app.js',
  './js/compressor.js',
  './js/cropper.js',
  './js/png-to-jpg.js',
  './js/svg-converter.js',
  './js/jpg-to-png.js',
  './js/webp-to-jpg.js',
  './js/color-picker.js',
  './manifest.json'
];

// Install Event - Cache all core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches if version updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Optional fallback for offline navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
