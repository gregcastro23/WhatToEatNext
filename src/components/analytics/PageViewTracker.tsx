"use client";

/**
 * Sends one first-party page-view beacon per client navigation to
 * POST /api/track/pageview, which feeds /admin/traffic and the admin Live
 * Activity feed, plus lightweight dwell-time / active-tab heartbeats,
 * universal delegated interaction capture, and contextual feedback linked
 * via `viewId`.
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
import {
  cleanRefTag,
  extractUiQueryParamTags,
  extractVariantTags,
  normalizeInteractionTag,
} from "@/lib/analytics/interactionClassify";

const ENDPOINT = "/api/track/pageview";
const FEEDBACK_ENDPOINT = "/api/track/feedback";
const SESSION_KEY = "alchm:pv-session";
const NAV_HISTORY_KEY = "alchm:pv-nav-history";
const VARIANT_STORAGE_KEY = "alchm:ui-variant";
const HEARTBEAT_MS = 60_000;
const MAX_DURATION_MS = 1_800_000;
const MAX_INTERACTIONS = 50;
const DELEGATE_DEBOUNCE_MS = 500;
const EXPLICIT_SUPPRESS_MS = 80;
const RAGE_WINDOW_MS = 1_500;
const RAGE_COOLDOWN_MS = 3_000;
const RAGE_RADIUS_PX = 24;
const DEAD_CLICK_DELAY_MS = 250;
const QUICK_BACK_WINDOW_MS = 4_000;
const ACTION_EVENT = "alchm:view-action";

let lastExplicitActionAt = 0;

let latestViewContext: {
  viewId: string | null;
  sessionId: string | null;
  path: string;
  refTag: string | null;
} = {
  viewId: null,
  sessionId: null,
  path: "/",
  refTag: null,
};

function sanitizeToken(raw: string, maxLen = 36): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_./-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, maxLen);
}

function randomHex(byteCount = 12): string {
  try {
    const bytes = new Uint8Array(byteCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
  }
}

function sessionId(): string | null {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const id = randomHex(12);
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Storage blocked (private mode, embedded frame): the view still counts,
    // it just cannot be grouped into a session via sessionStorage.
    return null;
  }
}

/**
 * Only read true attribution parameters (?ref=, ?via=, ?source=, ?utm_source=,
 * ?utm_campaign=). Never treat UI state params like ?tab= or ?cuisine= as
 * referral tags.
 */
