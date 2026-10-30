/**
 * The page shows each generated recipe once: names that differ only by an
 * enhancement or copy suffix, case, or punctuation are the same dish.
 */
import { isRecommendedMeal } from "@/lib/recipe-builder/generateRecommendations";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";
import { deduplicateRecipes } from "../useRecipeGeneration";

// The hook's module also reads the user and the sky; this suite needs neither.
jest.mock("@/contexts/UserContext", () => ({ useUser: jest.fn() }));
jest.mock("@/hooks/useAstrologicalState", () => ({ useAstrologicalState: jest.fn() }));

function meal(name: string): RecommendedMeal {
  const raw: unknown = {
    mealType: "dinner",
    recipe: { id: name, name },
    score: 0.5,
    reasons: [],
    dayAlignment: 0.5,
    planetaryAlignment: 0.5,
  };
  if (!isRecommendedMeal(raw)) throw new Error("fixture is not a RecommendedMeal");
  return raw;
}

describe("deduplicateRecipes", () => {
  it("keeps the first of each dish and drops its suffixed, recased, or repunctuated repeats", () => {
    const names = deduplicateRecipes([
      meal("Garlic Soup"),
      meal("garlic soup (Monica Enhanced)"),
      meal("Garlic Soup - Copy 2"),
      meal("GARLIC SOUP!"),
      meal("Tomato Salad"),
    ]).map((m) => m.recipe.name);

    expect(names).toEqual(["Garlic Soup", "Tomato Salad"]);
  });
});
