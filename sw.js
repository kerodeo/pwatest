var APP_PREFIX = 'ApplicationName_'     // Identifier for this app (this needs to be consistent across every cache update)
var VERSION = 'version_01'              // Version of the off-line cache (change this value everytime you want to update cache)
var CACHE_NAME = APP_PREFIX + VERSION
var urlsToCache = [                            // Add URL you want to cache in this list.
    '/pwatest/',                        // If you have separate JS/CSS files,
    '/pwatest/index.html'               // add path to those files here
]

// Cache resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        // Perform install steps
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(urlsToCache)
        })
    )
})

// Respond with cached resources
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)

    e.respondWith(
        caches.match(e.request).then(function (response) {
            // if cache is available, respond with cache
            if (response) { 
                console.log('responding with cache : ' + e.response.url)
                return response
            }

            console.log('file is not cached, fetching : ' + e.response.url)

            // IMPORTANT:Clone the request. A request is a stream and
            // can only be consumed once. Since we are consuming this
            // once by cache and once by the browser for fetch, we need
            // to clone the response.
            var fetchRequest = event.request.clone();
            return fetch(fetchRequest).then(
                function (response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT:Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    var responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(function (cache) {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }
            );
        })
    );         
});


// Delete outdated caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (cacheNames) {
            // `cacheNames` contains all cache names under your username.github.io
            // filter out ones that has this app prefix to create white list
            var cacheWhitelist = cacheNames.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });

            // add current cache name to white list
            cacheWhitelist.push(CACHE_NAME);

            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('deleting cache : ' + cacheName);
                        return caches.delete(cacheName);
                    }
                })
            )
        })
    )
})