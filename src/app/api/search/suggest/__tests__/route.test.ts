/**
 * GET /api/search/suggest: OpenSearch Suggestions 1.1 JSON format tests (plan Phase 6, issue #870).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { buildSearchIndex, type SearchIndex } from "@/lib/search/searchIndex";
import type { SearchCatalogs } from "@/lib/search/types";
import { SEARCH_QUERY_MAX_LENGTH } from "@/lib/validation/searchSchemas";

jest.mock("@/lib/search/loader", () => ({ getSearchIndex: jest.fn() }));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn() }));

import { rateLimit } from "@/lib/rateLimit";
import { getSearchIndex } from "@/lib/search/loader";
import { GET } from "../route";

const PLANT = { vegan: "compliant", vegetarian: "compliant" } satisfies SearchCatalogs["ingredients"][number]["diet"];

const CATALOGS: SearchCatalogs = {
  ingredients: [
    {
      key: "spinach",
      slug: "spinach",
      name: "spinach",
      aliases: [],
      category: "vegetable",
      seasons: ["spring", "autumn"],
      qualities: ["leafy"],
      rulingPlanets: ["Venus"],
      elemental: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
      imageUrl: null,
      pairings: [],
      diet: PLANT,
    },
    {
      key: "garlic",
      slug: "garlic",
      name: "garlic",
      aliases: [],
      category: "vegetable",
      seasons: ["all"],
      qualities: [],
      rulingPlanets: [],
      elemental: null,
      imageUrl: null,
      pairings: [],
      diet: PLANT,
    },
  ],
  recipes: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Spinach Pasta",
      cuisine: "Italian",
      totalMinutes: 30,
      meals: ["dinner"],
      imageUrl: null,
      ingredientLines: ["spinach", "garlic"],
    },
  ],
  cuisines: [{ key: "Italian", name: "Italian", href: "/cuisines/italian", terms: [] }],
  methods: [{ key: "braising", name: "Braising", href: "/cooking-methods/braising", terms: [] }],
  sauces: [{ key: "hollandaise", name: "Hollandaise", href: "/sauces?focus=hollandaise", terms: [] }],
};

const KEYS: Record<string, string> = { spinach: "spinach", garlic: "garlic" };
const index: SearchIndex = buildSearchIndex(CATALOGS, (text) => KEYS[text.toLowerCase()] ?? null);

async function get(query: string): Promise<Response> {
  return GET(new NextRequest(`http://localhost/api/search/suggest?q=${encodeURIComponent(query)}`));
}

beforeEach(() => {
  jest.mocked(getSearchIndex).mockResolvedValue(index);
  jest.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 119, resetMs: 60_000 });
});

const SuggestionTupleSchema = z.tuple([
  z.string(),
  z.array(z.string()),
  z.array(z.string()),
  z.array(z.string()),
]);

describe("GET /api/search/suggest (OpenSearch)", () => {
  it("answers a query with OpenSearch 1.1 JSON 4-tuple and correct headers", async () => {
    const res = await get("spinach");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/x-suggestions+json; charset=utf-8");
    expect(res.headers.get("Cache-Control")).toBe("public, s-maxage=300, stale-while-revalidate=86400");

    const json = SuggestionTupleSchema.parse(await res.json());
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBe(4);

    const [query, completions, descriptions, urls] = json;
    expect(query).toBe("spinach");
    expect(completions).toContain("spinach");
    expect(descriptions.some((d) => d.includes("Ingredient"))).toBe(true);
    expect(urls.some((u) => u.includes("/ingredients/spinach"))).toBe(true);
  });

  it("includes corrected suggestion when a typo is entered", async () => {
    const res = await get("pinach");
    expect(res.status).toBe(200);

    const [, completions, descriptions, urls] = SuggestionTupleSchema.parse(await res.json());
    expect(completions).toContain("spinach");
    expect(descriptions.some((d) => d.includes("Did you mean"))).toBe(true);
    expect(urls.some((u) => u.includes("/search?q=spinach"))).toBe(true);
  });

  it("handles blank or whitespace queries gracefully with empty lists", async () => {
    const res = await get("   ");
    expect(res.status).toBe(200);
    const json = SuggestionTupleSchema.parse(await res.json());
    expect(json).toEqual(["", [], [], []]);
  });

  it("rejects queries exceeding max query length with 400 and no-store", async () => {
    const longQuery = "a".repeat(SEARCH_QUERY_MAX_LENGTH + 1);
    const res = await get(longQuery);
    expect(res.status).toBe(400);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 429 no-store when rate limited", async () => {
    jest.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, resetMs: 60_000 });
    const res = await get("spinach");
    expect(res.status).toBe(429);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 503 no-store when search index fails", async () => {
    jest.mocked(getSearchIndex).mockRejectedValueOnce(new Error("Index load failure"));
    const res = await get("spinach");
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});
