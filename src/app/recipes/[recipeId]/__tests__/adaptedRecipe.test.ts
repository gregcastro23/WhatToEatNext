/**
 * A static-only recipe page publishes what its cuisine file authors. Before
 * the 2026-09-26 ruling, /recipes/thai-dessert-all-tub-tim-grob was in the
 * sitemap with Recipe JSON-LD listing "1 unit Foundation of Tub Tim Grob".
 * Now it lists the source's ingredients and credits the source in isBasedOn.
 */
import { Children, isValidElement, type ReactNode } from "react";
import type { Recipe } from "@/types/recipe";
import RecipePage from "../page";

// A live catalog with no twin for the recipe, so the page renders the static one.
const mockLive: Recipe[] = [
  { id: "e03c3505-9729-4a7e-bc0c-5ae57aff83a9", name: "Oyakodon (Chicken and Egg Rice Bowl)", cuisine: "Japanese", ingredients: [], instructions: [] },
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

describe("/recipes/thai-dessert-all-tub-tim-grob", () => {
  it("publishes the authored ingredients, not the template's", async () => {
    const { jsonLd } = await render("thai-dessert-all-tub-tim-grob");
    expect(jsonLd.recipeIngredient).toEqual(
      expect.arrayContaining(["8 oz canned whole water chestnuts", "0.25 cup tapioca starch", "0.75 cup coconut milk"]),
    );
    expect(JSON.stringify(jsonLd)).not.toMatch(/Foundation of|binding agent|An alchemically/);
  });

  it("credits the recipe it was adapted from", async () => {
    const { jsonLd, shown } = await render("thai-dessert-all-tub-tim-grob");
    expect(jsonLd.isBasedOn).toEqual(
      expect.objectContaining({
        "@type": "Recipe",
        url: "https://hot-thai-kitchen.com/tub-tim-grob/",
        author: { "@type": "Person", name: "Pailin Chongchitnant" },
      }),
    );
    expect(shown.adaptedFrom?.publisher).toBe("Hot Thai Kitchen");
  });

  it("claims no time the source does not state", async () => {
    const { jsonLd } = await render("thai-dessert-all-tub-tim-grob");
    expect([jsonLd.prepTime, jsonLd.cookTime, jsonLd.totalTime]).toEqual([undefined, undefined, undefined]);
    expect(jsonLd.recipeYield).toBe("4 servings");
  });
});
