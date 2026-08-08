/**
 * SafeKitchen HACCP Web Push Service Worker
 */

self.addEventListener('push', (event) => {
  let data = {
    title: 'SafeKitchen HACCP Alert',
    message: 'New compliance alert received.',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data.message = event.data.text();
    }
  }

  const title = data.title || 'SafeKitchen HACCP Alert';
  const options = {
    body: data.message || data.body || 'New compliance notification.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data,
    vibrate: [200, 100, 200],
    tag: data.id || 'haccp-notification',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    }),
  );
});
