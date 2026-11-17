/**
 * Regression test for /recipes/af6a2673-93b0-4e4e-9aed-c35949813442
 * ("Authentic Risotto alla Milanese"), which threw 500 FUNCTION_INVOCATION_FAILED
 * in Vercel production due to:
 *   1. `await searchParams` inside an ISR (`revalidate = 86400`) route causing
 *      Next.js 15 `DYNAMIC_SERVER_USAGE` during server rendering.
 *   2. `LocalRecipeService.getRecipeById` triggering full-catalog DB scans before
 *      querying the single UUID row by primary key.
 *
 * @file src/app/recipes/[recipeId]/__tests__/risottoSsrRegression.test.ts
 */

const mockExecuteQuery = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));
jest.mock("@/lib/redis", () => ({
  redisGet: async () => null,
  redisSet: async () => undefined,
  redisDel: async () => undefined,
}));
jest.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
jest.mock("next/server", () => ({
  after: (fn: () => void) => fn(),
}));
jest.mock("../RecipeClient", () => ({ __esModule: true, default: (): null => null }));
jest.mock("@/services/recipeRecommendations", () => ({
  _recipeRecommender: { recommendSimilarRecipes: async (): Promise<[]> => [] },
}));
jest.mock("@/services/sauceRecommender", () => ({
  sauceRecommender: { recommendSauce: async (): Promise<[]> => [] },
}));

import { Children, isValidElement, type ReactNode } from "react";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import type { Recipe } from "@/types/recipe";
import RecipePage, { generateMetadata } from "../page";

const RISOTTO_UUID = "af6a2673-93b0-4e4e-9aed-c35949813442";

const RISOTTO_DB_ROW = {
  id: RISOTTO_UUID,
  name: "Authentic Risotto alla Milanese",
  description:
    "The golden jewel of Milan. A creamy, rich, saffron-infused rice dish requiring constant attention, continuous stirring, and a precise finish of butter and cheese (mantecatura).",
  cuisine: "Italian",
  category: "main",
  prep_time_minutes: 30,
  cook_time_minutes: 30,
  servings: 4,
  dietary_tags: "{}",
  allergens: [],
  nutritional_profile: { calories: 1184.26, protein: 102.72, carbs: 3.36, fat: 73.6 },
  image_url: "https://assets.alchm.kitchen/recipes/af6a2673-93b0-4e4e-9aed-c35949813442.png",
  created_at: "2026-05-06T01:15:00.501Z",
  updated_at: "2026-07-02T22:57:59.437Z",
  read_model: {
    id: RISOTTO_UUID,
    name: "Authentic Risotto alla Milanese",
    cuisine: "Italian",
    category: "main",
    contexts: [],
    servings: 4,
    allergens: [],
    dietary_tags: [],
    image_url: "https://assets.alchm.kitchen/recipes/af6a2673-93b0-4e4e-9aed-c35949813442.png",
    description:
      "The golden jewel of Milan. A creamy, rich, saffron-infused rice dish requiring constant attention, continuous stirring, and a precise finish of butter and cheese (mantecatura).",
    ingredients: [
      { name: "carnaroli or arborio rice", unit: "g", amount: 320, optional: false },
      { name: "saffron threads", unit: "tsp", amount: 0.5, optional: false },
    ],
    instructions: [
      "Step 1: Sauté the minced onion in butter until translucent but not browned.",
      "Step 2: Add the rice and toast it for 2-3 minutes until the edges turn translucent.",
    ],
    prep_time_minutes: 30,
    cook_time_minutes: 30,
    elemental_properties: { air: 0.1225, fire: 0.3325, earth: 0.305, water: 0.24 },
  },
};

describe("/recipes/af6a2673-93b0-4e4e-9aed-c35949813442 SSR & cold-start lookup regression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    LocalRecipeService.clearCache();
  });

  it("queries the single UUID directly on a cold cache without blocking on a full catalog scan", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [RISOTTO_DB_ROW] });

    const recipe = await LocalRecipeService.getRecipeById(RISOTTO_UUID);
    expect(recipe?.id).toBe(RISOTTO_UUID);
    expect(recipe?.name).toBe("Authentic Risotto alla Milanese");
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const firstCall = mockExecuteQuery.mock.calls[0];
    expect(String(firstCall?.[0] ?? "")).toContain("AND r.id = $1");
    expect(firstCall?.[1]).toEqual([RISOTTO_UUID]);
  });

  it("renders metadata and RecipePage cleanly without touching searchParams (no DYNAMIC_SERVER_USAGE)", async () => {
    mockExecuteQuery.mockResolvedValue({ rows: [RISOTTO_DB_ROW] });

    const trapSearchParams = new Promise<{ persona?: string }>((_resolve, reject) => {
      reject(Object.assign(new Error("Dynamic server usage"), { digest: "DYNAMIC_SERVER_USAGE" }));
    });
    trapSearchParams.catch(() => undefined);

    const meta = await generateMetadata({
      params: Promise.resolve({ recipeId: RISOTTO_UUID }),
    });
    expect(meta.title).toBe("Authentic Risotto alla Milanese");

    const page: ReactNode = await RecipePage({
      params: Promise.resolve({ recipeId: RISOTTO_UUID }),
      searchParams: trapSearchParams,
    });
    expect(isValidElement(page)).toBe(true);
    let renderedRecipe: Recipe | null = null;
    if (isValidElement<{ children: ReactNode }>(page)) {
      for (const child of Children.toArray(page.props.children)) {
        if (isValidElement<{ recipe: Recipe }>(child) && child.type !== "script") {
          renderedRecipe = child.props.recipe;
        }
      }
    }
    expect(renderedRecipe?.name).toBe("Authentic Risotto alla Milanese");
  });
});
