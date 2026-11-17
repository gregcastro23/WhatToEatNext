/**
 * UI & action tests for FastStartCard ("Plan Balanced Meals Before You Shop")
 * and usePlanActions multi-ingredient `.some()` filtering.
 *
 * @file src/components/menu-planner/__tests__/fastStartAndPlanActions.test.tsx
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import FastStartCard from "@/components/menu-planner/redesign/FastStartCard";
import { usePlanActions } from "@/components/menu-planner/shell/usePlanActions";
import type { GenerationPreferences } from "@/contexts/MenuPlannerContext";
import type { DayOfWeek, MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

const mockGenerateMealsForDay = jest.fn().mockResolvedValue(undefined);
const mockUpdatePreference = jest.fn();
const mockSetWeeklyBudget = jest.fn();
const mockAddMealToSlot = jest.fn().mockResolvedValue(undefined);
const mockGetServerRecipes = jest.fn().mockResolvedValue([]);

const baseRecipe: Recipe = {
  id: "low-protein-toast",
  name: "Plain Toast",
  mealType: ["dinner"],
  ingredients: [{ name: "bread", amount: 2, unit: "slices" }],
  instructions: ["Toast bread"],
  elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.5, Air: 0.1 },
  nutrition: { calories: 140, protein: 4, fiber: 1 },
};

const beanDinnerCandidate: Recipe = {
  id: "black-bean-bowl",
  name: "Spiced Black Bean Bowl",
  mealType: ["dinner"],
  ingredients: [
    { name: "black beans", amount: 1, unit: "can" },
    { name: "brown rice", amount: 1, unit: "cup" },
  ],
  instructions: ["Simmer beans and serve over rice"],
  elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
  nutrition: { calories: 480, protein: 22, fiber: 11 },
};

let mockMeals: MealSlot[] = [];
const mockPrefs: GenerationPreferences = {
  dietaryRestrictions: [],
  excludeIngredients: [],
  requiredIngredients: [],
  preferredCuisines: [],
  preferredCookingMethods: [],
  flavorPreferences: [],
  maxPrepTimeMinutes: null,
  nutritionalTargets: {
    dailyCalories: 2000,
    dailyProteinG: null,
    dailyCarbsG: null,
    dailyFatG: null,
    dailyFiberG: null,
    prioritizeProtein: false,
    prioritizeFiber: false,
  },
};

jest.mock("@/contexts/MenuPlannerContext", () => ({
  useMenuPlanner: () => ({
    currentMenu: { id: "week-test", meals: mockMeals },
    addMealToSlot: mockAddMealToSlot,
    generateMealsForDay: mockGenerateMealsForDay,
    generationPreferences: mockPrefs,
    updateGenerationPreference: mockUpdatePreference,
    setWeeklyBudget: mockSetWeeklyBudget,
  }),
}));

jest.mock("@/contexts/UserContext", () => ({ useOptionalUser: () => null }));
jest.mock("@/actions/recipes", () => ({
  getServerRecipes: () => mockGetServerRecipes(),
}));
jest.mock("@/lib/questReporter", () => ({ reportQuestEvent: jest.fn() }));

function makeSlot(dayOfWeek: DayOfWeek, mealType: MealType, filled: boolean): MealSlot {
  const at = new Date("2026-11-15T12:00:00Z");
  return {
    id: `${dayOfWeek}-${mealType}`,
    dayOfWeek,
    mealType,
    servings: 1,
    ...(filled ? { recipe: baseRecipe } : {}),
    createdAt: at,
    updatedAt: at,
    planetarySnapshot: {
      dominantPlanet: "Sun",
      zodiacSign: "libra",
      lunarPhase: "waxing crescent",
      elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      timestamp: at,
    },
  };
}

function BalanceHarness(): React.JSX.Element {
  const { balance } = usePlanActions(["dinner"]);
  return (
    <button
      type="button"
      onClick={() => {
        balance().catch(() => {});
      }}
    >
      Run balance
    </button>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPrefs.requiredIngredients = [];
  mockMeals = [
    makeSlot(1, "dinner", true),
    makeSlot(2, "dinner", true),
    makeSlot(3, "dinner", true),
    makeSlot(4, "dinner", true),
  ];
});

describe("FastStartCard ingredient-first bar", () => {
  it("plans 3 dinners on Mon/Wed/Fri with parsed featured ingredients and selected diet", async () => {
    render(<FastStartCard />);

    fireEvent.click(screen.getByRole("button", { name: "Vegetarian" }));
    fireEvent.change(
      screen.getByPlaceholderText(/Ingredients to feature/i),
      { target: { value: "Rice, black beans; Spinach" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Build Plan & Cart" }));

    await waitFor(() => {
      expect(mockGenerateMealsForDay).toHaveBeenCalledTimes(3);
    });

    expect(mockUpdatePreference).toHaveBeenCalledWith("requiredIngredients", [
      "rice",
      "black beans",
      "spinach",
    ]);
    const calls = mockGenerateMealsForDay.mock.calls;
    expect(calls.map((c) => c[0])).toEqual([1, 3, 5]);
    expect(calls[0]?.[1]).toEqual({
      mealTypes: ["dinner"],
      dietaryRestrictions: ["vegetarian"],
      requiredIngredients: ["rice", "black beans", "spinach"],
    });
  });

  it("switches scopes for 5 Dinners (Mon-Fri) and Full Week (all 7 days)", async () => {
    render(<FastStartCard />);

    fireEvent.click(screen.getByRole("button", { name: "5 Dinners" }));
    fireEvent.click(screen.getByRole("button", { name: "Build Plan & Cart" }));
    await waitFor(() => {
      expect(mockGenerateMealsForDay).toHaveBeenCalledTimes(5);
    });
    expect(mockGenerateMealsForDay.mock.calls.map((c) => c[0])).toEqual([1, 2, 3, 4, 5]);

    mockGenerateMealsForDay.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Full Week" }));
    fireEvent.click(screen.getByRole("button", { name: "Build Plan & Cart" }));
    await waitFor(() => {
      expect(mockGenerateMealsForDay).toHaveBeenCalledTimes(7);
    });
    expect(mockGenerateMealsForDay.mock.calls[0]?.[1]).toEqual({
      mealTypes: ["breakfast", "lunch", "dinner"],
      dietaryRestrictions: [],
    });
  });
});

describe("usePlanActions multi-ingredient .some() filtering", () => {
  it("allows balancing swaps when a candidate matches at least one required ingredient", async () => {
    mockPrefs.requiredIngredients = ["black beans", "spinach"];
    mockGetServerRecipes.mockResolvedValueOnce([beanDinnerCandidate]);

    render(<BalanceHarness />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Run balance" }));
    });

    await waitFor(() => {
      expect(mockAddMealToSlot).toHaveBeenCalled();
    });
    expect(mockAddMealToSlot).toHaveBeenCalledWith(1, "dinner", beanDinnerCandidate);
  });
});
