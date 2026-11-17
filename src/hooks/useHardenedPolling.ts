"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * useHardenedPolling
 *
 * Drives a recurring async poll for live admin/operator surfaces. Hardens a
 * naive `setInterval` loop in three ways:
 *
 *   - Visibility-aware  polling pauses while the tab is hidden and resumes
 *                       with an immediate refresh when it regains focus, so
 *                       backgrounded operator tabs stop hammering the API.
 *   - Error backoff     a failed poll doubles the interval (capped) until a
 *                       poll succeeds, which resets the cadence to the base.
 *   - No overlap        a poll in flight is never re-entered.
 *
 * The `poll` callback owns its own data handling; this hook owns only the
 * scheduling. It must report `{ ok }` so the hook can drive the backoff.
 */
export interface HardenedPollingOptions {
  /** Cadence between polls while healthy. Default 30s. */
  baseIntervalMs?: number;
  /** Upper bound the backoff can stretch the interval to. Default 5m. */
  maxIntervalMs?: number;
  /** Set to false when the caller supplies data from a parent multiplexed poll. */
  enabled?: boolean;
}

async function executePollOnce(
  pollFn: () => Promise<{ ok: boolean }>,
): Promise<boolean> {
  try {
    const { ok } = await pollFn();
    return ok;
  } catch {
    return false;
  }
}

function isDocumentHidden(): boolean {
  return (
    typeof document !== "undefined" &&
    (document.hidden || document.visibilityState === "hidden")
  );
}

function schedulePollTimer(
  Cancelled: () => boolean,
  interval: number,
  run: () => Promise<void>,
): ReturnType<typeof setTimeout> | null {
  if (Cancelled() || isDocumentHidden()) return null;
  return setTimeout(() => {
    run().catch(() => undefined);
  }, interval);
}

function attachPollingLoop(
  pollRef: React.MutableRefObject<() => Promise<{ ok: boolean }>>,
  refreshRef: React.MutableRefObject<() => void>,
  baseIntervalMs: number,
  maxIntervalMs: number,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let interval = baseIntervalMs;
  let running = false;
  let cancelled = false;
  const clear = (): void => {
    if (timer) { clearTimeout(timer); timer = null; }
  };
  const run = async (): Promise<void> => {
    if (cancelled || running || isDocumentHidden()) return;
    running = true;
    const ok = await executePollOnce(pollRef.current);
    running = false;
    interval = ok ? baseIntervalMs : Math.min(interval * 2, maxIntervalMs);
    clear();
    timer = schedulePollTimer(() => cancelled, interval, run);
  };
  const onVisibilityChange = (): void => {
    if (typeof document === "undefined") return;
    if (isDocumentHidden()) { clear(); return; }
    interval = baseIntervalMs;
    run().catch(() => undefined);
  };
  refreshRef.current = (): void => { interval = baseIntervalMs; run().catch(() => undefined); };
  run().catch(() => undefined);
  document.addEventListener("visibilitychange", onVisibilityChange);
  return (): void => { cancelled = true; clear(); document.removeEventListener("visibilitychange", onVisibilityChange); };
}

export function useHardenedPolling(
  poll: () => Promise<{ ok: boolean }>,
  options: HardenedPollingOptions = {},
): { refreshNow: () => void } {
  const { baseIntervalMs = 30_000, maxIntervalMs = 300_000, enabled = true } = options;

  // Keep the latest poll callback without restarting the schedule each render.
  const pollRef = useRef(poll);
  pollRef.current = poll;

  const refreshRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!enabled) {
      refreshRef.current = (): void => {};
      return undefined;
    }
    return attachPollingLoop(pollRef, refreshRef, baseIntervalMs, maxIntervalMs);
  }, [baseIntervalMs, maxIntervalMs, enabled]);

  // Stable identity. `refreshNow` is a legitimate dependency for effects that
  // refetch when a filter changes (see _dashboard/agents.tsx), but a fresh
  // closure on every render made those effects self-triggering: refresh →
  // setState → re-render → new identity → refresh. That loop polled
  // /api/admin/agents/network — eight Postgres aggregates behind a 5s memo —
  // at round-trip speed for as long as the tab was open.
  const refreshNow = useCallback((): void => {
    refreshRef.current();
  }, []);

  return { refreshNow };
}
