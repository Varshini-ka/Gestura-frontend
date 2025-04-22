// service-worker.js

const CACHE_NAME = 'gestura-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/static/js/main.*.js', // Adjust based on your app's bundle names
  '/static/css/main.*.css' // Adjust based on your app's bundle names
];

self.addEventListener('install', (event) => {
  console.log('[Gestura SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Gestura SW] Caching files');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Gestura SW] Activated');
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('[Gestura SW] Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Return from cache if available
        }
        return fetch(event.request); // Otherwise, fetch from the network
      })
  );
});
