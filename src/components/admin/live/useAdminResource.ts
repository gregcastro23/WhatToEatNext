"use client";

/**
 * Poll an admin endpoint and validate its payload.
 *
 * Every live admin page reads through this hook, so every page gets the same
 * behaviour: zod validation at the boundary (a server/client drift surfaces
 * as a named error, never as `undefined` rendering as 0), visibility-aware
 * polling with error backoff (useHardenedPolling), and the last good payload
 * kept on screen while a later poll fails.
 *
 * @file src/components/admin/live/useAdminResource.ts
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useHardenedPolling } from "@/hooks/useHardenedPolling";
import { readJson } from "@/lib/api/json";
import type { z } from "zod";

export interface AdminResource<T> {
  data: T | null;
  /** Set when the latest poll failed; `data` may still hold an older payload. */
  error: string | null;
  updatedAt: number | null;
  refresh: () => void;
}

export function useAdminResource<T>(url: string, schema: z.ZodType<T>, intervalMs: number): AdminResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const poll = useCallback(async (): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        setError(res.status === 401 || res.status === 403 ? "not authorized" : `HTTP ${res.status}`);
        return { ok: false };
      }
      const parsed = await readJson(res, { parse: (raw) => schema.parse(raw) });
      setData(parsed);
      setError(null);
      setUpdatedAt(Date.now());
      return { ok: true };
    } catch (err) {
      setError(err instanceof Error ? err.message.slice(0, 200) : "request failed");
      return { ok: false };
    }
  }, [url, schema]);

  const { refreshNow } = useHardenedPolling(poll, { baseIntervalMs: intervalMs });

  // A new URL (e.g. a different range) must not show the old range's numbers
  // under the new label while the next scheduled poll is pending.
  const lastUrl = useRef(url);
  useEffect(() => {
    if (lastUrl.current === url) return;
    lastUrl.current = url;
    setData(null);
    refreshNow();
  }, [url, refreshNow]);

  return { data, error, updatedAt, refresh: refreshNow };
}
