// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.


// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const reminderIcon = 'http://localhost:5173/v2/reminder.png'; 
const notificationIcon = 'http://localhost:5173/v2/notification.png';

firebase.initializeApp({
  apiKey: "AIzaSyDUY9r6GGobs7j3GsZCYcdGuO5oASXlNIw",
  authDomain: "loop-panel.firebaseapp.com",
  projectId: "loop-panel",
  storageBucket: "loop-panel.firebasestorage.app",
  messagingSenderId: "475433001458",
  appId: "1:475433001458:web:f1a123f3d932fedf690b6b",
  measurementId: "G-L39TK519NR"
});


// Retrieve an instance of Firebase Messaging so that it can handle background
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const title =
  payload.data.type === 'reminder'
    ? payload.notification?.title || 'Task Reminder'
    : payload.data.title || 'New Message';

  const options = {
    body: payload.data.message,
    icon: payload.data.type == "reminder" ? reminderIcon : notificationIcon,
    data: payload.data
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const data = event.notification.data;

  const targetUrl = `https://apacvault.com/v2/`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/v2') && 'focus' in client) {
          client.postMessage({ type: 'open_task', payload: data });
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl).then((newClient) => {
        // wait a little for React to load
        setTimeout(() => {
          newClient?.postMessage({ type: 'open_task', payload: data });
        }, 500);
      });
    })
  );
});

