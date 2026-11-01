/**
 * @jest-environment node
 *
 * POST /api/adept-table ranks recipes that exist only in the database.
 *
 * [MEASURED 2026-10-31] Live rows carried no Spirit, Essence, Matter or
 * Substance (mapRowToRecipe ignored read_model.alchemical_quantities), so the
 * route could only rank a live recipe through its static twin, and a recipe
 * with no twin was never recommended. These tests run the real route, the real
 * LocalRecipeService mapper, the real catalog resolver and the real
 * 1,113-recipe static catalog; the database rows, the user, the charge and the
 * composite chart are fixed.
 */
import type { Recipe } from "@/types/recipe";

type Rows = Array<Record<string, unknown>>;

/** The real static catalog, built once for the file (the mock prefix lets the hoisted factories use it). */
let mockStaticRecipes: Promise<Recipe[]> | null = null;
function mockLoadStatic(): Promise<Recipe[]> {
  mockStaticRecipes ??= jest.requireActual<typeof import("@/actions/recipes")>("@/actions/recipes").getServerRecipes();
  return mockStaticRecipes;
}

let mockRows: Rows = [];
let mockChart = { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 };

jest.mock("@/lib/database", () => ({ executeQuery: async () => ({ rows: mockRows }) }));
jest.mock("@/lib/redis", () => ({
  redisGet: async () => null,
  redisSet: async () => undefined,
  redisDel: async () => undefined,
}));
jest.mock("@/lib/assets", () => ({ getValidatedAssetUrl: async (url: string) => url }));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/utils/logger", () => {
  const quiet = { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() };
  return { logger: quiet, createLogger: () => quiet };
});
jest.mock("next/server", () => {
  const actual = jest.requireActual<typeof import("next/server")>("next/server");
  return { ...actual, after: (work: () => void) => work() };
});
jest.mock("@/actions/recipes", () => ({ getServerRecipes: () => mockLoadStatic() }));
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

import { NextRequest } from "next/server";
import { recipeQuantities } from "@/lib/recipes/alchemicalMatch";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import { POST } from "../route";

interface Served {
  success: boolean;
  recipes: Array<Recipe & { score: number }>;
}

const LIVE_ONLY_ID = "00000000-0000-4000-8000-0000000000aa";
const LIVE_OTHER_ID = "00000000-0000-4000-8000-0000000000bb";
const TWIN_LIVE_ID = "e03c3505-9729-4a7e-bc0c-5ae57aff83a9";
const TWIN_NAME = "Oyakodon (Chicken and Egg Rice Bowl)";

function row(id: string, name: string, quantities: Record<string, unknown> | undefined): Record<string, unknown> {
  return {
    id,
    name,
    cuisine: "Japanese",
    category: "main",
    instructions: ["Cook"],
    prep_time_minutes: 5,
    cook_time_minutes: 5,
    servings: 2,
    dietary_tags: [],
    allergens: [],
    read_model: {
      id,
      name,
      ingredients: [{ name: "rice", amount: 1, unit: "cup" }],
      ...(quantities ? { alchemical_quantities: quantities } : {}),
    },
  };
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

/** A profile no static recipe has: almost all Matter. */
const ODD_CHART = { Spirit: 0.1, Essence: 0.05, Matter: 4.8, Substance: 0.05 };

beforeEach(() => {
  mockRows = [];
  // The route's resolver holds the LocalRecipeService this file imports (one
  // registry for static imports), and that service keeps its catalog in memory.
  LocalRecipeService.clearCache();
});

describe("POST /api/adept-table over a live catalog", () => {
  it("recommends a database-only recipe by its stored quantities", async () => {
    // Same proportions as the chart, on the scale of a recipe (x10).
    mockRows = [
      row(LIVE_ONLY_ID, "Database-Only Matter Stew", { spirit: 1, essence: 0.5, matter: 48, substance: 0.5 }),
      row(LIVE_OTHER_ID, "Database-Only Spirit Tea", { spirit: 40, essence: 5, matter: 1, substance: 1 }),
    ];
    const { recipes } = await midpoint(ODD_CHART);
    expect(recipes[0]?.id).toBe(LIVE_ONLY_ID);
    expect(recipes[0]?.name).toBe("Database-Only Matter Stew");
    expect(recipes[0]?.score).toBeCloseTo(100, 6);
  }, 60_000);

  it("recommends the other database-only recipe to the opposite chart", async () => {
    mockRows = [
      row(LIVE_ONLY_ID, "Database-Only Matter Stew", { spirit: 1, essence: 0.5, matter: 48, substance: 0.5 }),
      row(LIVE_OTHER_ID, "Database-Only Spirit Tea", { spirit: 40, essence: 5, matter: 1, substance: 1 }),
    ];
    const { recipes } = await midpoint({ Spirit: 4.6, Essence: 0.6, Matter: 0.1, Substance: 0.1 });
    expect(recipes[0]?.id).toBe(LIVE_OTHER_ID);
    expect(recipes[0]?.score).toBeGreaterThan(95);
  }, 60_000);

  it("does not recommend a database-only recipe that has no quantities", async () => {
    mockRows = [row(LIVE_ONLY_ID, "Database-Only Unmeasured", undefined)];
    const { recipes } = await midpoint(ODD_CHART);
    expect(recipes.map((r) => r.id)).not.toContain(LIVE_ONLY_ID);
    expect(recipes).toHaveLength(3);
  }, 60_000);

  it("does not recommend one whose stored quantities are all zero", async () => {
    mockRows = [
      row(LIVE_ONLY_ID, "Database-Only Unmatched", { spirit: 0, essence: 0, matter: 0, substance: 0, matchRate: 0 }),
    ];
    const { recipes } = await midpoint(ODD_CHART);
    expect(recipes.map((r) => r.id)).not.toContain(LIVE_ONLY_ID);
  }, 60_000);

  it("still ranks a live recipe that has none of its own through its static twin", async () => {
    const catalog = await mockLoadStatic();
    const twin = catalog.find((r) => r.name === TWIN_NAME);
    const own = recipeQuantities(twin);
    if (!own) throw new Error("the static twin has no quantities");
    mockRows = [row(TWIN_LIVE_ID, TWIN_NAME, undefined)];
    const { recipes } = await midpoint({
      Spirit: own.spirit / 9,
      Essence: own.essence / 9,
      Matter: own.matter / 9,
      Substance: own.substance / 9,
    });
    // Served under its live id, ranked on the twin's quantities.
    expect(recipes[0]?.id).toBe(TWIN_LIVE_ID);
    expect(recipes[0]?.score).toBeCloseTo(100, 6);
  }, 60_000);

  it("prefers a live recipe's own stored quantities to its static twin's", async () => {
    const catalog = await mockLoadStatic();
    const twin = catalog.find((r) => r.name === TWIN_NAME);
    const twinQuantities = recipeQuantities(twin);
    if (!twinQuantities) throw new Error("the static twin has no quantities");
    // The stored totals were recomputed after an edit: all Matter now.
    mockRows = [row(TWIN_LIVE_ID, TWIN_NAME, { spirit: 0.1, essence: 0.1, matter: 20, substance: 0.1 })];
    const { recipes } = await midpoint(ODD_CHART);
    const served = recipes.find((r) => r.id === TWIN_LIVE_ID);
    expect(served?.score).toBeGreaterThan(95);
    expect(recipes[0]?.id).toBe(TWIN_LIVE_ID);
  }, 60_000);
});
