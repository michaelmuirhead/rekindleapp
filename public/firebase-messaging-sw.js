// Firebase Cloud Messaging service worker
// Handles push notifications when the app is closed or in the background

importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD-9l__I_L_NnqDSS-w7AFbw-Ir328Qdz4",
  authDomain: "rekindlestudents-72055.firebaseapp.com",
  projectId: "rekindlestudents-72055",
  storageBucket: "rekindlestudents-72055.firebasestorage.app",
  messagingSenderId: "40182856629",
  appId: "1:40182856629:web:6f2a0cff3958dd966d37fc",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "ReKindle Students";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "rekindle-" + Date.now(),
  };
  self.registration.showNotification(title, options);
});

// Open the app when notification is clicked
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("/");
    })
  );
});
