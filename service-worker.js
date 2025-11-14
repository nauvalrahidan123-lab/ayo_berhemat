
const CACHE_NAME = 'student-finance-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return from cache if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Don't cache chrome-extension requests
          if (event.request.url.startsWith('chrome-extension://')) {
            return networkResponse;
          }

          // Cache the new response
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
      .catch((error) => {
        // This is a simplified example, in a real app you might want to
        // return a fallback page here.
        console.error('Service Worker: Error fetching resource:', error);
      })
  );
});
