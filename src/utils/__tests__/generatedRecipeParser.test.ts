/**
 * @jest-environment node
 *
 * The REAL route handler is the producer here: `GET` from
 * `src/app/api/recipes/custom/route.ts` runs in-process, with only its two I/O
 * edges faked (the database client and the logger). Its Response body is read with
 * `res.json()` and handed to the parser, exactly as `readJson` does in the page.
 *
 * The stored payloads are hand-built COPIES of what the generator writes
 * (CosmicRecipeGenerator.tsx `mapCosmicToStoreRecipe`, lines 54-145, and a
 * builder-style recipe with ingredient ids, element maps and a full
 * `alchemicalProperties`); the mapper is private to a client component, so it is
 * not run itself.
 *
 * The headline assertion is LOSSLESS FORWARDING: the page's Like handler POSTs the
 * whole recipe (`payload: recipe`), so what the parser returns must serialise to
 * exactly the bytes the route sent, extras included.
 */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/recipes/custom/route";
import { POST } from "@/app/api/users/me/recipes/custom/route";
import { isJsonRecord } from "@/lib/api/json";
import {
  parseCustomRecipeResponse,
  parseLikeCustomRecipeResponse,
} from "../generatedRecipeParser";

let mockRows: unknown[] = [];
let mockFail = false;

jest.mock("@/lib/auth/auth", () => ({
  auth: async (): Promise<{ user: { id: string } }> => ({ user: { id: "user-1" } }),
}));
jest.mock("@/lib/database/connection", () => ({
  executeQuery: async (): Promise<{ rows: unknown[] }> => {
    if (mockFail) throw new Error("connection refused");
    return { rows: mockRows };
  },
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: () => undefined, warn: () => undefined, info: () => undefined },
}));
jest.mock("@/services/QuestService", () => ({
  questService: { reportEvent: async (): Promise<unknown[]> => [] },
}));
jest.mock("@/services/userInteractionsService", () => ({
  recordInteraction: async (): Promise<void> => undefined,
}));

const ELEMENTS = { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 };

const MONICA_BASE: Record<string, unknown> = {
  originalMonica: null,
  optimizedMonica: 0,
  optimizationScore: 0,
  temperatureAdjustments: [],
  timingAdjustments: [],
  intensityModifications: [],
  planetaryTimingRecommendations: ["Venus is strong tonight."],
};

/** Copy of mapCosmicToStoreRecipe's output shape (CosmicRecipeGenerator.tsx:54-145). */
function cosmicPayload(): Record<string, unknown> {
  return {
    id: "cosmic-1731576000000-a1b2c",
    name: "Moonlit Saffron Risotto",
    description: "A risotto for a waxing Moon.",
    cuisine: "Italian",
    mealType: ["dinner"],
    prepTime: "45 min",
    numberOfServings: 4,
    ingredients: [
      { name: "arborio rice", amount: 300, unit: "g" },
      { name: "saffron", amount: 0.5, unit: "g", notes: "bloomed in warm stock" },
    ],
    instructions: ["Bloom the saffron.", "Toast the rice.", "Add stock a ladle at a time."],
    elementalProperties: ELEMENTS,
    nutrition: { calories: 520, protein: 14, carbs: 88, fat: 11 },
    monicaOptimization: { ...MONICA_BASE },
    seasonalAdaptation: {
      currentSeason: "spring",
      seasonalScore: 0,
      seasonalIngredientSubstitutions: [],
      seasonalCookingMethodAdjustments: [],
    },
    cuisineIntegration: {
      authenticity: 0,
      fusionPotential: 0,
      culturalNotes: ["Rooted in northern Italian rice country."],
      traditionalVariations: [],
      modernAdaptations: [],
    },
    nutritionalOptimization: {
      alchemicalNutrition: { spiritNutrients: [], essenceNutrients: [], matterNutrients: [], substanceNutrients: [] },
      elementalNutrition: ELEMENTS,
      kalchmNutritionalBalance: 0,
      monicaNutritionalHarmony: 0,
    },
  };
}

/** A builder-style recipe: ingredient ids and element maps, every optimisation block filled in. */
function builderPayload(): Record<string, unknown> {
  const base = cosmicPayload();
  return {
    ...base,
    id: "recipe-builder-77",
    name: "Ember Squash Soup",
    cookTime: "30 min",
    mealType: "lunch",
    numberOfServings: "4 bowls",
    ingredients: [
      { id: "ing-1", name: "butternut squash", amount: 900, unit: "g", elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 } },
      { id: 2, name: "smoked paprika", amount: "1 tsp", unit: null, elementalProperties: { Fire: 0.7, Water: null, Earth: 0.1, Air: 0.2 } },
    ],
    alchemicalProperties: { totalKalchm: 1.31, monicaConstant: 7.25, thermodynamicProfile: { heat: 0.6, entropy: 0.4, reactivity: 0.5, gregsEnergy: 0.2 }, elementalBalance: ELEMENTS, alchemicalClassification: "Fire-leaning" },
    monicaOptimization: {
      ...MONICA_BASE,
      originalMonica: 6.8,
      optimizedMonica: 7.25,
      intensityModifications: ["lower-heat"],
      planetaryTimingRecommendations: ["Cook while Mars is visible."],
    },
    seasonalAdaptation: {
      currentSeason: "autumn",
      seasonalScore: 0.9,
      seasonalIngredientSubstitutions: [],
      seasonalCookingMethodAdjustments: [{ method: "roast", adjustment: "longer", reason: "denser squash in autumn" }],
    },
  };
}

