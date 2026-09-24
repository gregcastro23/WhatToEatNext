/**
 * fetchOmnibar retries once, and only for failures that may be transient: a
 * request that never answered, or a 5xx. A 4xx is final (a 429 must not be
 * hammered). Responses are real wire bodies from the static catalog.
 */
import type { SearchIndex } from "@/lib/search/searchIndex";
import { clearOmniSearchCache, fetchOmnibar } from "../useOmniSearch";
import { loadIndex, wire } from "./helpers/wireSearch";

let index: SearchIndex;
let calls: string[] = [];

type Reply = "network" | number;

function install(replies: Reply[]): void {
  calls = [];
  const answer = async (url: string): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> => {
    calls.push(url);
    const reply = replies.shift() ?? 200;
    if (reply === "network") throw new TypeError("Failed to fetch");
    const query = new URL(url, "http://localhost").searchParams.get("q") ?? "";
    return { ok: reply < 400, status: reply, json: async () => (reply < 400 ? wire(index, query) : { success: false }) };
  };
  Object.defineProperty(globalThis, "fetch", { value: answer, configurable: true, writable: true });
}

beforeAll(async () => {
  index = await loadIndex();
}, 120_000);

beforeEach(() => clearOmniSearchCache());

describe("fetchOmnibar retry", () => {
  it.each<[string, Reply[]]>([
    ["a dropped request", ["network", 200]],
    ["a 5xx", [503, 200]],
  ])("recovers from %s with one retry", async (_, replies) => {
    install(replies);
    const body = await fetchOmnibar("spinach");
    expect(body.hero?.key).toBe("spinach");
    expect(calls).toHaveLength(2);
  });

  it("gives up after the one retry", async () => {
    install([503, 503, 200]);
    await expect(fetchOmnibar("spinach")).rejects.toThrow("HTTP 503");
    expect(calls).toHaveLength(2);
  });

  it.each([429, 400])("does not retry a %s", async (status) => {
    install([status, 200]);
    await expect(fetchOmnibar("spinach")).rejects.toThrow(`HTTP ${status}`);
    expect(calls).toHaveLength(1);
  });

  it("control: a healthy answer is fetched once and then served from the cache", async () => {
    install([200]);
    await fetchOmnibar("spinach");
    await fetchOmnibar("spinach");
    expect(calls).toHaveLength(1);
  });
});
