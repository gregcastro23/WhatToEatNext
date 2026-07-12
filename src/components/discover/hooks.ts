"use client";

/**
 * Data hooks for the Discover surface (PR 6 §4). Thin keyset-paginated
 * fetchers over /api/discover/tables and /api/discover/people. Authed pages
 * are uncached; the browser fetch carries the session cookie.
 *
 * @file src/components/discover/hooks.ts
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { DiscoverPersonCard, DiscoverTableCard } from "./types";

export interface DiscoverTablesQuery {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  element?: string;
  openSeats?: boolean;
  q?: string;
  sort?: "soonest" | "match" | "distance";
  limit?: number;
}

function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "" || v === false) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

interface PagedState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  nextCursor: string | null;
}

/** Discover tables (auth optional). Reloads when the query changes; loadMore
 * appends the next keyset page. */
export function useDiscoverTables(query: DiscoverTablesQuery) {
  const [state, setState] = useState<PagedState<DiscoverTableCard>>({
    items: [],
    loading: true,
    error: null,
    nextCursor: null,
  });
  // Serialize the query so the effect only refires on a real change.
  const key = JSON.stringify(query);
  const reqIdRef = useRef(0);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      const reqId = ++reqIdRef.current;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch(`/api/discover/tables${buildQuery({ ...query, cursor })}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (reqId !== reqIdRef.current) return; // a newer request superseded this
        if (!res.ok || data.success === false) {
          setState((s) => ({ ...s, loading: false, error: data.message || "Failed to load tables" }));
          return;
        }
        setState((s) => ({
          items: append ? [...s.items, ...(data.tables ?? [])] : (data.tables ?? []),
          loading: false,
          error: null,
          nextCursor: data.nextCursor ?? null,
        }));
      } catch {
        if (reqId !== reqIdRef.current) return;
        setState((s) => ({ ...s, loading: false, error: "Failed to load tables" }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  useEffect(() => {
    void fetchPage(null, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (state.nextCursor && !state.loading) void fetchPage(state.nextCursor, true);
  }, [state.nextCursor, state.loading, fetchPage]);

  return {
    tables: state.items,
    loading: state.loading,
    error: state.error,
    hasMore: Boolean(state.nextCursor),
    loadMore,
    reload: () => fetchPage(null, false),
  };
}

export interface DiscoverPeopleQuery {
  q?: string;
  kind?: "all" | "people" | "agents";
  element?: string;
  sort?: "recent" | "match";
  limit?: number;
}

/** Discover people (auth required — a 401 surfaces as `needsAuth`). */
export function useDiscoverPeople(query: DiscoverPeopleQuery, enabled = true) {
  const [state, setState] = useState<PagedState<DiscoverPersonCard>>({
    items: [],
    loading: enabled,
    error: null,
    nextCursor: null,
  });
  const [needsAuth, setNeedsAuth] = useState(false);
  const key = JSON.stringify(query);
  const reqIdRef = useRef(0);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (!enabled) return;
      const reqId = ++reqIdRef.current;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch(`/api/discover/people${buildQuery({ ...query, cursor })}`, {
          credentials: "include",
        });
        if (res.status === 401) {
          if (reqId !== reqIdRef.current) return;
          setNeedsAuth(true);
          setState((s) => ({ ...s, loading: false }));
          return;
        }
        const data = await res.json();
        if (reqId !== reqIdRef.current) return;
        if (!res.ok || data.success === false) {
          setState((s) => ({ ...s, loading: false, error: data.message || "Failed to load people" }));
          return;
        }
        setNeedsAuth(false);
        setState((s) => ({
          items: append ? [...s.items, ...(data.people ?? [])] : (data.people ?? []),
          loading: false,
          error: null,
          nextCursor: data.nextCursor ?? null,
        }));
      } catch {
        if (reqId !== reqIdRef.current) return;
        setState((s) => ({ ...s, loading: false, error: "Failed to load people" }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, enabled],
  );

  useEffect(() => {
    void fetchPage(null, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (state.nextCursor && !state.loading) void fetchPage(state.nextCursor, true);
  }, [state.nextCursor, state.loading, fetchPage]);

  return {
    people: state.items,
    loading: state.loading,
    error: state.error,
    needsAuth,
    hasMore: Boolean(state.nextCursor),
    loadMore,
    reload: () => fetchPage(null, false),
  };
}
