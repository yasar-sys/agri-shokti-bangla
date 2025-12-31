// Push notification service worker for agriশক্তি
// This file handles push events and notification display

self.addEventListener('push', function(event) {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'agriশক্তি সতর্কতা',
    body: 'নতুন বিজ্ঞপ্তি',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'general',
    data: { url: '/climate-alert' }
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
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    tag: data.tag || 'agrishokti-alert',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    data: data.data || { url: '/climate-alert' },
    actions: data.actions || [
      { action: 'view', title: 'দেখুন' },
      { action: 'dismiss', title: 'বাতিল' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/climate-alert';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('[SW] Push service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Push service worker activated');
  event.waitUntil(clients.claim());
});
