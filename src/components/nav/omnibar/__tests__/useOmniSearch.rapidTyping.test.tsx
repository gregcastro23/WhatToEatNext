/**
 * @jest-environment jsdom
 *
 * Rapid typing in the omnibar, on the client. Three claims, each measured by
 * counting the requests `fetch` actually receives:
 *
 *  - keystrokes closer together than the debounce make ONE request, for the
 *    last key typed;
 *  - an answer is cached under the key that was typed, including one the server
 *    expanded through a resolved search gap (`corrected.basis === "synonym"`),
 *    so backspacing and retyping never asks again;
 *  - the cache is a real LRU: a key read again outlives one that was only
 *    written (the header of useOmniSearch.ts has always said LRU, but a hit
 *    used to leave the key's position untouched, which is FIFO).
 *
 * Bodies are real wire responses (static catalog through the API's own core
 * and serializer), so the hook parses exactly what the route sends.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { searchOmnibar } from "@/lib/search/omnibar";
import type { SearchIndex } from "@/lib/search/searchIndex";
import { toOmnibarResponse } from "@/lib/search/serialize";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import { CACHE_SIZE, clearOmniSearchCache, fetchOmnibar, useOmniSearch } from "../useOmniSearch";
import { loadIndex, SEPTEMBER, wire } from "./helpers/wireSearch";

/** Matches nothing in the catalog (not even mid-word); a resolved gap maps it to spinach. */
const GAP_QUERY = "qxjvwkz";
/** Gap between keystrokes, well inside any plausible debounce. */
const KEYSTROKE_MS = 40;

let gapBody: OmnibarResponse;
let plainBody: OmnibarResponse;
const calls: string[] = [];

function installFetch(): void {
  calls.length = 0;
  const answer = async (url: string): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> => {
    const query = new URL(url, "http://localhost").searchParams.get("q") ?? "";
    calls.push(query);
    return { ok: true, status: 200, json: async () => (query === GAP_QUERY ? gapBody : plainBody) };
  };
  Object.defineProperty(globalThis, "fetch", { value: answer, configurable: true, writable: true });
}

beforeAll(async () => {
  const index: SearchIndex = await loadIndex();
  plainBody = wire(index, "spinach");
  gapBody = toOmnibarResponse(
    searchOmnibar(index, GAP_QUERY, { now: SEPTEMBER, resolvedGapMappings: { [GAP_QUERY]: "spinach" } }),
  );
}, 120_000);

beforeEach(() => {
  clearOmniSearchCache();
  installFetch();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("fixtures", () => {
  it("control: the gap body is a synonym expansion and the plain body is not", () => {
    expect(gapBody.corrected?.basis).toBe("synonym");
    expect(plainBody.corrected).toBeNull();
    expect(gapBody.hero?.key).toBe(plainBody.hero?.key);
  });
});

describe("a response is cached under the typed key", () => {
  it("serves a gap-expanded answer from the cache the second time", async () => {
    const first = await fetchOmnibar(GAP_QUERY);
    const again = await fetchOmnibar(GAP_QUERY);
    expect(first.corrected?.basis).toBe("synonym");
    expect(again).toBe(first);
    expect(calls).toEqual([GAP_QUERY]);
  });

  it("shows a retyped key at once, without asking again", async () => {
    jest.useFakeTimers();
    const { rerender, result } = renderHook(({ q }) => useOmniSearch(q), { initialProps: { q: "spinach" } });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    rerender({ q: "spinac" });
    await waitFor(() => expect(calls).toEqual(["spinach", "spinac"]));
    rerender({ q: "spinach" });
    expect(result.current.status).toBe("ready");
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(calls).toEqual(["spinach", "spinac"]);
  });
});

describe("keystrokes inside the debounce", () => {
  it("make one request, for the last key", async () => {
    jest.useFakeTimers();
    const { rerender, result } = renderHook(({ q }) => useOmniSearch(q), { initialProps: { q: "s" } });
    for (const q of ["sp", "spi", "spin", "spina"]) {
      await act(async () => {
        jest.advanceTimersByTime(KEYSTROKE_MS);
      });
      rerender({ q });
    }
    expect(calls).toEqual([]);
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(calls).toEqual(["spina"]);
  });
});

describe("the cache is least-recently-used", () => {
  it("keeps a key that was read again and evicts the one that was not", async () => {
    for (let i = 0; i < CACHE_SIZE; i += 1) await fetchOmnibar(`lru-${i}`);
    await fetchOmnibar("lru-0");
    await fetchOmnibar(`lru-${CACHE_SIZE}`);
    calls.length = 0;
    await fetchOmnibar("lru-0");
    expect(calls).toEqual([]);
    await fetchOmnibar("lru-1");
    expect(calls).toEqual(["lru-1"]);
  });
});
