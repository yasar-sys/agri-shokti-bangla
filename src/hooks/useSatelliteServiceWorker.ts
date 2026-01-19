import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useSatelliteServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    if (!state.isSupported) {
      console.log('[SW] Service Worker not supported');
      return;
    }

    registerServiceWorker();
  }, [state.isSupported]);

  const registerServiceWorker = async () => {
    try {
      // Important: scope this SW to /satellite/ to avoid conflicting with the main PWA SW (/sw.js)
      const registration = await navigator.serviceWorker.register('/satellite-sw.js', {
        scope: '/satellite/',
      });

      console.log('[SW] Service Worker registered:', registration.scope);

      setState((prev) => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New version available');
              setState((prev) => ({
                ...prev,
                isUpdateAvailable: true,
              }));
            }
          });
        }
      });

      if (registration.waiting) {
        setState((prev) => ({
          ...prev,
          isUpdateAvailable: true,
        }));
      }

      // Avoid forced reload loops on some browsers/networks.
      // We'll surface "update available" and let the user refresh manually.
      const onControllerChange = () => {
        console.log('[SW] Controller changed');
        setState((prev) => ({ ...prev, isUpdateAvailable: true }));
      };

      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
    }
  };

  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const clearCache = async () => {
    if (state.registration?.active) {
      state.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log('[SW] All caches cleared');
    }
  };

  const prefetchTiles = (urls: string[]) => {
    if (state.registration?.active) {
      state.registration.active.postMessage({
        type: 'PREFETCH_TILES',
        urls,
      });
    }
  };

  const getCacheSize = async (): Promise<number> => {
    if (!('caches' in window)) return 0;

    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  };

  return {
    ...state,
    updateServiceWorker,
    clearCache,
    prefetchTiles,
    getCacheSize,
  };
}
