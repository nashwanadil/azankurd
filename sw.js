// AzanKurd service worker: يجعل الموقع قابلاً للتثبيت ويعمل دون إنترنت
const CACHE = 'azankurd-v5';
const CORE = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
// داخل تطبيق أندرويد فقط: نحفظ الأدوات مسبقًا لتفتح دون إنترنت حتى لو لم يزرها المستخدم
const APP_PAGES = ['ar', 'ku', 'en'].flatMap(l => ['azkar', 'zakat', 'hijri', 'occasions', 'qibla', 'ramadan'].map(p => `/${l}/${p}`));
const IS_APP = /AzanKurdApp/.test(self.navigator.userAgent);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() =>
    IS_APP ? Promise.all(APP_PAGES.map(u => c.add(u).catch(() => {}))) : null)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// الشبكة أولاً، وعند انقطاعها نستخدم آخر نسخة محفوظة
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/')))
  );
});

// تنبيه وقت الصلاة: يصل من الخادم حتى والتطبيق مغلق
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title || 'AzanKurd', {
    body: d.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: d.tag || 'prayer',
    renotify: false,
    data: { url: d.url || '/' }
  }));
});

// عند الضغط على الإشعار نفتح الموقع (أو ننتقل إليه إن كان مفتوحًا)
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return clients.openWindow(url);
  }));
});
