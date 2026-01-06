const CACHE_NAME = 'agri-shokti-satellite-v1';
const TILE_CACHE_NAME = 'satellite-tiles-v1';
const API_CACHE_NAME = 'nasa-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

const TILE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const API_CACHE_MAX_AGE = 5 * 60 * 1000;

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== TILE_CACHE_NAME &&
            cacheName !== API_CACHE_NAME
          ) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (isTileRequest(url)) {
    event.respondWith(handleTileRequest(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(fetch(request));
  }
});

function isTileRequest(url) {
  return (
    url.hostname.includes('arcgisonline.com') ||
    url.hostname.includes('openstreetmap.org') ||
    url.hostname.includes('earthdata.nasa.gov') ||
    url.pathname.includes('/satellite-tiles/')
  );
}

function isAPIRequest(url) {
  return (
    url.pathname.includes('/functions/v1/') ||
    url.pathname.includes('/nasa-ndvi') ||
    url.pathname.includes('/ndvi-scan')
  );
}

function isStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2'))
  );
}

async function handleTileRequest(request) {
  const cache = await caches.open(TILE_CACHE_NAME);
  
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('date'));
    const age = Date.now() - cachedDate.getTime();
    
    if (age < TILE_CACHE_MAX_AGE) {
      console.log('[ServiceWorker] Tile cache hit:', request.url);
      return cachedResponse;
    }
  }

  try {
    console.log('[ServiceWorker] Fetching tile:', request.url);
    const response = await fetch(request);
    
    if (response.ok && response.status === 200) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Tile fetch failed:', error);
    
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving stale tile');
      return cachedResponse;
    }
    
    return new Response(null, { status: 503, statusText: 'Service Unavailable' });
  }
}

async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  if (request.method !== 'GET' && request.method !== 'POST') {
    return fetch(request);
  }

  const cacheKey = request.method === 'POST' 
    ? await createCacheKeyForPost(request)
    : request.url;

  const cachedResponse = await cache.match(cacheKey);
  
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('date'));
    const age = Date.now() - cachedDate.getTime();
    
    if (age < API_CACHE_MAX_AGE) {
      console.log('[ServiceWorker] API cache hit:', cacheKey);
      return cachedResponse;
    }
  }

  try {
    console.log('[ServiceWorker] Fetching API:', request.url);
    const response = await fetch(request.clone());
    
    if (response.ok && response.status === 200) {
      const responseToCache = response.clone();
      cache.put(cacheKey, responseToCache);
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] API fetch failed:', error);
    
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving stale API response');
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Static asset fetch failed:', error);
    return new Response(null, { status: 503 });
  }
}

async function createCacheKeyForPost(request) {
  const body = await request.clone().text();
  const url = request.url;
  return `${url}:${body}`;
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }

  if (event.data && event.data.type === 'PREFETCH_TILES') {
    const { urls } = event.data;
    event.waitUntil(prefetchTiles(urls));
  }
});

async function prefetchTiles(urls) {
  const cache = await caches.open(TILE_CACHE_NAME);
  
  const fetchPromises = urls.map(async (url) => {
    const cached = await cache.match(url);
    if (cached) return;

    try {
      const response = await fetch(url);
      if (response.ok) {
        cache.put(url, response);
      }
    } catch (error) {
      console.error('[ServiceWorker] Prefetch failed:', url, error);
    }
  });

  await Promise.allSettled(fetchPromises);
  console.log('[ServiceWorker] Prefetched', urls.length, 'tiles');
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-satellite-data') {
    event.waitUntil(syncSatelliteData());
  }
});

async function syncSatelliteData() {
  console.log('[ServiceWorker] Background sync: satellite data');
}
