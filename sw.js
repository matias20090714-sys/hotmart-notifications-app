const CACHE_NAME = 'midinero-v10';

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
    title: 'Recarga realizada con éxito',
    body: 'Se registró una recarga por $3.900,00 a tarjeta Midinero',
    icon: './midinero-icon.png?v=10',
    badge: './midinero-icon.png?v=10'
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
    icon: data.icon || './midinero-icon.png?v=10',
    badge: data.badge || './midinero-icon.png?v=10',
    vibrate: [200, 100, 200],
    tag: 'midinero-' + Date.now(),
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
