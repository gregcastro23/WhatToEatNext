/**
 * Phase 5 golden cases over the REAL catalogs (plan §7 exit criteria:
 * per-intent golden cases; diet results pass the classifier with the basis
 * shown). Recipes come from the static catalog, as in corpus.test.
 */
import { getServerRecipes } from "@/actions/recipes";
import { resolveIngredientSlug } from "@/data/ingredientRecipeIndex";
import { classifyIngredientDiet } from "@/utils/ingredientDietaryClassification";
import { buildIngredientKeyResolver } from "../ingredientKeys";
import { buildIndexForRecipes } from "../loader";
import { searchOmnibar } from "../omnibar";
import { keysForLine, type IngredientKeyResolver } from "../recipeIngredientIndex";
import type { SearchIndex } from "../searchIndex";
import type { OmnibarResult } from "../types";

const SEPTEMBER = new Date("2026-09-23T12:00:00Z");
const ALL = { perKindLimit: 5000, containingLimit: 5000 };
let index: SearchIndex;
let keyOf: IngredientKeyResolver;

beforeAll(async () => {
  index = buildIndexForRecipes(await getServerRecipes());
  keyOf = buildIngredientKeyResolver([...index.ingredients.values()], resolveIngredientSlug);
}, 120_000);

function search(query: string, limits: { perKindLimit?: number; containingLimit?: number } = {}): OmnibarResult {
  return searchOmnibar(index, query, { now: SEPTEMBER, ...limits });
}

function usesOf(recipeId: string): Set<string> {
  return new Set([...index.recipeUses].filter(([, uses]) => uses.some((u) => u.recipeId === recipeId)).map(([key]) => key));
}

describe("several ingredients: ranked by how many a recipe uses", () => {
  it("spinach eggs: every row uses both, no hero, Enter goes to /search", () => {
    const result = search("spinach eggs", ALL);
    expect(result.coverage?.of.map((e) => e.key)).toEqual(["spinach", "chicken_egg"]);
    expect(result.hero).toBeNull();
    expect(result.top?.exact).toBe(false);
    const rows = result.coverage?.rows ?? [];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBe(result.coverage?.total);
    for (const row of rows) {
      expect(row).toMatchObject({ uses: 2, missing: [] });
      expect([...usesOf(row.id)]).toEqual(expect.arrayContaining(["spinach", "chicken_egg"]));
    }
  });

  it("spinach eggs feta: 3 of 3 before 2 of 3, and each names what it lacks", () => {
    const rows = search("spinach, eggs and feta", ALL).coverage?.rows ?? [];
    expect(rows[0]?.uses).toBe(3);
    expect(rows.map((r) => r.uses)).toEqual([...rows.map((r) => r.uses)].sort((a, b) => b - a));
    for (const row of rows) {
      const used = usesOf(row.id);
      const names = { spinach: "spinach", chicken_egg: "Chicken Egg", feta: "feta" };
      const missing = Object.entries(names).filter(([key]) => !used.has(key)).map(([, name]) => name);
      expect(row.missing).toEqual(missing);
      expect(row.uses).toBe(3 - missing.length);
    }
  });
});

describe("several ingredients no recipe uses together", () => {
  it("vanilla fish sauce: no coverage rows, but both ingredients are listed, never a dead end (D5)", () => {
    const result = search("vanilla fish sauce");
    expect(result.coverage).toMatchObject({ rows: [], total: 0 });
    expect(result.ingredients.map((e) => e.key)).toEqual(["vanilla", "fish_sauce"]);
    expect(result.top).toMatchObject({ key: "vanilla", exact: false });
  });
});

/** Every line and every card it names pass the classifier: the basis the chip states. */
function passesClassifier(recipeId: string, diet: "vegan" | "vegetarian"): boolean {
  const field = diet === "vegan" ? "isVegan" : "isVegetarian";
  return (index.recipes.get(recipeId)?.ingredientLines ?? []).every((line) => {
    const cards = keysForLine(line, keyOf).keys.flatMap((key) => index.ingredients.get(key) ?? []);
    const subjects = [{ name: line }, ...cards.map((c) => ({ name: c.name, category: c.category, qualities: c.qualities }))];
    return subjects.every((subject) => classifyIngredientDiet(subject)[field] === "compliant");
  });
}

/** An independent witness: the words src/actions/recipes.ts reads as meat or fish. */
const MEAT_OR_FISH = /\b(beef|chicken|pork|lamb|veal|bacon|ham|sausage|turkey|duck|prosciutto|pancetta|salami|chorizo|guanciale|ragù|bolognese|fish|salmon|tuna|cod|shrimp|prawn|crab|anchov(y|ies)|dashi|bonito)\b/i;

