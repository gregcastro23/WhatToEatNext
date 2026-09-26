/**
 * The HSCA archive's meals are derived from its source categories
 * (hscaMealFiling). These tests replay the rule over the real source,
 * recipes_database.json, and check the committed cuisine file against it: the
 * file cannot be regenerated wholesale (its computed alchemy has drifted), so
 * this is what keeps the data and the rule in step.
 */
import fs from "fs";
import path from "path";
import { getServerRecipeIndex, getServerRecipes } from "@/actions/recipes";
import { cuisine } from "@/data/cuisines/hsca";
import { fileHscaRecipe, type HscaMeal, type HscaSourceRecipe } from "../hscaMealFiling";

interface SourceRecipe extends HscaSourceRecipe {
  title: string;
}

const source: SourceRecipe[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "recipes_database.json"), "utf8"));
const MEALS: readonly HscaMeal[] = ["breakfast", "lunch", "dinner", "dessert"];
const SEASONS = ["spring", "summer", "autumn", "winter", "all"];

/** The generator's own name for a recipe. */
function nameOf(recipe: SourceRecipe): string {
  return recipe.name || recipe.title || "Unnamed Recipe";
}

function filingOf(name: string): ReturnType<typeof fileHscaRecipe> {
  const recipe = source.find((r) => nameOf(r) === name);
  if (!recipe) throw new Error(`no source recipe named ${name}`);
  return fileHscaRecipe({ ...recipe, name });
}

describe("fileHscaRecipe over the real source", () => {
  it.each([
    ["HERBED DINNER ROLLS", "no signal: the generator's name hash picks the bucket, no meal is claimed", []],
    ["GREEN JUICE", "a drink is filed under breakfast but is not one", []],
    ["BASIL-WALNUT PESTO", "a sauce is filed under lunch but is not one", []],
    ["CHOCOLATE PUDDING", "tagged brunch and dessert: both", ["breakfast", "dessert"]],
    ["Tofu Ricotta", "an appetizer keeps lunch", ["lunch"]],
  ])("%s: %s", (name, _why, meals) => {
    expect(filingOf(name).meals).toEqual(meals);
  });

  it("claims no meal for 183 recipes: 76 with no signal, 20 drinks, 87 sauces", () => {
    const filings = source.map((r) => ({ recipe: r, filing: fileHscaRecipe({ ...r, name: nameOf(r) }) }));
    const unclaimed = filings.filter(({ filing }) => filing.meals.length === 0);
    expect(unclaimed.length).toBe(183);
    expect(unclaimed.filter(({ filing }) => filing.bucket === "breakfast").length).toBe(20);
    expect(filings.filter(({ filing }) => filing.meals.length === 2).map(({ recipe }) => nameOf(recipe))).toContain("CRÊPES SUZETTE");
  });
});

describe("the committed hsca.ts agrees with the rule", () => {
  const entries = MEALS.flatMap((bucket) =>
    SEASONS.flatMap((season) => (cuisine.dishes?.[bucket]?.[season] ?? []).map((dish) => ({ bucket, season, dish }))),
  );

  it("every dish sits in its bucket and carries exactly the meals its source supports", () => {
    expect(entries.length).toBeGreaterThan(500);
    const disagreements = entries.flatMap(({ bucket, season, dish }) => {
      const candidates = source.filter((r) => nameOf(r) === dish.name).map((r) => fileHscaRecipe({ ...r, name: nameOf(r) }));
      const filing = candidates.find((c) => c.bucket === bucket);
      const effective = dish.mealType ?? [bucket];
      const recorded = dish.classifications?.mealType;
      const agrees = filing !== undefined && JSON.stringify(effective) === JSON.stringify(filing.meals) && JSON.stringify(recorded) === JSON.stringify(filing.meals);
      return agrees ? [] : [`${bucket}/${season} ${dish.name}: shows ${JSON.stringify(effective)}, rule ${JSON.stringify(filing?.meals)}`];
    });
    expect(disagreements).toEqual([]);
  });
});

describe("in the static catalog", () => {
  async function bucketsOf(name: string): Promise<{ id: string; mealType: unknown; buckets: string[] }> {
    const [recipes, index] = await Promise.all([getServerRecipes(), getServerRecipeIndex()]);
    const recipe = recipes.find((r) => r.name === name);
    if (!recipe) throw new Error(`${name} is not in the static catalog`);
    const buckets = [...index].filter(([, list]) => list.some((r) => r.id === recipe.id)).map(([key]) => key.split("-")[0]);
    return { id: String(recipe.id), mealType: recipe.mealType, buckets: [...new Set(buckets)].sort() };
  }

  it("a pesto keeps its id but claims no meal, so the menu planner never offers it as one", async () => {
    expect(await bucketsOf("BASIL-WALNUT PESTO")).toEqual({ id: "hsca-lunch-all-basil-walnut-pesto", mealType: [], buckets: [] });
  });

  it("Chocolate Pudding is offered for breakfast and for dessert", async () => {
    expect(await bucketsOf("CHOCOLATE PUDDING")).toMatchObject({ mealType: ["breakfast", "dessert"], buckets: ["breakfast", "dessert"] });
  });

  it("a hand-authored recipe is untouched", async () => {
    // Filed under dinner and classified ["dinner"], so it claims dinner however its meal is read (#896).
    expect(await bucketsOf("Authentic Beef Bourguignon")).toMatchObject({ mealType: ["dinner"], buckets: ["dinner"] });
  });
});
