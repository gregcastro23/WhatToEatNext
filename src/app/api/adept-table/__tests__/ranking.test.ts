/**
 * @jest-environment node
 *
 * POST /api/adept-table recommends by the chart, not by catalog order.
 *
 * [MEASURED 2026-10-31] Every recipe scored the same, so the three "best"
 * recipes were the first three in the catalog for every caller. The route read
 * `alchemical_properties`, which no recipe carries. These tests run the real
 * route, the real ranking and the real 1,113-recipe catalog; only the user, the
 * charge and the composite chart are fixed.
 */
import type { Recipe } from "@/types/recipe";

/** The real static catalog, built once for the file (the mock prefix lets the hoisted factories use it). */
let mockStaticRecipes: Promise<Recipe[]> | null = null;
function mockLoadStatic(): Promise<Recipe[]> {
  mockStaticRecipes ??= jest.requireActual<typeof import("@/actions/recipes")>("@/actions/recipes").getServerRecipes();
  return mockStaticRecipes;
}

let mockChart = { Spirit: 5, Essence: 1, Matter: 0.5, Substance: 0.5 };

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: async () => ({ id: "user-1", roles: ["user"], email: "a@example.com", profile: {} }),
}));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: async () => ({ allowed: true }) }));
jest.mock("@/lib/economy/featureCharge", () => ({
  quoteFeature: async () => ({ feature: "alchemicalMidpoint", exempt: false }),
  collectOrRefuse: async () => null,
}));
jest.mock("@/services/groupNatalChartService", () => ({
  calculateCompositeNatalChart: () => ({ dominantElement: "Fire", alchemicalProperties: mockChart }),
}));
// The catalog is degraded to the static list: live and static are one array.
jest.mock("@/actions/recipes", () => ({ getServerRecipes: () => mockLoadStatic() }));
jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: { getAllRecipes: () => mockLoadStatic(), isCatalogDegraded: () => true },
}));

import { NextRequest } from "next/server";
import { recipeQuantities } from "@/lib/recipes/alchemicalMatch";
import { POST } from "../route";

interface Served {
  success: boolean;
  recipes: Array<Recipe & { score: number }>;
}

async function midpoint(chart: typeof mockChart): Promise<Served> {
  mockChart = chart;
  const res = await POST(
    new NextRequest("https://alchm.kitchen/api/adept-table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostData: { birthData: {} }, friendData: { birthData: {} } }),
    }),
  );
  expect(res.status).toBe(200);
  return res.json();
}

const SPIRITUAL = { Spirit: 5, Essence: 1, Matter: 0.5, Substance: 0.5 };
const MATERIAL = { Spirit: 0.5, Essence: 1, Matter: 5, Substance: 1 };

describe("POST /api/adept-table ranks the catalog by the chart", () => {
  it("returns three recipes, best match first, scored 0 to 100", async () => {
    const { recipes } = await midpoint(SPIRITUAL);
    expect(recipes).toHaveLength(3);
    const scores = recipes.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    for (const score of scores) {
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  }, 60_000);

  it("does not return the first three recipes of the catalog (the regression)", async () => {
    const catalog = await mockLoadStatic();
    const { recipes } = await midpoint(SPIRITUAL);
    expect(recipes.map((r) => r.id)).not.toEqual(catalog.slice(0, 3).map((r) => r.id));
  }, 60_000);

  it("recommends different recipes to different charts", async () => {
    const spiritual = (await midpoint(SPIRITUAL)).recipes.map((r) => r.id);
    const material = (await midpoint(MATERIAL)).recipes.map((r) => r.id);
    expect(spiritual.filter((id) => material.includes(id))).toEqual([]);
  }, 60_000);

  it("recommends recipes whose proportions follow the chart", async () => {
    const share = (r: Recipe, pick: (q: NonNullable<ReturnType<typeof recipeQuantities>>) => number): number => {
      const q = recipeQuantities(r);
      return q ? pick(q) / (q.spirit + q.essence + q.matter + q.substance) : 0;
    };
    const spiritual = (await midpoint(SPIRITUAL)).recipes;
    const material = (await midpoint(MATERIAL)).recipes;
    const mean = (rs: Recipe[], pick: Parameters<typeof share>[1]): number =>
      rs.reduce((sum, r) => sum + share(r, pick), 0) / rs.length;
    expect(mean(spiritual, (q) => q.spirit)).toBeGreaterThan(mean(material, (q) => q.spirit));
    expect(mean(material, (q) => q.matter)).toBeGreaterThan(mean(spiritual, (q) => q.matter));
  }, 60_000);

  it("is 100 for a recipe whose proportions are exactly the chart's", async () => {
    const catalog = await mockLoadStatic();
    const [model] = catalog;
    const own = recipeQuantities(model);
    if (!model || !own) throw new Error("the catalog's first recipe has no quantities");
    // A chart on a different scale, with this recipe's proportions.
    const { recipes } = await midpoint({
      Spirit: own.spirit / 7,
      Essence: own.essence / 7,
      Matter: own.matter / 7,
      Substance: own.substance / 7,
    });
    expect(recipes[0]?.score).toBeCloseTo(100, 6);
  }, 60_000);
});
