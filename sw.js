/* Service Worker — ทำให้ติดตั้งเป็นแอปได้ + แคชหน้าครอบไว้เปิดเร็ว */
var CACHE = 'milksave-shell-v1';
var SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  // แคชเฉพาะไฟล์หน้าครอบของเราเอง (network-first, ล้มเหลวค่อยดึงจากแคช)
  if (url.indexOf(self.registration.scope) === 0) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return caches.match(e.request); })
    );
  }
  // คำขออื่น (เว็บแอป GAS) ปล่อยผ่านปกติ
});
