/**
 * The recipe routes serve authored times and meals, not the live catalog's
 * placeholders.
 *
 * [MEASURED 2026-09-25, production] GET /api/recipes?limit=1000 returned
 * prep "30", cook "30", timeToMake "60 minutes" and mealType ["main"] on
 * 1,000 of 1,000 recipes, and /recipes rendered "1h" on every card. The live
 * rows below copy two production rows as served; the static catalog is the
 * real one, so each twin is found the way production finds it. The expected
 * meals are read from that twin, so a change to how the static catalog files
 * meals moves the expectation with it; the times are literal.
 */
import { getServerRecipes } from "@/actions/recipes";
import { authoredFactsOf } from "@/lib/search/authoredFacts";
import type { Recipe } from "@/types/recipe";

const mockGetAllRecipes = jest.fn<Promise<Recipe[]>, []>();

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getAllRecipes: () => mockGetAllRecipes(),
    getRecipeById: async (id: string) => (await mockGetAllRecipes()).find((r) => r.id === id) ?? null,
    isCatalogDegraded: () => false,
  },
}));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: async () => ({ allowed: true }) }));
jest.mock("@/lib/observability/withObservability", () => ({
  withObservability: (_opts: unknown, handler: unknown): unknown => handler,
}));
jest.mock("@/lib/auth/auth", () => ({ auth: async () => null }));

import { GET as getRecipe } from "../[recipeId]/route";
import { GET as listRecipes } from "../route";

const TIME_KEYS = ["prepTime", "cookTime", "totalTime", "timeToMake"];
const PLACEHOLDERS = { prepTime: "30", cookTime: "30", totalTime: "60", timeToMake: "60 minutes", mealType: ["main"] };
const ELEMENTS = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

function liveRow(id: string, name: string, cuisine?: string): Recipe {
  return { id, name, ...(cuisine ? { cuisine } : {}), ingredients: [], instructions: [], elementalProperties: ELEMENTS, ...PLACEHOLDERS };
}

/** Japanese; the static twin authors prep 10 + cook 12, filed under dinner. */
const OYAKODON = liveRow("e03c3505-9729-4a7e-bc0c-5ae57aff83a9", "Oyakodon (Chicken and Egg Rice Bowl)", "Japanese");
/** HSCA (live rows carry no cuisine); the twin's 15 + 15 is the generator's fill-in. */
const POLENTA = liveRow("84fdf8fa-6e27-4113-bc38-e3d01279ec08", "PAN-FRIED POLENTA CAKES");
/** Only the database has it: no twin, so nothing authored. */
const DB_ONLY = liveRow("9a9a9a9a-0000-4000-8000-000000000001", "A Recipe Only The Database Has");
const LIVE = [OYAKODON, POLENTA, DB_ONLY];

async function staticTwin(name: string): Promise<Recipe> {
  const twin = (await getServerRecipes()).find((recipe) => recipe.name === name);
  if (!twin) throw new Error(`no static recipe named ${name}`);
  return twin;
}

interface Served {
  recipes: Array<Record<string, unknown>>;
}

async function list(): Promise<Map<unknown, Record<string, unknown>>> {
  const res = await listRecipes(new Request("http://localhost/api/recipes?limit=10"));
  expect(res.status).toBe(200);
  const body: Served = await res.json();
  return new Map(body.recipes.map((recipe) => [recipe.id, recipe]));
}

beforeEach(() => {
  mockGetAllRecipes.mockReset();
  mockGetAllRecipes.mockResolvedValue(LIVE);
});

describe("GET /api/recipes", () => {
  it("the fixtures carry the production placeholders (control)", () => {
    for (const row of LIVE) expect(row).toMatchObject(PLACEHOLDERS);
  });

  it("serves a known twin with its authored times and meal", async () => {
    const { meals } = authoredFactsOf(await staticTwin(OYAKODON.name));
    expect(meals).toContain("dinner");
    const served = (await list()).get(OYAKODON.id);
    expect(served).toMatchObject({ prepTime: "10", cookTime: "12", totalTime: "22", timeToMake: "22 minutes" });
    expect(served?.mealType).toEqual(meals);
  }, 60_000);

  it("serves an HSCA recipe with no time, and its twin's meal (so the twin was found)", async () => {
    const twin = await staticTwin(POLENTA.name);
    // Control: the twin is HSCA and carries the generator's fill-in 15, which
    // is the time withheld here.
    expect(twin).toMatchObject({ cuisine: "hsca", prepTime: "15", cookTime: "15" });
    const { meals } = authoredFactsOf(twin);
    expect(meals.length).toBeGreaterThan(0);
    const served = (await list()).get(POLENTA.id);
    for (const key of TIME_KEYS) expect(served).not.toHaveProperty(key);
    expect(served?.mealType).toEqual(meals);
  }, 60_000);

  it("serves a recipe with no twin with no time and no meal, never the placeholders", async () => {
    const served = (await list()).get(DB_ONLY.id);
    for (const key of [...TIME_KEYS, "mealType"]) expect(served).not.toHaveProperty(key);
    expect(served?.name).toBe(DB_ONLY.name);
  }, 60_000);

  it("when the authored lookup cannot load, serves no times rather than the placeholders", async () => {
    mockGetAllRecipes.mockReset();
    mockGetAllRecipes.mockResolvedValueOnce(LIVE).mockRejectedValueOnce(new Error("catalog unavailable"));
    const served = await list();
    expect(served.size).toBe(LIVE.length);
    for (const recipe of served.values()) for (const key of [...TIME_KEYS, "mealType"]) expect(recipe).not.toHaveProperty(key);
  }, 60_000);
});

describe("GET /api/recipes/[recipeId]", () => {
  it("serves the recipe and its recommendations with authored facts", async () => {
    const res = await getRecipe(new Request(`http://localhost/api/recipes/${OYAKODON.id}`), {
      params: Promise.resolve({ recipeId: OYAKODON.id }),
    });
    expect(res.status).toBe(200);
    const body: { recipe: Record<string, unknown>; recommendedRecipes: Array<Record<string, unknown>> } = await res.json();
    expect(body.recipe).toMatchObject({ prepTime: "10", cookTime: "12", totalTime: "22", timeToMake: "22 minutes" });
    expect(body.recipe.mealType).toEqual(authoredFactsOf(await staticTwin(OYAKODON.name)).meals);
    expect(body.recommendedRecipes.map((r) => r.id).sort()).toEqual([DB_ONLY.id, POLENTA.id].sort());
    for (const recipe of body.recommendedRecipes) {
      for (const key of TIME_KEYS) expect(recipe).not.toHaveProperty(key);
      expect(recipe.mealType).not.toEqual(["main"]);
    }
  }, 60_000);
});
