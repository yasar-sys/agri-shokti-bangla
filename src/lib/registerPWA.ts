/**
 * Guarded PWA service worker registration.
 * Never registers inside Lovable preview / iframe / dev, and supports
 * a `?sw=off` kill switch that unregisters any stale app SW.
 */
import { registerSW } from "virtual:pwa-register";

const APP_SW_URL = "/sw.js";

function isPreviewOrDevContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;

  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }

  if (new URLSearchParams(window.location.search).get("sw") === "off") {
    return true;
  }

  return false;
}

async function unregisterAppSW() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return url.endsWith(APP_SW_URL);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* noop */
  }
}

export function registerAppPWA() {
  if (!("serviceWorker" in navigator)) return;

  if (isPreviewOrDevContext()) {
    void unregisterAppSW();
    return;
  }

  registerSW({ immediate: true });
}
