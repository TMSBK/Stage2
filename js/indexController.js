//Registering Service Worker

if (!navigator.serviceWorker) {
    console.log('This browser doesn\'t support Service Worker!');
} else {
    navigator.serviceWorker.register('../sw.js').then(function() {
        console.log('Registration worked!');
    }).catch(function() {
        console.log('Registration failed!');
    });
}