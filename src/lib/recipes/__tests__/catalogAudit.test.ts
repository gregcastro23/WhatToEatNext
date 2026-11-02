import { getServerRecipes } from "@/actions/recipes";
import { toPublicRecipe } from "@/lib/recipes/catalogQuery";
import { auditCatalog, type AuditInput } from "@/lib/recipes/catalogAudit";
import type { Recipe } from "@/types/recipe";

const squash = (value: string): string => value.replace(/[^a-z0-9]/gi, "").toLowerCase();

interface Healthy {
  /** Every recipe, as the route serves it. */
  recipes: Recipe[];
  input: AuditInput;
}

/** The real static catalog, as the route serves it. */
async function healthy(): Promise<Healthy> {
  const recipes = (await getServerRecipes()).map(toPublicRecipe);
  const served = (name: string): number =>
    recipes.filter((r) => squash(r.cuisine ?? "") === squash(name)).length;
  return {
    recipes,
    input: {
      wire: wire(recipes),
      canonicalIds: recipes.map((r) => r.id),
      allCuisinesTotal: recipes.length,
      cuisines: ["Italian", "Thai", "Middle Eastern", "Fusion"].map((name) => ({
        name,
        served: served(name),
      })),
      degraded: false,
      allowStatic: false,
    },
  };
}

/** What reaches the browser: the response after a JSON round trip. */
function wire(recipes: readonly unknown[], total = recipes.length): unknown {
  return JSON.parse(JSON.stringify({ total, recipes }));
}

function failing(report: ReturnType<typeof auditCatalog>): string[] {
  return report.checks.filter((c) => !c.ok).map((c) => c.name);
}

describe("auditCatalog", () => {
  it("passes the real static catalog", async () => {
    const { input } = await healthy();
    const report = auditCatalog(input);
    expect(failing(report)).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.served).toBeGreaterThan(1000);
    expect(report.noCuisine).toBeGreaterThan(500); // the archive-coded recipes
  });

  it("catches a capped response (the 1,000-recipe ceiling)", async () => {
    const { input, recipes } = await healthy();
    // As the old route answered: 1,000 recipes for a total of all of them.
    const capped = { ...input, wire: wire(recipes.slice(0, 1000), recipes.length) };
    expect(failing(auditCatalog(capped))).toEqual(
      expect.arrayContaining(["Nothing caps the response", "The list is exactly the sitemap's recipes"]),
    );
  });

  it("catches recipes the page would silently drop", async () => {
    const { input, recipes } = await healthy();
    const noIngredients = {
      id: "no-ingredients",
      name: "Broken",
      instructions: [],
      elementalProperties: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    };
    // JSON turns NaN into null: a number on the server, not on the wire.
    const nanFire = {
      id: "nan-fire",
      name: "NaN",
      ingredients: [],
      instructions: [],
      elementalProperties: { Fire: Number.NaN, Water: 0, Earth: 0, Air: 0 },
    };
    const report = auditCatalog({
      ...input,
      wire: wire([...recipes, noIngredients, nanFire]),
      canonicalIds: [...input.canonicalIds, "no-ingredients", "nan-fire"],
      allCuisinesTotal: recipes.length + 2,
    });
    expect(failing(report)).toEqual(["The page can display every recipe"]);
    expect(report.undisplayable).toMatchObject({
      ingredients: ["no-ingredients"],
      elementalProperties: ["nan-fire"],
    });
  });

  it("catches a repeated id", async () => {
    const { input, recipes } = await healthy();
    const [first] = recipes;
    if (!first) throw new Error("empty catalog");
    expect(failing(auditCatalog({ ...input, wire: wire([...recipes, first]) }))).toContain(
      "Every recipe has its own id",
    );
  });

  it("catches an internal archive code served as a cuisine", async () => {
    const { input, recipes } = await healthy();
    const [first, ...rest] = recipes;
    if (!first) throw new Error("empty catalog");
    const leaky = { ...input, wire: wire([{ ...first, cuisine: "hsca" }, ...rest]) };
    expect(failing(auditCatalog(leaky))).toContain("No internal archive code is served as a cuisine");
  });

  it("catches a recipe the sitemap lists but the API does not serve", async () => {
    const { input } = await healthy();
    const report = auditCatalog({ ...input, canonicalIds: [...input.canonicalIds, "sitemap-only"] });
    expect(failing(report)).toEqual(["The list is exactly the sitemap's recipes"]);
    expect(report.checks.find((c) => !c.ok)?.detail).toContain("sitemap-only");
  });

  it("catches a recipe the API serves but the sitemap does not list", async () => {
    const { input } = await healthy();
    const report = auditCatalog({ ...input, canonicalIds: input.canonicalIds.slice(1) });
    expect(failing(report)).toEqual(["The list is exactly the sitemap's recipes"]);
  });

  it("catches a cuisine link that returns fewer recipes than the data holds", async () => {
    const { input } = await healthy();
    const report = auditCatalog({
      ...input,
      cuisines: input.cuisines.map((c) => (c.name === "Middle Eastern" ? { ...c, served: 0 } : c)),
    });
    expect(failing(report)).toEqual(["Every cuisine link returns its recipes"]);
  });

  it("catches cuisine=all that is not the whole catalog", async () => {
    const { input } = await healthy();
    expect(failing(auditCatalog({ ...input, allCuisinesTotal: 0 }))).toEqual([
      "cuisine=all returns the whole catalog",
    ]);
  });

  it("fails a catalog that fell back to the static recipes, unless that was expected", async () => {
    const { input } = await healthy();
    expect(failing(auditCatalog({ ...input, degraded: true }))).toEqual([
      "The live database supplies the catalog",
    ]);
    expect(auditCatalog({ ...input, degraded: true, allowStatic: true }).ok).toBe(true);
  });

  it("fails a response that is not a recipe list", async () => {
    const { input } = await healthy();
    expect(auditCatalog({ ...input, wire: { success: false } }).ok).toBe(false);
  });
});
