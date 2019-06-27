var APP_PREFIX = 'pwatest_'
var VERSION = 'version_01'
var CACHE_NAME = APP_PREFIX + VERSION
var urlsToCache = [
    '/pwatest/',
    '/pwatest/index.html'
]

// Respond with cached resources
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (response) {
            if (response) { // if cache is available, respond with cache
                console.log('responding with cache : ' + e.request.url)
                return response
            }

            console.log('file is not cached, fetching : ' + e.request.url)
            var fetchRequest = event.request.clone();
                
            return fetch(fetchRequest).then(
                function (response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function (cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    )
})

// Cache resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(urlsToCache)
        })
    )
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (cacheNames) {
            var cacheWhitelist = cacheNames.filter(function (cacheName) {
                return cacheName.indexOf(APP_PREFIX)
            })
            cacheWhitelist.push(CACHE_NAME)
            return Promise.all(cacheNames.map(function (cacheName) {
                if (cacheWhitelist.indexOf(cacheName) === -1) {
                    console.log('deleting cache : ' + cacheName)
                    return caches.delete(cacheName)
                }
            }))
        })
    )
})
