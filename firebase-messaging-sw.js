// Import Firebase compatibility scripts
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Determine which configuration to use based on hostname
const hostname = self.location.hostname;
const isStaging = hostname.includes('staging') || hostname.includes('localhost');

const firebaseConfig = isStaging
  ? {
      apiKey: "AIzaSyDOhsJ5EUjk4a9q8yn1TIO5aY0O4IjKSm8",
      authDomain: "kingdom-alliance-staging.firebaseapp.com",
      projectId: "kingdom-alliance-staging",
      storageBucket: "kingdom-alliance-staging.firebasestorage.app",
      messagingSenderId: "1072013245761",
      appId: "1:1072013245761:web:81be6bb72c2ea502dc75c0"
    }
  : {
      apiKey: "AIzaSyDXfpTscwOXj_aWofLj3y5mzIQmrAoHoVE",
      authDomain: "kingdom-alliance-v2.firebaseapp.com",
      projectId: "kingdom-alliance-v2",
      storageBucket: "kingdom-alliance-v2.firebasestorage.app",
      messagingSenderId: "583391827233",
      appId: "1:583391827233:web:47a2006c0bda3e6e525a60"
    };

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have received a new message.',
    icon: '/data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkQ3MDAiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQjg4NjBCIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGQ9Ik0xMCAyHDE0VjhIMjBWMTJIMTRWMjJIMTBWMTJINFY4SDEwVjJaIiBmaWxsPSJ1cmwoI2cpIiAvPjwvc3ZnPg==',
    tag: 'kingdom-alliance-msg',
    renotify: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
