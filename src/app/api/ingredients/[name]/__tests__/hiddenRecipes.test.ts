/**
 * @jest-environment node
 *
 * The ingredient dossier lists recipes from the committed ingredient → recipe
 * index, which was built from every bundled recipe. A recipe the operator
 * unpublished is left out of the list, of the total and of the by-cuisine
 * groups alike, so that no card links to a page that is now a 404. The recipe
 * index is real; only the database, the rate limiter and the recipe service
 * are mocked.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRecipesForIngredient } from "@/data/ingredientRecipeIndex";
import { CATALOG_TTL_MS } from "@/lib/recipes/catalogTtl";

const mockDbRows = jest.fn<Promise<{ rows: unknown[] }>, []>();

jest.mock("@/lib/database", () => ({ executeQuery: () => mockDbRows() }));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: jest.fn() }));
jest.mock("@/services/UnifiedRecipeService", () => ({
  UnifiedRecipeService: { getInstance: () => ({ getAllRecipes: jest.fn().mockResolvedValue([]) }) },
}));

import { rateLimit } from "@/lib/rateLimit";
import { GET } from "../route";

interface Body {
  relatedRecipes: Array<{ id?: string; name?: string }>;
  recipesByCuisine: Record<string, Array<{ recipeId: string }>>;
  totalRecipeMatches: number;
}

async function dossier(name: string): Promise<Body> {
  const res = await GET(new Request(`http://localhost/api/ingredients/${name}`), { params: Promise.resolve({ name }) });
  return res.json();
}

let clock = 1_000_000_000_000;
const savedUrl = process.env.DATABASE_URL;

beforeEach(() => {
  clock += CATALOG_TTL_MS * 10;
  jest.spyOn(Date, "now").mockImplementation(() => clock);
  process.env.DATABASE_URL = "postgresql://test@localhost/test";
  jest.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 59, resetMs: 60_000 });
  mockDbRows.mockResolvedValue({ rows: [] });
});
afterEach(() => {
  if (savedUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = savedUrl;
});

/** A recipe the index lists under garlic, and the number of its lines there. */
function garlicRecipe(): { recipeId: string; recipeName: string; cuisine: string; lines: number } {
  const matches = getRecipesForIngredient("garlic");
  const target = matches.find((m) => matches.filter((o) => o.recipeName === m.recipeName).length === 1);
  if (!target) throw new Error("no uniquely named recipe lists garlic");
  return { ...target, lines: matches.filter((m) => m.recipeId === target.recipeId).length };
}

describe("GET /api/ingredients/[name] with a recipe unpublished", () => {
  it("lists the recipe while its row is public (control)", async () => {
    const { recipeId } = garlicRecipe();
    const body = await dossier("garlic");
    expect(Object.values(body.recipesByCuisine).flat().map((m) => m.recipeId)).toContain(recipeId);
    expect(body.totalRecipeMatches).toBe(getRecipesForIngredient("garlic").length);
  });

  it("drops it from the total and from the by-cuisine groups, and from nothing else", async () => {
    const target = garlicRecipe();
    const before = await dossier("garlic");
    mockDbRows.mockResolvedValue({
      rows: [{ id: "9f7dae96-0000-4000-8000-000000000001", name: target.recipeName, cuisine: target.cuisine, published: false }],
    });
    clock += CATALOG_TTL_MS;
    await dossier("garlic"); // the set last read is served, and the new one is read behind it
    await new Promise((resolve) => setImmediate(resolve));
    const after = await dossier("garlic");
    expect(after.totalRecipeMatches).toBe(before.totalRecipeMatches - target.lines);
    expect(Object.values(after.recipesByCuisine).flat().map((m) => m.recipeId)).not.toContain(target.recipeId);
    expect(Object.values(after.recipesByCuisine).flat()).toHaveLength(after.totalRecipeMatches);
  });
});

describe("the gateway the route proxies to", () => {
  // The Next route forwards to the Hono gateway whenever HONO_API_URL is set,
  // so the gateway has to leave the same recipes out. It starts a server and a
  // Redis client when imported and cannot be driven here; its wiring is pinned
  // by the text of the one line, which is a weaker check than the route's.
  it.each([["src/server/hono-api.ts"], ["src/app/api/ingredients/[name]/route.ts"]])(
    "%s filters the index's matches before counting and grouping them",
    (file) => {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).toContain("await withoutHiddenRecipes(getRecipesForIngredient(slug))");
      expect(source).toContain("const totalRecipeMatches = matches.length;");
      expect(source).toContain("groupMatchesByCuisine(matches)");
    },
  );
});
