/**
 * GET /api/recipes/[recipeId]/discover from a live recipe page.
 *
 * [MEASURED 2026-09-25, production] the route answered 404 for every live
 * UUID (it searched the static catalog by id), so DiscoverySection rendered
 * nothing on live recipe pages. The live catalog here mirrors production's
 * shape over the real static catalog: every static recipe has a live twin
 * with a UUID, placeholder times and meal, and HSCA rows carry no cuisine.
 */
import { getServerRecipes } from "@/actions/recipes";
import type { Recipe } from "@/types/recipe";
import { isInternalCuisineCode } from "@/utils/internalCuisineCodes";

const mockGetAllRecipes = jest.fn<Promise<Recipe[]>, []>();
const mockIsCatalogDegraded = jest.fn<boolean, []>();

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getAllRecipes: () => mockGetAllRecipes(),
    isCatalogDegraded: () => mockIsCatalogDegraded(),
  },
}));

import { GET } from "../route";

/** Production ids (live) and their static twins' ids. */
const OYAKODON = { live: "e03c3505-9729-4a7e-bc0c-5ae57aff83a9", static: "japanese-dinner-summer-oyakodon-chicken-and-egg-rice-bowl" };
const POLENTA = { live: "84fdf8fa-6e27-4113-bc38-e3d01279ec08", static: "hsca-dessert-all-pan-fried-polenta-cakes" };
const LENSES = ["similarElemental", "similarAlchemical", "sameCuisine"] as const;

interface Item {
  id: string;
  cuisine?: string;
  prepTime?: string;
  cookTime?: string;
}
type Discovery = Record<(typeof LENSES)[number], Item[]>;

let live: Recipe[] = [];
/** Each fixture live id's static twin. */
const twinOf = new Map<string, Recipe>();

function liveTwin(recipe: Recipe, i: number): Recipe {
  const known = [OYAKODON, POLENTA].find((k) => k.static === recipe.id);
  const id = known?.live ?? `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
  twinOf.set(id, recipe);
  const cuisine = isInternalCuisineCode(recipe.cuisine) ? {} : { cuisine: recipe.cuisine };
  return {
    id, name: recipe.name, ...cuisine, ingredients: [], instructions: [],
    elementalProperties: recipe.elementalProperties, prepTime: "30", cookTime: "30", mealType: ["main"],
  };
}

async function discover(recipeId: string): Promise<{ status: number; body: Discovery }> {
  const res = await GET(new Request(`http://localhost/api/recipes/${recipeId}/discover`), {
    params: Promise.resolve({ recipeId }),
  });
  return { status: res.status, body: await res.json() };
}

beforeAll(async () => {
  live = (await getServerRecipes()).map(liveTwin);
}, 60_000);

beforeEach(() => {
  mockGetAllRecipes.mockResolvedValue(live);
  mockIsCatalogDegraded.mockReturnValue(false);
});

describe("GET /api/recipes/[recipeId]/discover", () => {
  it("serves a live recipe page, linking every result to a live page other than its own", async () => {
    const { status, body } = await discover(OYAKODON.live);
    expect(status).toBe(200);
    const liveIds = new Set(live.map((r) => r.id));
    for (const lens of LENSES) {
      const ids = body[lens].map((item) => item.id);
      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).not.toContain(OYAKODON.live);
      for (const id of ids) expect(liveIds.has(id)).toBe(true);
    }
  }, 60_000);

  it("a live id and its static twin's id discover the same recipes", async () => {
    expect((await discover(OYAKODON.static)).body).toEqual((await discover(OYAKODON.live)).body);
  }, 60_000);

  it("an HSCA page shows no internal cuisine code, no same-cuisine lens, and no fill-in times", async () => {
    const { status, body } = await discover(POLENTA.live);
    expect(status).toBe(200);
    expect(body.sameCuisine).toEqual([]);
    expect(body.similarElemental.length).toBeGreaterThan(0);
    const items = LENSES.flatMap((lens) => body[lens]);
    for (const item of items) expect(isInternalCuisineCode(item.cuisine)).toBe(false);
    const hsca = items.filter((item) => isInternalCuisineCode(twinOf.get(item.id)?.cuisine));
    // Control: HSCA recipes are among the results, and their twins carry the 15.
    expect(hsca.length).toBeGreaterThan(0);
    expect(hsca.some((item) => [twinOf.get(item.id)?.prepTime, twinOf.get(item.id)?.cookTime].includes("15"))).toBe(true);
    for (const item of hsca) expect([item.prepTime, item.cookTime]).not.toContain("15");
  }, 60_000);

  it("an unknown id is still not found", async () => {
    expect((await discover("ffffffff-0000-4000-8000-000000000000")).status).toBe(404);
  }, 60_000);

  it("while the live catalog is degraded, static ids work and results keep static ids", async () => {
    const statics = await getServerRecipes();
    mockGetAllRecipes.mockResolvedValue(statics);
    mockIsCatalogDegraded.mockReturnValue(true);
    const { status, body } = await discover(OYAKODON.static);
    expect(status).toBe(200);
    const staticIds = new Set(statics.map((r) => String(r.id)));
    for (const item of LENSES.flatMap((lens) => body[lens])) expect(staticIds.has(item.id)).toBe(true);
  }, 60_000);
});
