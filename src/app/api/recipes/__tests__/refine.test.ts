/**
 * @jest-environment node
 *
 * The Oracle refinement ranks every recipe of the cuisine, not the first 50.
 *
 * [MEASURED 2026-10-31] refine sliced the candidate pool to 50 "for scoring
 * performance" and returned the best 10 of those, so a paying caller never saw
 * a recipe outside the 50 most popular. Scoring is arithmetic over cached
 * positions: all 1,113 recipes take 13 ms. What does cost is the position
 * lookup, which each scoreRecipe awaits and which is not de-duplicated, so
 * refine warms it once before scoring instead of letting N calls make N.
 */
import type { Recipe } from "@/types/recipe";

const ELEMENTS = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

function recipe(n: number, cuisine: string): Recipe {
  return {
    id: `recipe-${n}`,
    name: `Recipe ${n}`,
    cuisine,
    ingredients: [],
    instructions: [],
    elementalProperties: ELEMENTS,
  };
}

/** 300 Italian then 60 Middle Eastern: the Middle Eastern ones sit past any 50-recipe window. */
const CATALOG: Recipe[] = [
  ...Array.from({ length: 300 }, (_, i) => recipe(i, "Italian")),
  ...Array.from({ length: 60 }, (_, i) => recipe(300 + i, "Middle Eastern")),
];

const events: string[] = [];
const scored: string[] = [];

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: async () => ({ id: "user-1", profile: {} }),
}));
jest.mock("@/lib/economy/livePricing", () => ({
  getPersonalizedPricingContext: async () => ({ personalized: false, multiplier: 1 }),
  applyPersonalizedPricing: (base: { substance: number }) => base,
}));
jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    debitTokens: async () => true,
    getBalances: async () => ({ spirit: 0, essence: 0, matter: 0, substance: 0 }),
  },
}));
jest.mock("@/services/planetaryScoring", () => ({
  PlanetaryScoringService: {
    getInstance: () => ({
      getCurrentPlanetaryPositions: async () => {
        events.push("warm");
        return [];
      },
      scoreRecipe: async (r: { id: string }) => {
        events.push("score");
        scored.push(r.id);
        // Later recipes score higher, so the winners are the LAST ones scored.
        return {
          overallScore: Number(r.id.replace("recipe-", "")),
          planetaryReason: "test",
          recommendedTiming: "",
          rulingPlanet: "Sun",
        };
      },
    }),
  },
}));
jest.mock("@/lib/recipes/recipeRefResolver", () => ({
  loadCanonicalCatalog: async () => CATALOG,
  withAuthoredFactsAll: async (recipes: unknown[]) => recipes,
}));

import { NextRequest } from "next/server";
import { POST } from "../refine/route";

interface Refined {
  success: boolean;
  recipes: Array<{ id: string; cuisine?: string }>;
}

async function refine(body: Record<string, unknown>): Promise<Refined> {
  const res = await POST(
    new NextRequest("https://alchm.kitchen/api/recipes/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  expect(res.status).toBe(200);
  return res.json();
}

beforeEach(() => {
  events.length = 0;
  scored.length = 0;
});

describe("POST /api/recipes/refine", () => {
  it("scores every recipe, not the first 50", async () => {
    await refine({});
    expect(scored).toHaveLength(CATALOG.length);
    expect(CATALOG.length).toBeGreaterThan(50);
  });

  it("can return a recipe from outside the old 50-recipe window", async () => {
    const refined = await refine({});
    expect(refined.recipes).toHaveLength(10);
    expect(refined.recipes.map((r) => r.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => `recipe-${359 - i}`),
    );
  });

  it("warms the planetary positions once, before any recipe is scored", async () => {
    await refine({});
    expect(events.filter((e) => e === "warm")).toHaveLength(1);
    expect(events[0]).toBe("warm");
  });

  it("selects a cuisine by the slug the cuisine cards link with", async () => {
    const refined = await refine({ cuisine: "middle-eastern" });
    expect(scored).toHaveLength(60);
    expect(refined.recipes.every((r) => r.cuisine === "Middle Eastern")).toBe(true);
  });

  it("selects a cuisine by display name too", async () => {
    await refine({ cuisine: "Italian" });
    expect(scored).toHaveLength(300);
  });
});
