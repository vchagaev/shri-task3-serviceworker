const CACHE_NAME = 'shri-2016-task3-1';
const API_URL = '/api/v1/students';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/index.css',
    '/js/index.js'
];

self.addEventListener('install', (event) => {
    'use strict';
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                let studentsResponse;
                return fetch(API_URL)
                    .then((response) => {
                        studentsResponse = response.clone();
                        return response.json();
                    })
                    .then((students) => {
                        const setUrls = new Set(URLS_TO_CACHE);
                        students.forEach((student) => {
                            setUrls.add(student.picSrc);
                        });
                        cache.put(API_URL, studentsResponse);
                        return cache.addAll(Array.from(setUrls));
                    });
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    'use strict';
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    'use strict';
    /**
     * Fetches response for the request and puts the response to cache.<br>
     * Catch if request is unreachable
     * @param request outgoing request
     * @returns {Promise.<response>}
     */
    function fetchAndPutToCache(request) {
        return fetch(request)
            .then((response) => {
                const responseToCache = response.clone();
                return caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, responseToCache))
                    .then(() => response);
            });
    }

    /**
     * Gets response from cache. Catch if there is no such request in cache
     * @param request outgoing request
     * @returns {Promise.<response>}
     */
    function getFromCache(request) {
        return caches.match(request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return Promise.reject();
            });
    }

    const requestURL = new URL(event.request.url);
    const exp = /^\/api\/v1/;
    if (exp.test(requestURL.pathname) &&
        (event.request.method !== 'GET' && event.request.method !== 'HEAD')) {
        return event.respondWith(fetch(event.request));
    }

    if (exp.test(requestURL.pathname)) {
        return event.respondWith(
            fetchAndPutToCache(event.request)
                .catch(() => getFromCache(event.request))
        );
    }

    return event.respondWith(
        getFromCache(event.request)
            .catch(() => fetchAndPutToCache(event.request))
    );
});
