/**
 * The recipe page shows and publishes authored times and meal, never the live
 * catalog's placeholders: every live recipe stores prep 30 + cook 30 and
 * "main" (measured 2026-09-25, 1,063 of 1,063). The static catalog is real;
 * the live catalog is two recipes shaped the way LocalRecipeService maps them.
 */
import { Children, isValidElement, type ReactNode } from "react";
import { getServerRecipes } from "@/actions/recipes";
import type { Recipe } from "@/types/recipe";
import RecipePage from "../page";

const OYAKODON_ID = "e03c3505-9729-4a7e-bc0c-5ae57aff83a9";
const AGUA_FRESCA_ID = "7d2f6a0e-3b1c-4e8a-9f55-2c4b8e1d0a63";
const TIRAMISU_ID = "3f8b2c1d-6e4a-4b7f-8c2d-9a1e5f3b7c40";
const CHOWDER_ID = "b6d4e2f0-1a3c-4e5b-9d7f-0c2e4a6b8d91";
const PLACEHOLDER = { prepTime: "30", cookTime: "30", totalTime: "60", timeToMake: "60 minutes", mealType: ["main"] };

const mockLive: Recipe[] = [
  { id: OYAKODON_ID, name: "Oyakodon (Chicken and Egg Rice Bowl)", cuisine: "Japanese", ingredients: [], instructions: [], ...PLACEHOLDER },
  // HSCA recipes reach the live catalog with no cuisine.
  { id: AGUA_FRESCA_ID, name: "Cucumber Agua Fresca", ingredients: [], instructions: [], ...PLACEHOLDER },
  // Filed under dinner; classified as a dessert.
  { id: TIRAMISU_ID, name: "Authentic Tiramisù", cuisine: "Italian", ingredients: [], instructions: [], ...PLACEHOLDER },
  // Filed under dinner; classified ["lunch", "dinner"].
  { id: CHOWDER_ID, name: "Classic New England Clam Chowder", cuisine: "American", ingredients: [], instructions: [], ...PLACEHOLDER },
];

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getRecipeById: async (id: string): Promise<Recipe | null> => mockLive.find((r) => r.id === id) ?? null,
    getAllRecipes: async (): Promise<Recipe[]> => mockLive,
    isCatalogDegraded: (): boolean => false,
  },
}));
jest.mock("@/services/recipeRecommendations", () => ({ _recipeRecommender: { recommendSimilarRecipes: async (): Promise<[]> => [] } }));
jest.mock("@/services/sauceRecommender", () => ({ sauceRecommender: { recommendSauce: async (): Promise<[]> => [] } }));
jest.mock("@/lib/database", () => ({ executeQuery: async (): Promise<{ rows: [] }> => ({ rows: [] }) }));
jest.mock("../RecipeClient", () => ({ __esModule: true, default: (): null => null }));

interface Rendered {
  jsonLd: Record<string, unknown>;
  shown: Recipe;
}

async function render(recipeId: string): Promise<Rendered> {
  const page: ReactNode = await RecipePage({ params: Promise.resolve({ recipeId }) });
  if (!isValidElement<{ children: ReactNode }>(page)) throw new Error("the page rendered no element");
  let jsonLd: Record<string, unknown> | null = null;
  let shown: Recipe | null = null;
  for (const child of Children.toArray(page.props.children)) {
    if (isValidElement<{ dangerouslySetInnerHTML: { __html: string } }>(child) && child.type === "script") {
      jsonLd = JSON.parse(child.props.dangerouslySetInnerHTML.__html);
    } else if (isValidElement<{ recipe: Recipe }>(child)) {
      shown = child.props.recipe;
    }
  }
  if (!jsonLd || !shown) throw new Error("the page rendered no JSON-LD or no recipe");
  return { jsonLd, shown };
}

describe("recipe page times and meal", () => {
  it("Oyakodon publishes its authored 10 + 12 minutes and its meals, not PT1H and main", async () => {
    const { jsonLd, shown } = await render(OYAKODON_ID);
    // Filed under dinner, classified ["lunch", "dinner"]: dinner leads.
    expect(jsonLd).toMatchObject({ prepTime: "PT10M", cookTime: "PT12M", totalTime: "PT22M", recipeCategory: "dinner", keywords: "Japanese, dinner, lunch" });
    expect(shown).toMatchObject({ prepTime: "10", cookTime: "12", totalTime: "22", timeToMake: "22 minutes", mealType: ["dinner", "lunch"] });
  });

  it("an HSCA drink publishes no time (its 15 is the generator's fill-in) and no meal (a drink is not breakfast)", async () => {
    const { jsonLd, shown } = await render(AGUA_FRESCA_ID);
    for (const key of ["prepTime", "cookTime", "totalTime"]) expect(jsonLd).not.toHaveProperty(key);
    for (const key of ["prepTime", "cookTime", "totalTime", "timeToMake"]) expect(shown).not.toHaveProperty(key);
    const twin = (await getServerRecipes()).find((r) => r.id === "hsca-breakfast-spring-cucumber-agua-fresca");
    expect(twin).toMatchObject({ prepTime: "10", cookTime: "15", mealType: [] });
    expect(jsonLd).not.toHaveProperty("recipeCategory");
    expect(shown).not.toHaveProperty("mealType");
  });

  it("a dessert filed under dinner publishes dessert, the meal its classification names", async () => {
    const { jsonLd } = await render(TIRAMISU_ID);
    expect(jsonLd).toMatchObject({ recipeCategory: "dessert", keywords: "Italian, dessert" });
  });

  it("a dish claiming lunch and dinner keeps the meal it is filed under first", async () => {
    const { jsonLd, shown } = await render(CHOWDER_ID);
    expect(jsonLd).toMatchObject({ recipeCategory: "dinner", keywords: "American, dinner, lunch" });
    expect(shown.mealType).toEqual(["dinner", "lunch"]);
  });

  it("no page carries the placeholders", async () => {
    for (const id of [OYAKODON_ID, AGUA_FRESCA_ID]) {
      const { jsonLd } = await render(id);
      expect(JSON.stringify(jsonLd)).not.toMatch(/PT30M|PT1H|"main"/);
    }
  });
});
