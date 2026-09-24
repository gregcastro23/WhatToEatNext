/**
 * GET /api/search: the real search engine over a small fixture index. Only
 * the loader (live catalog) and the rate limiter are mocked at the module
 * boundary. Contracts:
 *   1. a query answers 200 with a schema-valid body and a CDN cache header;
 *   2. recipe rows are text-only (no image or time on the wire);
 *   3. bad input → 400, limiter → 429, failure → 503, all no-store.
 */
import { NextRequest } from "next/server";
import { buildSearchIndex, type SearchIndex } from "@/lib/search/searchIndex";
import type { SearchCatalogs } from "@/lib/search/types";
import { OmnibarResponseSchema, SEARCH_QUERY_MAX_LENGTH } from "@/lib/validation/searchSchemas";

jest.mock("@/lib/search/loader", () => ({ getSearchIndex: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn() }));

import { rateLimit } from "@/lib/rateLimit";
import { getSearchIndex } from "@/lib/search/loader";
import { GET } from "../route";

const CATALOGS: SearchCatalogs = {
  ingredients: [
    { key: "spinach", slug: "spinach", name: "spinach", aliases: [], category: "vegetable", seasons: ["spring", "autumn"], qualities: ["leafy"], rulingPlanets: ["Venus"], elemental: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 }, imageUrl: null, pairings: [{ name: "garlic", slug: "garlic" }, { name: "nutmeg", slug: null }] },
    { key: "garlic", slug: "garlic", name: "garlic", aliases: [], category: "vegetable", seasons: ["all"], qualities: [], rulingPlanets: [], elemental: null, imageUrl: null, pairings: [] },
  ],
  recipes: [
    { id: "11111111-1111-4111-8111-111111111111", name: "Spinach Pasta", cuisine: "Italian", totalMinutes: 30, imageUrl: "https://example.test/a.png", ingredientLines: ["spinach", "garlic"] },
    { id: "22222222-2222-4222-8222-222222222222", name: "Dan Dan Noodles", cuisine: "Chinese", totalMinutes: 45, imageUrl: null, ingredientLines: ["bok choy or spinach"] },
  ],
  cuisines: [{ key: "Thai", name: "Thai", href: "/cuisines/thai", terms: [] }],
  methods: [{ key: "braising", name: "Braising", href: "/cooking-methods/braising", terms: [] }],
  sauces: [],
};

const KEYS: Record<string, string> = { spinach: "spinach", garlic: "garlic" };
const index: SearchIndex = buildSearchIndex(CATALOGS, (text) => KEYS[text.toLowerCase()] ?? null);

async function get(query: string): Promise<Response> {
  return GET(new NextRequest(`http://localhost/api/search?q=${encodeURIComponent(query)}`));
}

beforeEach(() => {
  jest.mocked(getSearchIndex).mockResolvedValue(index);
  jest.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 119, resetMs: 60_000 });
});

describe("GET /api/search", () => {
  it("answers a query with a schema-valid body and a CDN cache header", async () => {
    const res = await get("pinach");
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, s-maxage=300, stale-while-revalidate=86400");
    const body = OmnibarResponseSchema.parse(await res.json());
    expect(body.hero).toMatchObject({ key: "spinach", href: "/ingredients/spinach" });
    expect(body.corrected).toEqual({ from: "pinach", to: "spinach", basis: "mid-word" });
    expect(body.top).toMatchObject({ kind: "ingredient", key: "spinach", href: "/ingredients/spinach", exact: false });
    // A pairing that is a card links to its dossier; one that is not stays unlinked.
    expect(body.hero?.pairings).toEqual([
      { name: "garlic", href: "/ingredients/garlic" },
      { name: "nutmeg", href: null },
    ]);
    expect(body.recipesContaining.map((r) => r.name)).toEqual(["Spinach Pasta", "Dan Dan Noodles"]);
    expect(body.recipesContaining[1]?.alternative).toBe(true);
  });

  it("sends recipe rows as text only", async () => {
    const body: unknown = await (await get("spinach pasta")).json();
    const { recipes } = OmnibarResponseSchema.parse(body);
    expect(recipes[0]).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Spinach Pasta",
      href: "/recipes/11111111-1111-4111-8111-111111111111",
      cuisine: "Italian",
    });
  });

  it("an empty query is a cacheable empty result, not an error", async () => {
    const res = await get("");
    expect(res.status).toBe(200);
    expect(OmnibarResponseSchema.parse(await res.json()).total).toEqual({ ingredient: 0, recipe: 0, cuisine: 0, method: 0, sauce: 0 });
  });

  it("rejects an over-long query with 400, no-store", async () => {
    const res = await get("x".repeat(SEARCH_QUERY_MAX_LENGTH + 1));
    expect(res.status).toBe(400);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("answers 429 no-store when rate limited", async () => {
    jest.mocked(rateLimit).mockResolvedValue({ allowed: false, remaining: 0, resetMs: 60_000 });
    const res = await get("spinach");
    expect(res.status).toBe(429);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("answers 503 no-store when the index can't load", async () => {
    jest.mocked(getSearchIndex).mockRejectedValue(new Error("catalog down"));
    const res = await get("spinach");
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});
