// Service Worker para Notificaciones Nativas en iPhone (iOS) y Android vía Apple APNs & Web Push
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ESCUCHADOR DE PUSH REAL DESDE EL SERVIDOR (Apple APNs)
self.addEventListener('push', (event) => {
  let data = {
    title: '¡Venta realizada!',
    body: 'Has recibido una nueva comisión en Hotmart.',
    icon: './hotmart-icon.png',
    badge: './hotmart-icon.png'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || './hotmart-icon.png',
    badge: data.badge || './hotmart-icon.png',
    vibrate: [200, 100, 200],
    tag: 'hotmart-sale-' + Date.now(),
    renotify: true,
    data: data.data || { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Click en la notificación en el centro de notificaciones de iOS
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
