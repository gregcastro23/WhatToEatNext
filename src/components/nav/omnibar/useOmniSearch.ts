"use client";

/**
 * Query → GET /api/search, debounced and cached (plan §5).
 *
 * A pause in typing fires at most one request, and every response is kept
 * (LRU), so backspacing and Enter reuse it. Requests are not aborted: the
 * debounce already drops the keystrokes in between, and a response that
 * arrives late is still worth caching. The key is folded the way the server
 * folds, so the CDN sees one URL per query (D2).
 */
import { useEffect, useState } from "react";
import { readJson } from "@/lib/api/json";
import { OmnibarResponseSchema, SEARCH_QUERY_MAX_LENGTH, type OmnibarResponse } from "@/lib/validation/searchSchemas";
import type { SearchStatus } from "./omnibarTypes";

const DEBOUNCE_MS = 120;
const CACHE_SIZE = 50;

const cache = new Map<string, OmnibarResponse>();
const inflight = new Map<string, Promise<OmnibarResponse>>();

export function searchKey(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase().slice(0, SEARCH_QUERY_MAX_LENGTH);
}

function remember(key: string, value: OmnibarResponse): void {
  cache.delete(key);
  cache.set(key, value);
  const oldest = cache.size > CACHE_SIZE ? cache.keys().next().value : undefined;
  if (oldest !== undefined) cache.delete(oldest);
}

/**
 * One retry, after this long, for a request that never answered (network
 * error, aborted) or answered 5xx: a transient failure (a cold start, a
 * deploy, a dropped connection) should not leave the list on "unavailable"
 * until the query is edited. 4xx is final: a 429 must not be hammered, and a
 * 400 will not change.
 */
const RETRY_DELAY_MS = 400;

async function attempt(key: string): Promise<Response> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(key)}`);
  if (res.status >= 500) throw new Error(`search failed: HTTP ${res.status}`);
  return res;
}

async function request(key: string): Promise<OmnibarResponse> {
  const res = await attempt(key).catch(async () => {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return attempt(key);
  });
  if (!res.ok) throw new Error(`search failed: HTTP ${res.status}`);
  const body = await readJson(res, OmnibarResponseSchema.parse);
  remember(key, body);
  return body;
}

/** The response for a key: cached, already in flight, or fetched now. */
export function fetchOmnibar(key: string): Promise<OmnibarResponse> {
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = inflight.get(key) ?? request(key).finally(() => inflight.delete(key));
  inflight.set(key, pending);
  return pending;
}

export interface OmniSearchState {
  status: SearchStatus;
  /** While loading, the previous query's results, so the list does not flicker. */
  data: OmnibarResponse | null;
}

interface Settled {
  key: string;
  data: OmnibarResponse | null;
  failed: boolean;
}

export function useOmniSearch(query: string): OmniSearchState {
  const key = searchKey(query);
  const [settled, setSettled] = useState<Settled>({ key: "", data: null, failed: false });

  useEffect(() => {
    if (!key) return undefined;
    const cached = cache.get(key);
    if (cached) {
      // Rendered from the cache already; recorded so the next query's loading state shows it.
      setSettled({ key, data: cached, failed: false });
      return undefined;
    }
    let live = true;
    const timer = setTimeout(() => {
      fetchOmnibar(key).then(
        (data) => {
          if (live) setSettled({ key, data, failed: false });
        },
        () => {
          if (live) setSettled((prior) => ({ key, data: prior.data, failed: true }));
        },
      );
    }, DEBOUNCE_MS);
    return (): void => {
      live = false;
      clearTimeout(timer);
    };
  }, [key]);

  if (!key) return { status: "idle", data: null };
  const cached = cache.get(key);
  if (cached) return { status: "ready", data: cached };
  if (settled.key !== key) return { status: "loading", data: settled.data };
  return settled.failed ? { status: "error", data: null } : { status: "ready", data: settled.data };
}

/** Test seam: forget every cached response. */
export function clearOmniSearchCache(): void {
  cache.clear();
  inflight.clear();
}
