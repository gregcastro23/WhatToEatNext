"use client";

/**
 * usePushSubscription — client lifecycle for web-push device notifications (PR 5).
 *
 * Reports support/permission state and drives subscribe/unsubscribe against the
 * Workbox service worker. subscribe(): register the SW, subscribe the
 * pushManager with the VAPID public key, POST the subscription, and record the
 * per-user pref. unsubscribe(): drop the browser subscription, DELETE the row,
 * and record the pref off. Everything is best-effort and gated upstream — the
 * bell only renders the toggle when the flags + SW + permission allow it.
 */

import { useCallback, useEffect, useState } from "react";

/** Decode a base64url VAPID key into the Uint8Array applicationServerKey wants. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

interface PushState {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  swReady: boolean;
  busy: boolean;
}

export function usePushSubscription() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: "unsupported",
    subscribed: false,
    swReady: false,
    busy: false,
  });

  // Detect support + current subscription on mount.
  useEffect(() => {
    let cancelled = false;
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    if (!supported) {
      setState((s) => ({ ...s, supported: false, permission: "unsupported" }));
      return;
    }

    void (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const existing = reg ? await reg.pushManager.getSubscription() : null;
        if (cancelled) return;
        setState((s) => ({
          ...s,
          supported: true,
          permission: Notification.permission,
          subscribed: Boolean(existing),
          swReady: Boolean(reg),
        }));
      } catch {
        if (!cancelled) setState((s) => ({ ...s, supported: true, permission: Notification.permission }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (enabled: boolean) => {
    try {
      await fetch("/api/push/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
    } catch {
      /* best-effort */
    }
  }, []);

  const subscribe = useCallback(async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return false;
    setState((s) => ({ ...s, busy: true }));
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((s) => ({ ...s, permission, busy: false }));
        return false;
      }
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.ready);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
      const ok = res.ok;
      if (ok) await setPreference(true);
      setState((s) => ({ ...s, permission, subscribed: ok, busy: false }));
      return ok;
    } catch {
      setState((s) => ({ ...s, busy: false }));
      return false;
    }
  }, [setPreference]);

  const unsubscribe = useCallback(async () => {
    setState((s) => ({ ...s, busy: true }));
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const subscription = reg ? await reg.pushManager.getSubscription() : null;
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      await setPreference(false);
      setState((s) => ({ ...s, subscribed: false, busy: false }));
      return true;
    } catch {
      setState((s) => ({ ...s, busy: false }));
      return false;
    }
  }, [setPreference]);

  return { ...state, subscribe, unsubscribe };
}

export default usePushSubscription;
