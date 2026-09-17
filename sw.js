const CACHE_NAME = 'mafia-pwa-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './imges/favicon.svg',
  './imges/Start_menu.png',
  './imges/card_bodyguard_v3.png',
  './imges/card_citizen_v3.png',
  './imges/card_colonel_v3.png',
  './imges/card_cupid_v3.png',
  './imges/card_doctor_v3.png',
  './imges/card_godfather_v3.png',
  './imges/card_hunter_v3.png',
  './imges/card_idiot_v3.png',
  './imges/card_investigator_v3.png',
  './imges/card_jester_v3.png',
  './imges/card_kamikaze_v3.png',
  './imges/card_mafia_v3.png',
  './imges/card_slasher_v3.png',
  './imges/card_sniper_v3.png',
  './imges/card_spy_v3.png',
  './imges/card_witch_v3.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
