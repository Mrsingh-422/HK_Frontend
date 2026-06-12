importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyA4Jszsbc3SUkdWl6kK0WDQLgmwY7s7u3g",
    authDomain: "hk-frontend-5b02d.firebaseapp.com",
    projectId: "hk-frontend-5b02d",
    storageBucket: "hk-frontend-5b02d.firebasestorage.app",
    messagingSenderId: "296544053183",
    appId: "1:296544053183:web:b1f5fd36dc74645216230a",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Use data payload if notification object is missing (common for high-priority calls)
    const notificationTitle = payload.notification?.title || "Incoming Video Call";
    const notificationOptions = {
        body: payload.notification?.body || `${payload.data?.callerName || 'Doctor'} is calling you`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'video-call', // Prevents multiple notification stacks
        renotify: true,
        data: payload.data, // Contains callId, callerName, etc.
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// self.addEventListener('notificationclick', (event) => {
//     event.notification.close();

//     // Redirect to your home page
//     const targetUrl = '/';

//     event.waitUntil(
//         clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
//             for (let i = 0; i < windowClients.length; i++) {
//                 const client = windowClients[i];
//                 if (client.url === targetUrl && 'focus' in client) {
//                     return client.focus();
//                 }
//             }
//             if (clients.openWindow) return clients.openWindow(targetUrl);
//         })
//     );
// });

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // In Next.js, (user) is a route group, so it's NOT part of the URL.
    // If your CallListener is in the layout, just redirecting to home "/" 
    // will trigger the modal automatically.
    const targetUrl = '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If a tab is already open, focus it
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no tab is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});