/* eslint-disable */
/**
 * Web-push handlers, pulled into the Workbox-generated service worker via
 * GenerateSW's `importScripts: ["/push-listener.js"]` (see next.config.js).
 * Lives in public/ so CopyPwaAssetsPlugin leaves it untouched.
 *
 * The `tag` collapses batched events at the OS level, mirroring the server's
 * one-unread-row-per-event dedup (evt-<eventId> / conv-<id>). notificationclick
 * focuses an existing tab on the target url or opens a new one.
 */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_e) {
    payload = { title: "alchm.kitchen", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "alchm.kitchen";
  const options = {
    body: payload.body || "",
    tag: payload.tag || undefined,
    data: { url: payload.url || "/" },
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // Focus an already-open tab if one is on the app.
        if ("focus" in client) {
          try {
            const clientUrl = new URL(client.url);
            const target = new URL(targetUrl, self.location.origin);
            if (clientUrl.origin === target.origin) {
              client.navigate(targetUrl);
              return client.focus();
            }
          } catch (_e) {
            /* fall through to openWindow */
          }
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    }),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  // The browser rotated the subscription — re-subscribe and re-register it.
  event.waitUntil(
    (async () => {
      try {
        const applicationServerKey =
          (event.oldSubscription && event.oldSubscription.options && event.oldSubscription.options.applicationServerKey) ||
          undefined;
        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });
      } catch (_e) {
        /* best-effort — the client re-subscribes on next load */
      }
    })(),
  );
});
