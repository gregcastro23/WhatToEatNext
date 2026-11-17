"use client";

/**
 * useAdminLiveStream — real-time SSE consumer for /admin with visibility-aware
 * pause/reconnect and automatic fallback to useHardenedPolling after 2 SSE errors.
 *
 * @file src/hooks/useAdminLiveStream.ts
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import { OverviewPulseSchema, type OverviewPulseView } from "@/lib/admin/schemas/overviewPulse";
import { readJson } from "@/lib/api/json";

export type AdminStreamConnectionState = "live_stream" | "polling_fallback" | "paused";

export interface UseAdminLiveStreamOptions {
  enabled?: boolean;
  streamUrl?: string;
  pollUrl?: string;
  pollIntervalMs?: number;
}

export interface UseAdminLiveStreamResult {
  data: OverviewPulseView | null;
  error: string | null;
  updatedAt: string | null;
  connectionState: AdminStreamConnectionState;
  newEventIds: ReadonlySet<string>;
  refreshNow: () => void;
}

function isTabHidden(): boolean {
  return typeof document !== "undefined" && (document.hidden || document.visibilityState === "hidden");
}

function mergeStreamDelta(prev: OverviewPulseView | null, next: OverviewPulseView): OverviewPulseView {
  if (!prev?.liveActivity || !next.liveActivity) return next;
  const incomingIds = new Set(next.liveActivity.events.map((e) => e.id));
  const retained = prev.liveActivity.events.filter((e) => !incomingIds.has(e.id));
  return { ...next, liveActivity: { ...next.liveActivity, events: [...next.liveActivity.events, ...retained].slice(0, 60) } };
}

function trackArrivedIds(
  events: Array<{ id: string }>,
  seenRef: React.MutableRefObject<Set<string>>,
  initializedRef: React.MutableRefObject<boolean>,
): string[] {
  if (!initializedRef.current) {
    initializedRef.current = true;
    events.forEach((e) => seenRef.current.add(e.id));
    return [];
  }
  const fresh: string[] = [];
  for (const e of events) {
    if (!seenRef.current.has(e.id)) {
      seenRef.current.add(e.id);
      fresh.push(e.id);
    }
  }
  return fresh;
}

function useTabVisibilitySync(setTabHidden: (h: boolean) => void, resetFallback: () => void): void {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onVisibility = (): void => {
      const hidden = isTabHidden();
      setTabHidden(hidden);
      if (!hidden && typeof EventSource !== "undefined") resetFallback();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return (): void => document.removeEventListener("visibilitychange", onVisibility);
  }, [setTabHidden, resetFallback]);
}

function useSseSubscription(
  active: boolean,
  streamUrl: string,
  onPayload: (payload: OverviewPulseView) => void,
  onFallback: (reason: string) => void,
): void {
  useEffect(() => {
    if (!active || typeof EventSource === "undefined") return undefined;
    let disposed = false;
    let consecutiveErrors = 0;
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const handleMessage = (event: MessageEvent): void => {
      if (typeof event.data !== "string" || event.data.length === 0) return;
      try {
        const parsed = OverviewPulseSchema.safeParse(JSON.parse(event.data));
        if (!parsed.success) return;
        consecutiveErrors = 0;
        onPayload(parsed.data);
      } catch { /* ignore malformed frame */ }
    };

    const connect = (): void => {
      if (disposed) return;
      const source = new EventSource(streamUrl);
      es = source;
      source.addEventListener("pulse", handleMessage);
      source.addEventListener("reconnect", () => {
        source.close();
        if (disposed) return;
        consecutiveErrors = 0;
        reconnectTimer = setTimeout(connect, 250);
      });
      source.onmessage = handleMessage;
      source.onerror = (): void => {
        if (disposed) return;
        consecutiveErrors += 1;
        if (consecutiveErrors >= 2) {
          source.close();
          onFallback("Live SSE interrupted — using polling fallback");
        }
      };
    };

    connect();
    return (): void => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [active, streamUrl, onPayload, onFallback]);
}

export function useAdminLiveStream(options: UseAdminLiveStreamOptions = {}): UseAdminLiveStreamResult {
  const { enabled = true, streamUrl = "/api/admin/stream", pollUrl = "/api/admin/overview-pulse", pollIntervalMs = 15_000 } = options;
  const [data, setData] = useState<OverviewPulseView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(() => typeof EventSource === "undefined");
  const [tabHidden, setTabHidden] = useState<boolean>(() => isTabHidden());
  const [newEventIds, setNewEventIds] = useState<ReadonlySet<string>>(() => new Set());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedSeenRef = useRef<boolean>(false);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const applyPayload = useCallback((incoming: OverviewPulseView, mergeDelta: boolean): void => {
    const fresh = trackArrivedIds(incoming.liveActivity?.events ?? [], seenIdsRef, initializedSeenRef);
    setData((prev) => (mergeDelta ? mergeStreamDelta(prev, incoming) : incoming));
    setUpdatedAt(incoming.generatedAt);
    setError(null);
    if (fresh.length === 0) return;
    setNewEventIds((prev) => new Set([...prev, ...fresh]));
    const t = setTimeout(() => {
      timersRef.current.delete(t);
      setNewEventIds((prev) => {
        const next = new Set(prev);
        fresh.forEach((id) => next.delete(id));
        return next;
      });
    }, 4_000);
    timersRef.current.add(t);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return (): void => { timers.forEach((t) => clearTimeout(t)); timers.clear(); };
  }, []);

  const resetFallback = useCallback((): void => setFallbackMode(false), []);
  const onSsePayload = useCallback((p: OverviewPulseView): void => applyPayload(p, true), [applyPayload]);
  const onSseFallback = useCallback((msg: string): void => { setError(msg); setFallbackMode(true); }, []);
  useTabVisibilitySync(setTabHidden, resetFallback);
  useSseSubscription(enabled && !tabHidden && !fallbackMode, streamUrl, onSsePayload, onSseFallback);

  const poll = useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch(pollUrl, { cache: "no-store" });
      if (!res.ok) { setError(`Failed to load overview (HTTP ${res.status})`); return { ok: false }; }
      const json = await readJson(res, { parse: (raw) => OverviewPulseSchema.parse(raw) });
      applyPayload(json, false);
      return { ok: true };
    } catch {
      setError("Failed to reach admin API");
      return { ok: false };
    }
  }, [pollUrl, applyPayload]);

  const { refreshNow } = useHardenedPolling(poll, {
    baseIntervalMs: pollIntervalMs,
    enabled: enabled && !tabHidden && (fallbackMode || typeof EventSource === "undefined"),
  });

  const connectionState: AdminStreamConnectionState = !enabled || tabHidden
    ? "paused"
    : fallbackMode || typeof EventSource === "undefined" ? "polling_fallback" : "live_stream";

  return { data, error, updatedAt, connectionState, newEventIds, refreshNow };
}
