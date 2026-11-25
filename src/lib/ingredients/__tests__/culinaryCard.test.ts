/**
 * The culinary card over the real catalog: filler is hidden, real data kept,
 * and gaps are named.
 *
 * @jest-environment node
 */
import { getServerRecipes } from "@/actions/recipes";
import { buildIndexForRecipes } from "@/lib/search/loader";
import { CulinaryCardSchema } from "@/lib/validation/culinaryCardSchemas";
import { meaningfulOrigins, meaningfulSeasons } from "../cardFiller";
import { buildCulinaryCard } from "../culinaryCard";
import { resolveCatalogIngredient } from "../ingredientCatalog";
import type { SearchIndex } from "@/lib/search/searchIndex";
import type { CulinaryCard } from "@/lib/validation/culinaryCardSchemas";

let index: SearchIndex;

beforeAll(async () => {
  index = buildIndexForRecipes(await getServerRecipes());
}, 120_000);

function cardFor(name: string): CulinaryCard {
  const resolved = resolveCatalogIngredient(name);
  if (!resolved) throw new Error(`no card for ${name}`);
  const card = buildCulinaryCard(resolved.entry, index);
  expect(CulinaryCardSchema.safeParse(card).success).toBe(true);
  return card;
}

const section = (card: CulinaryCard, id: string): string => card.sections.find((entry) => entry.id === id)?.items.join(" | ") ?? "";

it("hides bacon's filler instead of advising to fold and bloom it", () => {
  const card = cardFor("bacon");
  expect(JSON.stringify(card.sections)).not.toMatch(/dissolve|Measure carefully|Check package for specific shelf life/);
});

it("keeps real ingredient facts", () => {
  const card = cardFor("broccoli");
  expect(section(card, "storage")).toMatch(/crisper/);
  expect(section(card, "preparation")).toMatch(/florets/i);
  expect(section(card, "nutrition")).toMatch(/Source: USDA FoodData Central/);
});

it("attaches the cited guides for the ingredient", () => {
  expect(cardFor("bacon").guides.map((guide) => guide.id)).toEqual(["bacon"]);
  expect(cardFor("chicken").guides.length).toBeGreaterThanOrEqual(2);
});

it("lists recipes that use it, without the internal archive code as a cuisine", () => {
  const card = cardFor("eggplant");
  expect(card.recipeCount).toBeGreaterThan(0);
  expect(card.recipes.every((recipe) => recipe.cuisine?.toLowerCase() !== "hsca")).toBe(true);
});

it("treats worldwide and every season as no information", () => {
  expect(meaningfulOrigins(["Worldwide", "Italy"])).toEqual(["Italy"]);
  expect(meaningfulSeasons(["all"])).toEqual([]);
  expect(meaningfulSeasons(["spring", "summer", "autumn", "winter"])).toEqual([]);
  expect(meaningfulSeasons(["autumn"])).toEqual(["fall"]);
});
