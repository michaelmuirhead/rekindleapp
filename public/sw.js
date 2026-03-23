// ReKindle Students - Service Worker
// Auto-updates the PWA when new versions are deployed

const CACHE_NAME = 'rekindle-v1';

// Install: skip waiting so new SW activates immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activate: claim all clients and clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first strategy
// Always tries the network for fresh content, falls back to cache if offline
self.addEventListener('fetch', (e) => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Clone and cache the fresh response
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return res;
      })
      .catch(() => {
        // Offline: serve from cache
        return caches.match(e.request);
      })
  );
});

// Listen for messages to trigger update
self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
