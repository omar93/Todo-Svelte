if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
    .then(reg => {
        reg.pushManager.subscribe({
            userVisibleOnly: true
        })
        .then(sub => {
            console.log('sub: ', sub)
        })
    })
    .catch((err) => console.log('service worker not registered', err))
}