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
                'minimizedImages/1-300_1x.jpg',
                'minimizedImages/1-600_1x.jpg',
                'minimizedImages/1-600_2x.jpg',
                'minimizedImages/10-300_1x.jpg',
                'minimizedImages/10-600_1x.jpg',
                'minimizedImages/10-600_2x.jpg',
                'minimizedImages/2-300_1x.jpg',
                'minimizedImages/2-600_1x.jpg',
                'minimizedImages/2-600_2x.jpg',
                'minimizedImages/3-300_1x.jpg',
                'minimizedImages/3-600_1x.jpg',
                'minimizedImages/3-600_2x.jpg',
                'minimizedImages/4-300_1x.jpg',
                'minimizedImages/4-600_1x.jpg',
                'minimizedImages/4-600_2x.jpg',
                'minimizedImages/5-300_1x.jpg',
                'minimizedImages/5-600_1x.jpg',
                'minimizedImages/5-600_2x.jpg',
                'minimizedImages/6-300_1x.jpg',
                'minimizedImages/6-600_1x.jpg',
                'minimizedImages/6-600_2x.jpg',
                'minimizedImages/7-300_1x.jpg',
                'minimizedImages/7-600_1x.jpg',
                'minimizedImages/7-600_2x.jpg',
                'minimizedImages/8-300_1x.jpg',
                'minimizedImages/8-600_1x.jpg',
                'minimizedImages/8-600_2x.jpg',
                'minimizedImages/9-300_1x.jpg',
                'minimizedImages/9-600_1x.jpg',
                'minimizedImages/9-600_2x.jpg',   
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
                    return cache.delete(cacheName); // eslint-disable-line
                })
            );
        })
    );
});

//Downloads content from Cache, if it's reachable

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if(response) {
                return response;
            } else {
                return fetch(event.request);
            }
        })
    );
});

