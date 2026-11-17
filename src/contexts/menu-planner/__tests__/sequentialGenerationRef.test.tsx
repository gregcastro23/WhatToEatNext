/**
 * Verifies MenuPlannerProvider keeps a synchronous currentMenuRef across
 * consecutive generateMealsForDay() calls (preventing stale existingMeals = []
 * closures during fillWeek / FastStartCard loops) and forwards pantryInventory.
 *
 * @file src/contexts/menu-planner/__tests__/sequentialGenerationRef.test.tsx
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MenuPlannerProvider, useMenuPlanner } from "@/contexts/menu-planner/MenuPlannerProvider";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";

const mockGenerateDayRecommendations = jest.fn();

const chickenDinner: RecommendedMeal = {
  mealType: "dinner",
  score: 0.9,
  reasons: ["Fits required ingredients"],
  dayAlignment: 0.9,
  planetaryAlignment: 0.8,
  recipe: {
    id: "day1-chicken",
    name: "Herb Roast Chicken",
    cuisine: "Mediterranean",
    mealType: ["dinner"],
    ingredients: [
      { name: "chicken thigh", amount: 1, unit: "lb" },
      { name: "fresh spinach", amount: 2, unit: "cup" },
    ],
    instructions: ["Roast chicken with spinach"],
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    monicaOptimization: {
      originalMonica: null,
      optimizedMonica: 1,
      optimizationScore: 0.5,
      temperatureAdjustments: [],
      timingAdjustments: [],
      intensityModifications: [],
      planetaryTimingRecommendations: [],
    },
    seasonalAdaptation: {
      currentSeason: "autumn",
      seasonalScore: 0.7,
      seasonalIngredientSubstitutions: [],
      seasonalCookingMethodAdjustments: [],
    },
    cuisineIntegration: {
      authenticity: 0.9,
      fusionPotential: 0.5,
      culturalNotes: [],
      traditionalVariations: [],
      modernAdaptations: [],
    },
    nutritionalOptimization: {
      alchemicalNutrition: {
        spiritNutrients: [],
        essenceNutrients: [],
        matterNutrients: [],
        substanceNutrients: [],
      },
      elementalNutrition: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
      kalchmNutritionalBalance: 0.5,
      monicaNutritionalHarmony: 0.5,
    },
  },
};

jest.mock("@/contexts/UserContext", () => ({
  useUser: () => ({ currentUser: null }),
}));

jest.mock("@/hooks/useAstrologicalState", () => ({
  useAstrologicalState: () => ({
    currentZodiac: "libra",
    lunarPhase: "waxing crescent",
    activePlanets: ["Sun"],
    domElements: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  }),
}));

jest.mock("@/utils/pantryManager", () => ({
  __esModule: true,
  default: {
    getPantry: () => [{ name: "Olive Oil", quantity: 1, unit: "bottle", category: "pantry" }],
    addItem: jest.fn(),
  },
}));

jest.mock("@/utils/menuPlanner/recommendationBridge", () => ({
  getPrimaryProtein: (recipe: { ingredients: Array<{ name: string }> }) =>
    recipe.ingredients[0]?.name,
  generateDayRecommendations: (...args: unknown[]) => mockGenerateDayRecommendations(...args),
}));

jest.mock("@/lib/questReporter", () => ({ reportQuestEvent: jest.fn() }));

function SequentialHarness(): React.JSX.Element {
  const { isLoading, currentMenu, generateMealsForDay } = useMenuPlanner();
  const handleRun = async (): Promise<void> => {
    await generateMealsForDay(1, { mealTypes: ["dinner"], requiredIngredients: ["chicken", "beans"] });
    await generateMealsForDay(3, { mealTypes: ["dinner"], requiredIngredients: ["chicken", "beans"] });
  };
  return (
    <div>
      <span>{isLoading || !currentMenu ? "loading" : "ready"}</span>
      <button
        type="button"
        onClick={() => {
          handleRun().catch(() => {});
        }}
      >
        Plan Two Days
      </button>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateDayRecommendations.mockResolvedValue([chickenDinner]);
});

describe("MenuPlannerProvider sequential currentMenuRef tracking", () => {
  it("passes day 1 meal into day 3 existingMeals synchronously without waiting for re-render", async () => {
    render(
      <MenuPlannerProvider>
        <SequentialHarness />
      </MenuPlannerProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Plan Two Days" }));
    });

    await waitFor(() => {
      expect(mockGenerateDayRecommendations).toHaveBeenCalledTimes(2);
    });

    const firstCallOptions = mockGenerateDayRecommendations.mock.calls[0]?.[2];
    const secondCallOptions = mockGenerateDayRecommendations.mock.calls[1]?.[2];

    expect(firstCallOptions.existingMeals).toEqual([]);
    expect(firstCallOptions.pantryInventory).toEqual(["olive oil"]);
    expect(secondCallOptions.existingMeals).toHaveLength(1);
    expect(secondCallOptions.existingMeals[0]).toMatchObject({
      recipeId: "day1-chicken",
      recipeName: "Herb Roast Chicken",
      cuisine: "Mediterranean",
      primaryProtein: "chicken thigh",
    });
  });
});
