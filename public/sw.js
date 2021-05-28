const staticVersion = 10
const staticCacheName = `site-static-v${staticVersion}`
const dynamicVersion = 10
const dynamicCache = `site-dynamic-v${dynamicVersion}`
const assets = ['/','/index.html','/build/bundle.css','/build/bundle.js', '/build/bundle.js.map']

// install services worker
// do caching here is a good idéa
// this fires only on install, so if we change the assets, we will get the old site
// some form of cache version control is needed
self.addEventListener('install', event => {
    // console.log('Service worker has been installed ', event)
    // all assets will lbe caches before the install
    event.waitUntil(
        caches.open(staticCacheName)
        .then(cache => {
            console.log('Caching shell assets')
            cache.addAll(assets)
        })
    )
})

self.addEventListener('activate', event => {
    // console.log('Service worker has been activated ', event)
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.filter(key => key != staticCacheName).map(key => caches.delete(key)))
        })
    )
})

// fetch event
self.addEventListener('fetch', event => {
    // pause fetch, check of request is in cache
    // console.log('fetch event: ', event.request)
    event.respondWith(
        caches.match(event.request)
        .then(cacheResponse => {
            // Returns cache if not empty, else, do the original fetch.
            return cacheResponse || fetch(event.request).then(fetchResponse => {
                return caches.open(dynamicCache).then(cache => {
                    cache.put(event.request.url, fetchResponse.clone())
                    return fetchResponse
                })
            })
        })
    )
})