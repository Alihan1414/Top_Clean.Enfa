// TopClean v5.0 Service Worker — Stale-While-Revalidate (Remastered)
const CACHE_NAME = 'topclean-cache-v5.0';
const DYNAMIC_CACHE = 'topclean-dynamic-v5.0';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './icon-512.png',
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

// Fetch: Stale-While-Revalidate stratejisi
// Önce cache'den hızlıca göster, arka planda ağdan güncelle
self.addEventListener('fetch', (event) => {
    // Sadece GET isteklerini cache'le
    if (event.request.method !== 'GET') return;

    // Firebase API isteklerini cache'leme
    if (event.request.url.includes('firebaseio.com') ||
        event.request.url.includes('googleapis.com')) {
        return event.respondWith(fetch(event.request));
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Başarılı ağ yanıtını cache'e yaz
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => null);

                // Cache varsa hemen döndür, yoksa ağı bekle
                return cachedResponse || fetchPromise;
            });
        })
    );
});
