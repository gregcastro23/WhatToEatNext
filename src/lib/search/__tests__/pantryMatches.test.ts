/**
 * Recipes for what the cook has, over the real static catalog.
 *
 * @jest-environment node
 */
import { getServerRecipes } from "@/actions/recipes";
import { PantryQuerySchema } from "@/lib/validation/pantrySearchSchemas";
import { buildIndexForRecipes } from "../loader";
import { pantryMatches } from "../pantryMatches";
import type { SearchIndex } from "../searchIndex";

let index: SearchIndex;

beforeAll(async () => {
  index = buildIndexForRecipes(await getServerRecipes());
}, 120_000);

it("ranks recipes by how many of the ingredients they use", () => {
  const result = pantryMatches(index, { ingredients: ["eggplant", "tahini"], diet: null });
  expect(result.ingredients.map((item) => item.name !== null)).toEqual([true, true]);
  const [first] = result.recipes;
  expect(first?.uses).toHaveLength(2);
  expect(first?.missing).toEqual([]);
  const counts = result.recipes.map((recipe) => recipe.uses.length);
  expect(counts).toEqual([...counts].sort((a, b) => b - a));
});

it("says which typed words are no ingredient, instead of guessing", () => {
  const result = pantryMatches(index, { ingredients: ["zzqxj"], diet: null });
  expect(result.ingredients).toEqual([{ term: "zzqxj", name: null, href: null }]);
  expect(result.recipes).toEqual([]);
});

it("keeps only recipes the classifier finds vegan", () => {
  const all = pantryMatches(index, { ingredients: ["chickpeas"], diet: null });
  const vegan = pantryMatches(index, { ingredients: ["chickpeas"], diet: "vegan" });
  expect(vegan.total).toBeLessThan(all.total);
  expect(vegan.recipes.every((recipe) => index.recipeDiet.get(recipe.id)?.vegan === "compliant")).toBe(true);
});

it("refuses an empty or oversized query", () => {
  expect(PantryQuerySchema.safeParse({ ingredients: [], diet: null }).success).toBe(false);
  expect(PantryQuerySchema.safeParse({ ingredients: Array.from({ length: 13 }, () => "egg"), diet: null }).success).toBe(false);
  expect(PantryQuerySchema.safeParse({ ingredients: ["egg"], diet: "keto" }).success).toBe(false);
});
