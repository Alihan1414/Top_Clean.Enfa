// TopClean v6.1 Service Worker — Post-Refactor
const CACHE_NAME = 'topclean-cache-v6.1';
const DYNAMIC_CACHE = 'topclean-dynamic-v6.1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './icon-512.png',
    './icon-192.png',
    './manifest.json'
];

// Install: Cache tüm varlıkları
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Activate: Eski cache'leri temizle
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Eski cache silindi:', key);
                    return caches.delete(key);
                }
            }))
        ).then(() => self.clients.claim())
    );
});

// Fetch: CDN → DYNAMIC_CACHE, uygulama → CACHE_NAME
self.addEventListener('fetch', (event) => {
    // Sadece GET isteklerini cache'le
    if (event.request.method !== 'GET') return;

    // Firebase API isteklerini cache'leme
    if (event.request.url.includes('firebaseio.com') ||
        event.request.url.includes('googleapis.com')) {
        return event.respondWith(fetch(event.request));
    }

    // CDN istekleri → DYNAMIC_CACHE (stale-while-revalidate)
    const isCDN = event.request.url.includes('cdn.jsdelivr.net') ||
                  event.request.url.includes('cdnjs.cloudflare.com') ||
                  event.request.url.includes('unpkg.com') ||
                  event.request.url.includes('gstatic.com') ||
                  event.request.url.includes('fonts.googleapis.com') ||
                  event.request.url.includes('fonts.gstatic.com');

    const cacheName = isCDN ? DYNAMIC_CACHE : CACHE_NAME;

    event.respondWith(
        caches.open(cacheName).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => null);

                return cachedResponse || fetchPromise;
            });
        })
    );
});