function extractRefTag(params: URLSearchParams): string | null {
  const raw =
    params.get("ref") ??
    params.get("via") ??
    params.get("source") ??
    params.get("utm_source") ??
    params.get("utm_campaign");
  return cleanRefTag(raw);
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

interface NavHistoryState {
  prevPath: string | null;
  currPath: string;
  enteredAt: number;
  hadMeaningfulAction: boolean;
}

function readNavHistory(): NavHistoryState | null {
  try {
    const raw = window.sessionStorage.getItem(NAV_HISTORY_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const currPath = "currPath" in parsed && typeof parsed.currPath === "string" ? parsed.currPath : null;
    const enteredAt = "enteredAt" in parsed && typeof parsed.enteredAt === "number" ? parsed.enteredAt : null;
    if (currPath === null || enteredAt === null) return null;
    const prevPath = "prevPath" in parsed && typeof parsed.prevPath === "string" ? parsed.prevPath : null;
    const hadMeaningfulAction =
      "hadMeaningfulAction" in parsed && typeof parsed.hadMeaningfulAction === "boolean"
        ? parsed.hadMeaningfulAction
        : false;
    return { prevPath, currPath, enteredAt, hadMeaningfulAction };
  } catch {
    return null;
  }
}

function writeNavHistory(next: NavHistoryState): void {
  try {
    window.sessionStorage.setItem(NAV_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked — skip nav history tracking.
  }
}

function dispatchViewAction(action: string, isExplicit: boolean): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeInteractionTag(action);
  if (!normalized || !/^[A-Za-z0-9:_./=>-]+$/.test(normalized)) return;
  if (isExplicit) {
    lastExplicitActionAt = Date.now();
  }
  window.dispatchEvent(new CustomEvent<string>(ACTION_EVENT, { detail: normalized }));
}

/**
 * Record an anonymous-safe in-page interaction on the active page view
 * (e.g. `trackViewAction("planner:fast-start")` or `trackViewAction("recipe:open")`).
 */
export function trackViewAction(action: string): void {
  dispatchViewAction(action, true);
}

/**
 * Record a client or API error inside the active page view's interaction trail
 * so operators can immediately spot friction in a visitor's journey drawer.
 */
export function trackClientError(kind: string, detail?: string | null): void {
  const safeKind = sanitizeToken(kind, 24) || "unknown";
  const safeDetail = detail ? sanitizeToken(normalizeInteractionTag(detail), 36) : "";
  dispatchViewAction(safeDetail ? `error:${safeKind}:${safeDetail}` : `error:${safeKind}`, true);
}

/**
 * Attach an active UI experiment/feature variant (`variant:<experiment>=<arm>`)
 * to sessionStorage and the current page view so /admin/traffic can compare
 * activation and frustration rates across variants.
 */
export function setActiveUiVariant(experiment: string, arm: string): void {
  const exp = sanitizeToken(experiment, 24) || "ui";
  const armToken = sanitizeToken(arm, 28);
  if (!armToken) return;
  try {
    window.sessionStorage.setItem(VARIANT_STORAGE_KEY, `${exp}=${armToken}`);
  } catch {
    // Storage blocked — still emit interaction onto active view
  }
  dispatchViewAction(`variant:${exp}=${armToken}`, false);
}

/**
 * Submit contextual micro-feedback tied directly to the active `viewId` and
 * `sessionId` so the note appears inside the visitor's Journey Drawer on
 * /admin/traffic.
 */
export async function submitViewFeedback(input: {
  note: string;
  rating?: number | null;
}): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const trimmedNote = input.note.trim().slice(0, 500);
  if (trimmedNote.length < 2) return false;
  const rating =
    typeof input.rating === "number" && input.rating >= 1 && input.rating <= 5
      ? Math.round(input.rating)
      : null;

  trackViewAction(rating ? `conversion:feedback_${rating}star` : "conversion:feedback_note");

  try {
    const res = await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        viewId: latestViewContext.viewId,
        sessionId: latestViewContext.sessionId ?? sessionId(),
        path: latestViewContext.path || window.location.pathname || "/",
        refTag: latestViewContext.refTag,
        rating,
        note: trimmedNote,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function extractDelegatedTag(target: Element, currentPathname: string): string | null {
  const el = target.closest("[data-track], a[href], button, [role='tab'], [role='menuitem'], summary");
  if (!el) return null;
  if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") {
    return null;
  }

  const explicitAttr = el.getAttribute("data-track");
  if (explicitAttr && explicitAttr.trim().length > 0) {
    return normalizeInteractionTag(explicitAttr);
  }

  if (el instanceof HTMLAnchorElement && el.href) {
    const rawHref = el.getAttribute("href") ?? "";
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:") ||
      rawHref.startsWith("javascript:")
    ) {
      return null;
    }
    try {
      const url = new URL(el.href, window.location.href);
      if (
        url.hostname !== window.location.hostname &&
        !url.hostname.endsWith(".alchm.kitchen")
      ) {
        return `conversion:outbound:${sanitizeToken(url.hostname, 36)}`;
      }
      const targetPath = normalizeInteractionTag(
        pickNonEmpty("/", url.pathname),
      );
      return `nav:link:${targetPath}`;
    } catch {
      return null;
    }
  }

  const label = pickNonEmpty(
    "",
    el.getAttribute("aria-label"),
    el.getAttribute("title"),
    el.textContent,
  );
  const slug = sanitizeToken(label, 28);
  if (!slug) return null;

  if (el.getAttribute("role") === "tab") {
    return `tab:switch:${slug}`;
  }

  const routeSlug = normalizeInteractionTag(pickNonEmpty("/", currentPathname));
  return `ui:click:${routeSlug}:${slug}`;
}

const INTERACTIVE_SELECTOR =
  "[data-track], a[href], button, [role='button'], [role='tab'], [role='menuitem'], summary, input, select, textarea, label, [contenteditable='true']";

function attachWebVitalsObservers(routeSlug: string): () => void {
  if (typeof PerformanceObserver === "undefined") {
    return (): void => {};
  }
  let lcpObserver: PerformanceObserver | null = null;
  let inpObserver: PerformanceObserver | null = null;
  let recordedLcp = false;
  let inpCount = 0;

  try {
    lcpObserver = new PerformanceObserver((list) => {
      if (recordedLcp) return;
      for (const entry of list.getEntries()) {
        if (entry.startTime > 2500) {
          recordedLcp = true;
          const bucket = entry.startTime > 4000 ? "gt4000ms" : "gt2500ms";
          dispatchViewAction(`perf:slow_lcp:${routeSlug}:${bucket}`, false);
          break;
        }
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    lcpObserver = null;
  }

  try {
    inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (inpCount >= 2) break;
        if (entry.duration > 200) {
          inpCount += 1;
          const bucket = entry.duration > 500 ? "gt500ms" : "gt200ms";
          dispatchViewAction(`perf:slow_inp:${routeSlug}:${bucket}`, false);
        }
      }
    });
    inpObserver.observe({ type: "event", buffered: true });
  } catch {
    inpObserver = null;
  }

  return (): void => {
    lcpObserver?.disconnect();
    inpObserver?.disconnect();
  };
}

function onWindowErrorEvent(event: ErrorEvent): void {
  const msg = event.error instanceof Error ? event.error.name : event.message;
  trackClientError("runtime", msg);
}

function onUnhandledRejectionEvent(event: PromiseRejectionEvent): void {
  const reason =
    event.reason instanceof Error
      ? event.reason.name
      : typeof event.reason === "string"
        ? event.reason
        : "promise";
  trackClientError("unhandled_rejection", reason);
}

function pickNonEmpty(
  fallback: string,
  ...values: Array<string | null | undefined>
): string {
  for (const val of values) {
    const trimmed = val?.trim() ?? "";
    if (trimmed.length > 0) return trimmed;
  }
  return fallback;
}

function extractClickTargetInfo(target: Element): { sig: string; slug: string } {
  const interactive = target.closest(INTERACTIVE_SELECTOR);
  const refEl = interactive ?? target;
  const rawLabel = pickNonEmpty(
    refEl.tagName,
    refEl.getAttribute("data-track"),
    refEl.getAttribute("aria-label"),
    refEl.getAttribute("title"),
    refEl.id,
    refEl.textContent,
  );
  const slug = pickNonEmpty(refEl.tagName.toLowerCase(), sanitizeToken(rawLabel, 28));
  const sig = `${refEl.tagName.toLowerCase()}:${refEl.id || slug}`;
  return { sig, slug };
}

interface ActiveViewState {
  viewId: string;
  path: string;
  sid: string | null;
  refTag: string | null;
  accumulatedMs: number;
  visibleSince: number | null;
  lastFlushedMs: number;
  interactions: string[];
  lastFlushedInteractions: number;
  deadClickCount: number;
}

export default function PageViewTracker(): null {
  const pathname = usePathname();
  const firstView = useRef(true);
  const lastSent = useRef<{ path: string; at: number } | null>(null);
  const activeView = useRef<ActiveViewState | null>(null);
  const lastDelegated = useRef<{ tag: string; at: number } | null>(null);
  const recentClicksRef = useRef<Array<{ at: number; x: number; y: number; sig: string }>>([]);
  const rageCooldownRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!pathname || pathname === "/admin" || pathname.startsWith("/admin/")) return;
    if (typeof navigator !== "undefined" && navigator.webdriver) return;

    // React StrictMode double-invokes effects in development; one navigation
    // must be one row.
    const now = Date.now();
    if (lastSent.current?.path === pathname && now - lastSent.current.at < 1_500) return;
    lastSent.current = { path: pathname, at: now };

    const flushView = (view: ActiveViewState, force = false): void => {
      const currentNow = Date.now();
      const liveDelta =
        view.visibleSince !== null ? Math.max(0, currentNow - view.visibleSince) : 0;
      const totalMs = Math.min(MAX_DURATION_MS, view.accumulatedMs + liveDelta);
      const hasNewDuration = totalMs - view.lastFlushedMs >= 2_000;
      const hasNewActions = view.interactions.length > view.lastFlushedInteractions;
      if (!force && !hasNewDuration && !hasNewActions) return;

      view.lastFlushedMs = totalMs;
      view.lastFlushedInteractions = view.interactions.length;
      send({
        viewId: view.viewId,
        path: view.path,
        sessionId: view.sid,
        refTag: view.refTag,
        durationMs: totalMs,
        interactions: view.interactions,
      });
    };

    // Flush the previous view before starting the new one.
    if (activeView.current && activeView.current.path !== pathname) {
      flushView(activeView.current);
    }

    const params = new URLSearchParams(window.location.search);
    const sid = sessionId();
    const viewId = randomHex(12);
    const refTag = extractRefTag(params);
    const routeSlug = normalizeInteractionTag(pathname || "/");

    let storedVariant: string | null;
    try {
      storedVariant = window.sessionStorage.getItem(VARIANT_STORAGE_KEY);
    } catch {
      storedVariant = null;
    }
    const urlVariantTags = extractVariantTags(params);
    if (urlVariantTags.length > 0) {
      try {
        window.sessionStorage.setItem(
          VARIANT_STORAGE_KEY,
          urlVariantTags.map((t) => t.replace(/^variant:/, "")).join(","),
        );
      } catch {
        // Storage blocked — skip persisting variant across navigations
      }
    }
    const activeVariantTags =
      urlVariantTags.length > 0 ? urlVariantTags : extractVariantTags(params, storedVariant);

    const initialInteractions: string[] = [];
    for (const tag of [...extractUiQueryParamTags(params), ...activeVariantTags]) {
      if (!initialInteractions.includes(tag) && initialInteractions.length < MAX_INTERACTIONS) {
        initialInteractions.push(tag);
      }
    }
    const prevNav = readNavHistory();
    if (
      prevNav?.prevPath === pathname &&
      prevNav.currPath !== pathname &&
      now - prevNav.enteredAt > 0 &&
      now - prevNav.enteredAt < QUICK_BACK_WINDOW_MS &&
      !prevNav.hadMeaningfulAction
    ) {
      const quickBackTag = normalizeInteractionTag(
        `friction:quick_back:${prevNav.currPath}->${pathname}`,
      );
      if (quickBackTag && !initialInteractions.includes(quickBackTag) && initialInteractions.length < MAX_INTERACTIONS) {
        initialInteractions.push(quickBackTag);
      }
    }
    if (prevNav?.currPath !== pathname) {
      writeNavHistory({
        prevPath: prevNav?.currPath ?? null,
        currPath: pathname,
        enteredAt: now,
        hadMeaningfulAction: false,
      });
    }

    const isVisible = typeof document === "undefined" || document.visibilityState === "visible";

    activeView.current = {
      viewId,
      path: pathname,
      sid,
      refTag,
      accumulatedMs: 0,
      visibleSince: isVisible ? now : null,
      lastFlushedMs: 0,
      interactions: [...initialInteractions],
      lastFlushedInteractions: initialInteractions.length,
      deadClickCount: 0,
    };
    latestViewContext = { viewId, sessionId: sid, path: pathname, refTag };

    send({
      viewId,
      path: pathname,
      referrer: firstView.current
        ? document.referrer.length > 0
          ? document.referrer
          : null
        : null,
      sessionId: sid,
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      refTag,
      durationMs: 0,
      interactions: initialInteractions,
    });
    firstView.current = false;

    const deadClickTimers = new Set<number>();

    const onVisibilityChange = (): void => {
      const v = activeView.current;
      if (!v) return;
      const ts = Date.now();
      if (document.visibilityState === "hidden") {
        if (v.visibleSince !== null) {
          v.accumulatedMs = Math.min(MAX_DURATION_MS, v.accumulatedMs + Math.max(0, ts - v.visibleSince));
          v.visibleSince = null;
        }
        flushView(v);
      } else if (v.visibleSince === null) {
        v.visibleSince = ts;
      }
    };

    const onPageHide = (): void => {
      const v = activeView.current;
      if (!v) return;
      flushView(v);
    };

    const onAction = (event: Event): void => {
      const v = activeView.current;
      if (!v) return;
      if (!(event instanceof CustomEvent) || typeof event.detail !== "string") return;
      const label = event.detail;
      if (!label.startsWith("friction:") && !label.startsWith("perf:")) {
        const currentNav = readNavHistory();
        if (currentNav?.currPath === pathname && !currentNav.hadMeaningfulAction) {
          writeNavHistory({ ...currentNav, hadMeaningfulAction: true });
        }
      }
      if (!v.interactions.includes(label) && v.interactions.length < MAX_INTERACTIONS) {
        v.interactions.push(label);
        flushView(v, true);
      }
    };

    const onDocumentClick = (event: MouseEvent): void => {
      const v = activeView.current;
      if (!v) return;
      if (!(event.target instanceof Element)) return;

      const ts = Date.now();
      const { sig, slug: rageSlug } = extractClickTargetInfo(event.target);
      const cx = event.clientX;
      const cy = event.clientY;
      const hasCoords = cx > 0 || cy > 0;
      const windowClicks = recentClicksRef.current.filter((c) => ts - c.at <= RAGE_WINDOW_MS);
      windowClicks.push({ at: ts, x: cx, y: cy, sig });
      recentClicksRef.current = windowClicks;

      const matchingClicks = windowClicks.filter(
        (c) => c.sig === sig || (hasCoords && Math.hypot(c.x - cx, c.y - cy) <= RAGE_RADIUS_PX),
      );
      if (matchingClicks.length >= 3) {
        const lastCooldown = rageCooldownRef.current.get(sig) ?? 0;
        if (ts - lastCooldown >= RAGE_COOLDOWN_MS) {
          rageCooldownRef.current.set(sig, ts);
          dispatchViewAction(`friction:rage_click:${routeSlug}:${rageSlug}`, false);
        }
      }

      if (ts - lastExplicitActionAt < EXPLICIT_SUPPRESS_MS) return;

      const tag = extractDelegatedTag(event.target, pathname);
      if (tag) {
        if (lastDelegated.current?.tag === tag && ts - lastDelegated.current.at < DELEGATE_DEBOUNCE_MS) {
          return;
        }
        lastDelegated.current = { tag, at: ts };
        dispatchViewAction(tag, false);
        return;
      }

      if (event.target.closest(INTERACTIVE_SELECTOR) || v.deadClickCount >= 3) {
        return;
      }

      const rawDeadLabel = pickNonEmpty(
        "",
        event.target.getAttribute("aria-label"),
        event.target.getAttribute("title"),
        event.target.textContent,
      )
        .trim()
        .replace(/\s+/g, " ");

      if (rawDeadLabel.length >= 2 && rawDeadLabel.length <= 48) {
        const deadSlug = sanitizeToken(rawDeadLabel, 28);
        if (deadSlug) {
          const preActionAt = lastExplicitActionAt;
          const preViewId = v.viewId;
          const prePath = window.location.pathname;
          const timerId = window.setTimeout(() => {
            deadClickTimers.delete(timerId);
            const cur = activeView.current;
            if (!cur) return;
            if (cur.viewId !== preViewId) return;
            if (window.location.pathname !== prePath) return;
            if (lastExplicitActionAt > preActionAt) return;
            if (cur.deadClickCount >= 3) return;
            cur.deadClickCount += 1;
            dispatchViewAction(`friction:dead_click:${routeSlug}:${deadSlug}`, false);
          }, DEAD_CLICK_DELAY_MS);
          deadClickTimers.add(timerId);
        }
      }
    };

    const onDocumentSubmit = (event: SubmitEvent): void => {
      const v = activeView.current;
      if (!v) return;
      if (Date.now() - lastExplicitActionAt < EXPLICIT_SUPPRESS_MS) return;
      if (!(event.target instanceof HTMLFormElement)) return;
      const rawName = pickNonEmpty(
        "form",
        event.target.getAttribute("data-track"),
        event.target.getAttribute("aria-label"),
        event.target.getAttribute("name"),
        event.target.getAttribute("action"),
      );
      const slug = sanitizeToken(rawName, 28) || "form";
      const tag = event.target.getAttribute("data-track")
        ? normalizeInteractionTag(rawName)
        : `ui:submit:${routeSlug}:${slug}`;
      dispatchViewAction(tag, false);
    };

    const disconnectWebVitals = attachWebVitalsObservers(routeSlug);

    const timer = window.setInterval(() => {
      const v = activeView.current;
      if (!v || document.visibilityState !== "visible") return;
      flushView(v);
    }, HEARTBEAT_MS);

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("click", onDocumentClick, { passive: true });
    document.addEventListener("submit", onDocumentSubmit, { passive: true });
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener(ACTION_EVENT, onAction);
    window.addEventListener("error", onWindowErrorEvent);
    window.addEventListener("unhandledrejection", onUnhandledRejectionEvent);

    return (): void => {
      window.clearInterval(timer);
      for (const id of deadClickTimers) {
        window.clearTimeout(id);
      }
      deadClickTimers.clear();
      disconnectWebVitals();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("submit", onDocumentSubmit);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener(ACTION_EVENT, onAction);
      window.removeEventListener("error", onWindowErrorEvent);
      window.removeEventListener("unhandledrejection", onUnhandledRejectionEvent);
    };
  }, [pathname]);

  return null;
}
