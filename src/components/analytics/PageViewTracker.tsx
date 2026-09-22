"use client";

/**
 * Sends one first-party page-view beacon per client navigation to
 * POST /api/track/pageview, which feeds /admin/traffic and the admin Live
 * Activity feed.
 *
 * - No cookies. A random per-tab session id lives in sessionStorage so
 *   /admin/traffic can group page views into visits; it dies with the tab.
 * - The document referrer is sent only with the FIRST view of a tab — later
 *   client-side navigations would otherwise report our own previous page.
 * - Operator pages (/admin) and automation (navigator.webdriver) are skipped.
 *
 * @file src/components/analytics/PageViewTracker.tsx
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const ENDPOINT = "/api/track/pageview";
const SESSION_KEY = "alchm:pv-session";

function sessionId(): string | null {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const bytes = new Uint8Array(12);
    window.crypto.getRandomValues(bytes);
    const id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Storage blocked (private mode, embedded frame): the view still counts,
    // it just cannot be grouped into a session.
    return null;
  }
}

function send(payload: Record<string, unknown>): void {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      if (ok) return;
    }
  } catch {
    // fall through to fetch
  }
  fetch(ENDPOINT, {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => undefined);
}

export default function PageViewTracker(): null {
  const pathname = usePathname();
  const firstView = useRef(true);
  const lastSent = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!pathname || pathname === "/admin" || pathname.startsWith("/admin/")) return;
    if (typeof navigator !== "undefined" && navigator.webdriver) return;

    // React StrictMode double-invokes effects in development; one navigation
    // must be one row.
    const now = Date.now();
    if (lastSent.current?.path === pathname && now - lastSent.current.at < 1_500) return;
    lastSent.current = { path: pathname, at: now };

    const params = new URLSearchParams(window.location.search);
    send({
      path: pathname,
      referrer: firstView.current ? document.referrer || null : null,
      sessionId: sessionId(),
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
    });
    firstView.current = false;
  }, [pathname]);

  return null;
}
