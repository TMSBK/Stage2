var staticCacheName = 'restaurant-reviews-v1';

//Caching main content while installing Service Worker

self.addEventListener('install', function(event) {
    event.waitUntil (
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll([
                '/',
                'js/main.js',
                'js/restaurant_info.js',
                'js/dbhelper.js',
                'css/styles.css',   
            ]);
        })
    );
});

// Deletes old Cache on an update

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('restaurant-') &&
                           cacheName != staticCacheName;
                }).map(function(cacheName) {
                    return cache.delete(cacheName);
                })
            );
        })
    );
});

//Downloads content from Cache, if it's reachable

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if(response) return response;
            return fetch(event.request);
        })
    );
});
