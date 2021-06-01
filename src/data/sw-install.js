if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
    .then()
    .catch((err) => console.log('service worker not registered', err))
}