async function fetchRecipeBody(id = "stored-1"): Promise<{ status: number; body: unknown }> {
  const res = await GET(new Request(`http://localhost/api/recipes/custom?id=${id}`));
  return { status: res.status, body: await res.json() };
}

function storeRow(payload: unknown): void {
  mockRows = [{ id: "db-uuid-1", name: "Stored Name", cuisine: null, payload, notes: null }];
}

beforeEach(() => {
  mockRows = [];
  mockFail = false;
});

describe("parseCustomRecipeResponse over the real /api/recipes/custom handler", () => {
  it.each([["cosmic mapper shape", cosmicPayload], ["builder shape", builderPayload]])(
    "%s: the parsed recipe serialises to exactly what the route sent (lossless forwarding)",
    async (_name, make): Promise<void> => {
      storeRow(make());
      const { status, body } = await fetchRecipeBody();
      expect(status).toBe(200);
      const parsed = parseCustomRecipeResponse(body);
      expect(parsed).not.toBeNull();
      const sent = isJsonRecord(body) ? body.recipe : undefined;
      expect(sent).toBeDefined();
      expect(JSON.stringify(parsed)).toBe(JSON.stringify(sent));
    },
  );

  it("the fields the page reads come through with their values", async () => {
    storeRow(builderPayload());
    const parsed = parseCustomRecipeResponse((await fetchRecipeBody()).body);
    expect(parsed?.name).toBe("Ember Squash Soup");
    expect(parsed?.monicaOptimization.optimizedMonica).toBe(7.25);
    expect(parsed?.alchemicalProperties?.monicaConstant).toBe(7.25);
    expect(parsed?.ingredients[1]?.elementalProperties?.Water).toBeNull();
    expect(parsed?.seasonalAdaptation.seasonalCookingMethodAdjustments[0]?.method).toBe("roast");
  });

  it("keys the page does not read survive (alchemicalProperties.thermodynamicProfile, nutritionalOptimization)", async () => {
    storeRow(builderPayload());
    const parsed = parseCustomRecipeResponse((await fetchRecipeBody()).body);
    expect(parsed).toHaveProperty("nutritionalOptimization.kalchmNutritionalBalance", 0);
    expect(parsed).toHaveProperty("alchemicalProperties.thermodynamicProfile.gregsEnergy", 0.2);
  });

  it("a row whose payload is not an object answers a recipe with only the row columns: not a generated recipe, so it throws", async () => {
    storeRow(null);
    const { status, body } = await fetchRecipeBody();
    expect(status).toBe(200);
    expect(() => parseCustomRecipeResponse(body)).toThrow("ingredients must be an array");
  });

  it("an adaptation-shaped payload (no optimisation blocks) is rejected by name", async () => {
    storeRow({ ingredients: [{ name: "salt", amount: 1, unit: "tsp" }], instructions: ["Season."], elementalProperties: ELEMENTS });
    const { body } = await fetchRecipeBody();
    expect(() => parseCustomRecipeResponse(body)).toThrow("monicaOptimization must be an object");
  });

  it.each([
    ["no row", async (): Promise<void> => { mockRows = []; }, 404],
    ["a database failure", async (): Promise<void> => { mockFail = true; }, 500],
  ])("%s: the route's refusal is non-ok and carries no recipe", async (_name, arrange, expected): Promise<void> => {
    await arrange();
    const { status, body } = await fetchRecipeBody();
    expect(status).toBe(expected);
    expect(parseCustomRecipeResponse(body)).toBeNull();
  });

  it("a missing id is a 400 with no recipe", async () => {
    const res = await GET(new Request("http://localhost/api/recipes/custom"));
    expect(res.status).toBe(400);
    expect(parseCustomRecipeResponse(await res.json())).toBeNull();
  });

  it("parseLikeCustomRecipeResponse reads the real POST /api/users/me/recipes/custom body", async () => {
    mockRows = [{
      id: "r-1", name: "Soup", cuisine: null, source: "cosmic", source_recipe_id: "src-1",
      payload: cosmicPayload(), notes: null, created_at: "2026-11-15T00:00:00Z", updated_at: "2026-11-15T00:00:00Z",
    }];
    const req = (sourceRecipeId?: string): NextRequest =>
      new NextRequest("http://localhost/api/users/me/recipes/custom", {
        method: "POST",
        body: JSON.stringify({ name: "Soup", payload: cosmicPayload(), ...(sourceRecipeId ? { sourceRecipeId } : {}) }),
      });
    const insertedRes = await POST(req());
    expect(insertedRes.status).toBe(200);
    expect(parseLikeCustomRecipeResponse(await insertedRes.json())).toStrictEqual({ wasExisting: false });
    const existingRes = await POST(req("src-1"));
    expect(existingRes.status).toBe(200);
    expect(parseLikeCustomRecipeResponse(await existingRes.json())).toStrictEqual({ wasExisting: true });
  });
});
