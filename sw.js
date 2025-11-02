// Service Worker simple pour la PWA
const CACHE_NAME = 'mon-assistant-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/tasks.html',
    '/notes.html',
    '/calendar.html',
    '/goals.html',
    '/profile.html',
    '/assets/css/style.css',
    '/assets/css/dashboard.css',
    '/assets/css/calendar.css',
    '/assets/js/app.js',
    '/assets/js/tasks.js',
    '/assets/js/notes.js',
    '/assets/js/calendar.js',
    '/assets/js/goals.js',
    '/assets/js/profile.js',
    '/assets/js/charts.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});
