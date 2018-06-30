//Registering Service Worker

if (!navigator.serviceWorker) {
    console.log('This browser doesn\'t support Service Worker!'); // eslint-disable-line
} else {
    navigator.serviceWorker.register('../sw.js').then(function() {
        console.log('Registration worked!'); // eslint-disable-line
    }).catch(function() {
        console.log('Registration failed!'); // eslint-disable-line
    });
}