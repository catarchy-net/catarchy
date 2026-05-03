importScripts(
  "https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyBsr73zFRUOVtsHutsb-3QatSH092K9pa8",
  projectId: "catarchy-general",
  messagingSenderId: "1061953933956",
  appId: "1:1061953933956:web:3272eabbfad4776c9a68d1",
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const fcmMsg = event.notification.data?.FCM_MSG;
  const url = fcmMsg?.fcmOptions?.link ?? fcmMsg?.data?.url;
  if (!url) return;

  event.stopImmediatePropagation();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find(
          (c) => c.url === url && "focus" in c,
        );
        if (existing) return existing.focus();
        return clients.openWindow(url);
      }),
  );
});

firebase.messaging();
