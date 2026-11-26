"use client";

/**
 * A search URL → its parsed answer, for the homepage section searches.
 *
 * A pause in typing fires at most one request; answers are kept (most recently
 * used, up to {@link CACHE_SIZE}), so backspacing reuses them. One retry for a
 * network error or a 5xx, as the omnibar does (components/nav/omnibar); a 4xx
 * is final.
 */
import { useEffect, useState } from "react";
import { readJson } from "@/lib/api/json";

export const SEARCH_DEBOUNCE_MS = 300;
const RETRY_DELAY_MS = 400;
export const CACHE_SIZE = 30;

export type ResourceStatus = "idle" | "loading" | "ready" | "error";

export interface ResourceState<T> {
  status: ResourceStatus;
  /** While loading, the previous answer, so results do not flicker. */
  data: T | null;
  /** The HTTP status a failed request answered with; null for network and parse failures. */
  failedStatus: number | null;
}

class HttpFailure extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

export interface SearchResource<T> {
  parse: (value: unknown) => T;
  cache: Map<string, T>;
}

/** One per endpoint, at module level, so its cache outlives the component. */
export function createSearchResource<T>(parse: (value: unknown) => T): SearchResource<T> {
  return { parse, cache: new Map<string, T>() };
}

function remember<T>(resource: SearchResource<T>, url: string, value: T): void {
  const { cache } = resource;
  cache.delete(url);
  cache.set(url, value);
  const oldest = cache.size > CACHE_SIZE ? cache.keys().next().value : undefined;
  if (oldest !== undefined) cache.delete(oldest);
}

async function attempt(url: string): Promise<Response> {
  const response = await fetch(url);
  if (response.status >= 500) throw new HttpFailure(response.status);
  return response;
}

async function request<T>(resource: SearchResource<T>, url: string): Promise<T> {
  const response = await attempt(url).catch(async () => {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return attempt(url);
  });
  if (!response.ok) throw new HttpFailure(response.status);
  const body = await readJson(response, resource.parse);
  remember(resource, url, body);
  return body;
}

interface Settled<T> {
  url: string;
  attempt: number;
  data: T | null;
  failed: boolean;
  failedStatus: number | null;
}

/**
 * `url` null means there is nothing to search yet. A new `attempt` (the reader
 * searching again) retries a failed request for the same url.
 */
export function useSearchResource<T>(resource: SearchResource<T>, url: string | null, attemptNumber = 0): ResourceState<T> {
  const [settled, setSettled] = useState<Settled<T>>({ url: "", attempt: 0, data: null, failed: false, failedStatus: null });

  useEffect(() => {
    if (url === null || resource.cache.has(url)) return undefined;
    let live = true;
    const timer = setTimeout(() => {
      request(resource, url).then(
        (data) => {
          if (live) setSettled({ url, attempt: attemptNumber, data, failed: false, failedStatus: null });
        },
        (error: unknown) => {
          const failedStatus = error instanceof HttpFailure ? error.status : null;
          if (live) setSettled((prior) => ({ url, attempt: attemptNumber, data: prior.data, failed: true, failedStatus }));
        },
      );
    }, SEARCH_DEBOUNCE_MS);
    return (): void => {
      live = false;
      clearTimeout(timer);
    };
  }, [resource, url, attemptNumber]);

  if (url === null) return { status: "idle", data: null, failedStatus: null };
  const cached = resource.cache.get(url);
  if (cached !== undefined) return { status: "ready", data: cached, failedStatus: null };
  if (settled.url !== url || settled.attempt !== attemptNumber) return { status: "loading", data: settled.data, failedStatus: null };
  return settled.failed
    ? { status: "error", data: null, failedStatus: settled.failedStatus }
    : { status: "ready", data: settled.data, failedStatus: null };
}
