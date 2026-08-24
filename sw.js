// Service Worker para Notificaciones Nativas en iOS / Android en segundo plano
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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

// Listener para disparar notificaciones directamente desde el Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_NOTIFICATION') {
    const { title, body, icon, tag } = event.data;
    self.registration.showNotification(title, {
      body: body,
      icon: icon || './hotmart-icon.svg',
      badge: icon || './hotmart-icon.svg',
      tag: tag || 'hotmart-' + Date.now(),
      renotify: true,
      silent: false,
      vibrate: [200, 100, 200]
    });
  }
});
