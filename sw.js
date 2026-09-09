/* My Calendar / PWA Service Worker
 * This worker lets the web app display notifications through the browser's
 * service-worker notification surface. It does not create a reliable alarm
 * clock by itself; closed-app scheduled reminders require Web Push or a
 * platform-specific notification scheduler.
 */
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION' && data.title) {
    event.waitUntil(self.registration.showNotification(data.title, data.options || {}));
  }
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {
    data = { title: '📅 カレンダー通知', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || '📅 カレンダー通知';
  const options = {
    body: data.body || '',
    icon: data.icon || './icon.png',
    badge: data.badge || './icon.png',
    tag: data.tag || ('my-calendar-push-' + Date.now()),
    renotify: true,
    data: data.data || {}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of list) {
      if ('focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow('./');
  })());
});