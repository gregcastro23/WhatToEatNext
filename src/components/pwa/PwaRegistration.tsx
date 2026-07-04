"use client";

import { useEffect } from "react";

const PWA_CLEANUP_RELOAD_KEY = "alchm:pwa-cleanup-reloaded";

async function clearAppCaches() {
  if (!("caches" in window)) return false;

  const cacheNames = await caches.keys();
  const appCacheNames = cacheNames.filter(
    (name) =>
      name.startsWith("alchm-") ||
      name.startsWith("workbox-") ||
      name.includes("precache"),
  );

  await Promise.all(appCacheNames.map((name) => caches.delete(name)));
  return appCacheNames.length > 0;
}

async function unregisterDisabledPwa() {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  const sameOriginRegistrations = registrations.filter((registration) => {
    try {
      return new URL(registration.scope).origin === window.location.origin;
    } catch {
      return false;
    }
  });

  const unregisterResults = await Promise.all(
    sameOriginRegistrations.map((registration) => registration.unregister()),
  );
  const removedServiceWorker = unregisterResults.some(Boolean);
  const removedCaches = await clearAppCaches();

  if (
    (removedServiceWorker || removedCaches) &&
    navigator.serviceWorker.controller &&
    sessionStorage.getItem(PWA_CLEANUP_RELOAD_KEY) !== "1"
  ) {
    sessionStorage.setItem(PWA_CLEANUP_RELOAD_KEY, "1");
    window.location.reload();
  }
}

export default function PwaRegistration() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PWA !== "true") {
      void unregisterDisabledPwa().catch((error) => {
        console.warn("[pwa] Disabled PWA cleanup failed", error);
      });
      return;
    }
    if (!("serviceWorker" in navigator)) return;

    sessionStorage.removeItem(PWA_CLEANUP_RELOAD_KEY);
    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
}