describe("diet: derived from ingredients, the basis shown", () => {
  it.each(["vegan", "vegetarian"] as const)("%s: every recipe listed passes the classifier, and the chip says how", (diet) => {
    const result = search(diet, ALL);
    expect(result.chips).toEqual([expect.objectContaining({ kind: "diet", applied: true, basis: expect.stringContaining("ingredient classifier") })]);
    const compliant = [...index.recipeDiet].filter(([, verdicts]) => verdicts[diet] === "compliant").length;
    expect(result.total.recipe).toBe(compliant);
    expect(result.recipes.length).toBe(compliant);
    expect(result.recipes.filter((r) => !passesClassifier(r.id, diet)).map((r) => r.name)).toEqual([]);
  });

  it("no vegetarian recipe has a line the witness reads as meat or fish", () => {
    const offenders = search("vegetarian", ALL).recipes.flatMap((r) =>
      (index.recipes.get(r.id)?.ingredientLines ?? []).filter((line) => MEAT_OR_FISH.test(line)).map((line) => `${r.name}: ${line}`),
    );
    expect(offenders).toEqual([]);
  });

  it("controls: carbonara and Lasagna al Forno are not vegetarian; baba ganoush is vegan", () => {
    const vegetarian = new Set(search("vegetarian", ALL).recipes.map((r) => r.name));
    expect(vegetarian.has("Authentic Spaghetti alla Carbonara")).toBe(false);
    expect(vegetarian.has("Authentic Lasagna al Forno")).toBe(false);
    expect(search("vegan", ALL).recipes.map((r) => r.name)).toContain("Authentic Baba Ganoush");
  });

  it("gluten-free is recognised but not applied: the results are the plain search's", () => {
    const result = search("gluten free pasta", ALL);
    expect(result.chips).toEqual([expect.objectContaining({ kind: "unverified", applied: false, label: "Gluten-free · not verified" })]);
    const plain = search("pasta", ALL).recipes.map((r) => r.id);
    expect(result.recipes.map((r) => r.id)).toEqual(expect.arrayContaining(plain));
  });
});

describe("time and meal: authored facts from the static catalog", () => {
  it("quick chicken: the chicken hero, and every recipe listed states 30 minutes or less", () => {
    const result = search("quick chicken", ALL);
    expect(result.chips.map((c) => c.label)).toEqual(["Quick · 30 min or less"]);
    expect(result.hero?.key).toBe("chicken");
    const listed = [...result.recipesContaining, ...result.recipes].map((r) => index.recipes.get(r.id)?.totalMinutes ?? null);
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.every((m) => m !== null && m <= 30)).toBe(true);
    expect(result.recipesContainingTotal).toBeLessThan(result.hero?.recipeCount ?? 0);
  });

  it("a name that contains the whole query is kept though the filter would drop it", () => {
    const [first, second] = search("quick bread").recipes;
    expect([first?.name, second?.name]).toEqual(expect.arrayContaining(["Gluten-Free Feta-Dill Quick Bread"]));
    expect(index.recipes.get(first?.id ?? "")?.totalMinutes ?? null).toBeNull();
  });

  it("breakfast: every recipe is filed under breakfast, and all of them are listed", () => {
    const result = search("breakfast", ALL);
    const filed = [...index.recipes.values()].filter((r) => r.meals.includes("breakfast"));
    expect(result.total.recipe).toBe(filed.length);
    expect(result.recipes.every((r) => index.recipes.get(r.id)?.meals.includes("breakfast"))).toBe(true);
  });

  it("the HSCA archive states no time: its generator's fill-in 15 is not a time", () => {
    const archive = [...index.recipes.values()].filter((r) => r.id.startsWith("hsca-"));
    expect(archive.length).toBeGreaterThan(400);
    // [MEASURED 2026-09-25] 2 of 502 carry a parsed (non-15) time.
    expect(archive.filter((r) => r.totalMinutes !== null).length).toBeLessThanOrEqual(2);
    const others = [...index.recipes.values()].filter((r) => !r.id.startsWith("hsca-"));
    // Elsewhere only these two state no time: the recipes they are adapted
    // from give none (2026-09-26). The template stubs they replaced claimed 20 + 30.
    expect(others.filter((r) => r.totalMinutes === null).map((r) => r.id).sort()).toEqual([
      "thai-dessert-all-bua-loi",
      "thai-dessert-all-tub-tim-grob",
    ]);
  });
});

describe("ingredient intents: season, planet, quality, category", () => {
  it("in season (September): cards that name autumn; year-round cards are left out", () => {
    const result = search("in season", ALL);
    expect(result.chips.map((c) => c.label)).toEqual(["In season · Autumn"]);
    expect(result.ingredients.length).toBeGreaterThan(100);
    for (const e of result.ingredients) expect(index.ingredients.get(e.key)?.seasons).toContain("autumn");
  });

  it.each([
    ["summer fruits", (key: string): boolean => index.ingredients.get(key)?.category === "fruit" && Boolean(index.ingredients.get(key)?.seasons.includes("summer"))],
    ["mercury herbs", (key: string): boolean => Boolean(index.ingredients.get(key)?.rulingPlanets.includes("Mercury")) && index.ingredients.get(key)?.category === "culinary_herb"],
    ["warming spices", (key: string): boolean => index.ingredients.get(key)?.category === "spice" && Boolean(index.ingredients.get(key)?.qualities.some((q) => /^warm(ing)?$/i.test(q.trim())))],
  ])("%s: every card passes, A→Z", (query, passes) => {
    const { ingredients } = search(query, ALL);
    expect(ingredients.length).toBeGreaterThan(5);
    expect(ingredients.filter((e) => !passes(e.key)).map((e) => e.name)).toEqual([]);
  });
});

describe("regions, exact names, Smart Enter", () => {
  it("oaxacan: Mexican cuisine suggested and labelled; the words still search as typed", () => {
    const result = search("oaxacan");
    expect(result.cuisines[0]).toMatchObject({ key: "Mexican", href: "/cuisines/mexican" });
    expect(result.chips).toEqual([expect.objectContaining({ kind: "region", applied: false, label: "Oaxacan → Mexican cuisine" })]);
    expect(result.hero?.name).toBe("oaxaca cheese");
  });

  it.each(["spinach", "eggs", "spring onion", "carbonara"])("%s is a name: no intent, top hit exact", (query) => {
    const result = search(query);
    expect(result.chips).toEqual([]);
    expect(result.top?.exact).toBe(true);
  });

  it.each(["vegan pasta", "quick chicken", "spinach eggs", "mercury herbs", "oaxacan", "in season"])("%s: Enter goes to /search (top not exact)", (query) => {
    expect(search(query).top?.exact).toBe(false);
  });
});
