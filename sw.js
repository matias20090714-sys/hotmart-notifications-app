const CACHE_NAME = 'hotmart-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Venta realizada con Tarjeta...',
    body: 'Tu comisión: US$ 17.45 - HP2295266365',
    icon: './hotmart-icon.png?v=3',
    badge: './hotmart-icon.png?v=3'
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
    icon: data.icon || './hotmart-icon.png?v=3',
    badge: data.badge || './hotmart-icon.png?v=3',
    vibrate: [200, 100, 200],
    tag: 'hotmart-sale-' + Date.now(),
    renotify: true,
    data: data.data || { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

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
