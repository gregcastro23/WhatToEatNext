"use client";

import { useEffect, useRef } from "react";

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
}

export function useHardenedPolling(
  poll: () => Promise<{ ok: boolean }>,
  options: HardenedPollingOptions = {},
): { refreshNow: () => void } {
  const { baseIntervalMs = 30_000, maxIntervalMs = 300_000 } = options;

  // Keep the latest poll callback without restarting the schedule each render.
  const pollRef = useRef(poll);
  pollRef.current = poll;

  const refreshRef = useRef<() => void>(() => {});

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let interval = baseIntervalMs;
    let running = false;
    let cancelled = false;

    const clear = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const schedule = () => {
      clear();
      if (cancelled) return;
      timer = setTimeout(() => {
        void run();
      }, interval);
    };

    const run = async () => {
      if (cancelled || running) return;
      // Paused while hidden — the visibility handler resumes the loop.
      if (typeof document !== "undefined" && document.hidden) return;

      running = true;
      let ok = false;
      try {
        ok = (await pollRef.current()).ok;
      } catch {
        ok = false;
      } finally {
        running = false;
      }
      if (cancelled) return;

      interval = ok
        ? baseIntervalMs
        : Math.min(interval * 2, maxIntervalMs);
      schedule();
    };

    const onVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        clear();
      } else {
        interval = baseIntervalMs;
        void run();
      }
    };

    refreshRef.current = () => {
      interval = baseIntervalMs;
      void run();
    };

    void run();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clear();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [baseIntervalMs, maxIntervalMs]);

  return {
    refreshNow: () => {
      refreshRef.current();
    },
  };
}
