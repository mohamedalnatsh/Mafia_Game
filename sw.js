const CACHE_NAME = 'mafia-knights-v3.3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './js/config_state.js',
  './js/localization_data.js',
  './js/roles_data.js',
  './js/audio_engine.js',
  './js/random_events.js',
  './js/ui_templates.js',
  './js/ui_modals.js',
  './js/game_phases.js',
  './js/scoring_badges.js',
  './js/pwa_handler.js',
  './js/localization_ui.js',
  './js/player_setup.js',
  './js/role_distribution.js',
  './js/timers_audio.js',
  './js/session_state.js',
  './js/night_support.js',
  './js/voting_phase.js',
  './js/stats_ui.js',
  './js/app_bootstrap.js',
  './js/night_actions.js',
  './js/morning_phase.js',
  './js/victory_actions.js',
  './js/night_phase_entry.js',
  './js/session_restore.js',
  './js/night_core_logic.js',
  './js/game_settlement.js',
  './js/night_actions_ui.js',
  './js/day_discussion_ui.js',
  './js/game_logger.js',
  './js/app_state.js',
  './js/main_entry.js',
  './css/base.css',
  './css/components.css',
  './css/modals.css',
  './css/roles_cards.css',
  './generate-icons.html',
  './imges/favicon.ico',
  './imges/favicon.svg',
  './imges/icon-192.png',
  './imges/icon-512.png',
  './imges/Start_menu.png',
  './imges/card_bodyguard_v3.webp',
  './imges/card_citizen_v3.webp',
  './imges/card_colonel_v3.webp',
  './imges/card_copycat_v1.webp',
  './imges/card_cupid_v3.webp',
  './imges/card_doctor_v3.webp',
  './imges/card_executioner_v1.webp',
  './imges/card_framer_v1.webp',
  './imges/card_godfather_v3.webp',
  './imges/card_hunter_v3.webp',
  './imges/card_idiot_v3.webp',
  './imges/card_investigator_v3.webp',
  './imges/card_jester_v3.webp',
  './imges/card_kamikaze_v3.webp',
  './imges/card_mafia_v3.webp',
  './imges/card_mayor_v1.webp',
  './imges/card_slasher_v3.webp',
  './imges/card_sniper_v3.webp',
  './imges/card_spy_v3.webp',
  './imges/card_witch_v3.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data && event.data.action === 'precache-assets') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
    );
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkResponse = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });

      if (cachedResponse) return cachedResponse;

      return networkResponse.catch(() =>
        event.request.mode === 'navigate'
          ? caches.match('./index.html')
          : undefined,
      );
    })
  );
});
