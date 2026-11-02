/**
 * Tests for WeekBoard to Posso Grocery Auto-Sync & Elemental Meal Harmony Visualizer
 *
 * @file src/components/menu-planner/__tests__/weekBoardGrocerySyncAndElementalHarmony.test.tsx
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import type { MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import { generateGroceryList } from "@/utils/groceryListGenerator";
import BoardSlot from "../board/BoardSlot";
import MealDetailSheet from "../board/MealDetailSheet";
import WeekBoard from "../board/WeekBoard";
import GroceryListModal from "../GroceryListModal";
import ElementalHarmonyModal from "../modals/ElementalHarmonyModal";
import PossoWidget from "../PossoWidget";
import { PlannerUIProvider, usePlannerUI } from "../shell/PlannerUIContext";
import WeekSummaryStrip from "../shell/WeekSummaryStrip";

// Mock GroceryCartContext & Analytics
jest.mock("@vercel/analytics", () => ({
  track: jest.fn(),
}));

jest.mock("@/contexts/GroceryCartContext", () => ({
  useGroceryCart: () => ({
    addRecipe: jest.fn(),
    addIngredient: jest.fn(),
  }),
}));

let mockPlannerContext: Record<string, unknown> = {};

// Mock MenuPlannerContext
jest.mock("@/contexts/MenuPlannerContext", () => ({
  useMenuPlanner: () => mockPlannerContext,
}));

// Mock useFavoriteRecipes
jest.mock("@/lib/recipes/favoriteRecipes", () => ({
  useFavoriteRecipes: () => ({
    topTrackedIngredients: [{ name: "garlic", count: 4 }],
    topLikedIngredients: [{ name: "olive oil", count: 5 }],
    isFavorite: () => false,
    toggleFavorite: jest.fn(),
  }),
}));

// Mock getServerRecipes
jest.mock("@/actions/recipes", () => ({
  getServerRecipes: jest.fn().mockResolvedValue([]),
}));

// Mock Spacetime
jest.mock("@/hooks/useSpacetimeLiveRecipes", () => ({
  useSpacetimeLiveRecipes: () => [],
}));

// Mock RecipeQueue
jest.mock("@/contexts/RecipeQueueContext", () => ({
  useRecipeQueue: () => ({
    addToQueue: jest.fn(),
    isInQueue: () => false,
  }),
}));

// Mock Toast
jest.mock("@/components/common/Toast", () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
    toast: null,
  }),
}));

const mockRecipe: Recipe = {
  id: "recipe-sun-fire",
  name: "Spicy Solar Shakshuka",
  cuisine: "Middle Eastern",
  servings: 2,
  ingredients: [
    { name: "Olive Oil", amount: 2, unit: "tbsp" },
    { name: "Garlic", amount: 3, unit: "cloves" },
    { name: "Tomatoes", amount: 4, unit: "whole" },
    { name: "Chili Flakes", amount: 1, unit: "tsp" },
  ],
  instructions: ["Cook garlic in olive oil", "Add tomatoes and simmer"],
  prepTime: 20,
  nutrition: { calories: 350 },
  elementalProperties: {
    Fire: 0.8,
    Air: 0.2,
    Water: 0.0,
    Earth: 0.0,
  },
};

const breakfastType: MealType = "breakfast";

const mockSlot: MealSlot = {
  id: "slot-sun-breakfast",
  dayOfWeek: 0, // Sunday (Sun / Fire)
  mealType: breakfastType,
  recipe: mockRecipe,
  servings: 2,
  isLocked: false,
};

describe("WeekBoard → Posso Grocery Auto-Sync", () => {
  it("generateGroceryList flags items matching pantryItems with inPantry: true", () => {
    const list = generateGroceryList([mockSlot], {
      pantryItems: ["Olive Oil", "Garlic"],
    });

    const oliveOil = list.find((i) => i.ingredient.toLowerCase().includes("olive oil"));
    const garlic = list.find((i) => i.ingredient.toLowerCase().includes("garlic"));
    const tomatoes = list.find((i) => i.ingredient.toLowerCase().includes("tomato"));

    expect(oliveOil?.inPantry).toBe(true);
    expect(garlic?.inPantry).toBe(true);
    expect(tomatoes?.inPantry).toBe(false);
  });

  it("generateGroceryList respects excludePantryItems: true by filtering inPantry items", () => {
    const list = generateGroceryList([mockSlot], {
      pantryItems: ["Olive Oil", "Garlic"],
      excludePantryItems: true,
    });

    const oliveOil = list.find((i) => i.ingredient.toLowerCase().includes("olive oil"));
    const tomatoes = list.find((i) => i.ingredient.toLowerCase().includes("tomato"));

    expect(oliveOil).toBeUndefined();
    expect(tomatoes).toBeDefined();
    expect(tomatoes?.inPantry).toBe(false);
  });

  it("BoardSlot displays pantry readiness badge when recipe ingredients are in pantry", () => {
    mockPlannerContext = {
      inventory: ["olive oil", "garlic"],
    };

    render(
      <BoardSlot
        slot={mockSlot}
        isToday={false}
        placingRecipe={null}
        isGenerating={false}
        onOpen={jest.fn()}
        onPickRecipe={jest.fn()}
        onSuggest={jest.fn()}
        onPlace={jest.fn()}
        onCopy={jest.fn()}
        onRemove={jest.fn()}
        onDropSlot={jest.fn()}
        onDropRecipe={jest.fn()}
      />,
    );

    // 2 out of 4 ingredients in pantry
    expect(screen.getByText("2/4 Pantry")).toBeInTheDocument();
  });

  it("MealDetailSheet renders ingredients list with In Pantry badges and + Add to Pantry buttons", () => {
    const mockSetInventory = jest.fn();
    mockPlannerContext = {
      inventory: ["olive oil", "garlic"],
      setInventory: mockSetInventory,
      updateMealServings: jest.fn().mockResolvedValue(undefined),
      lockMeal: jest.fn(),
      unlockMeal: jest.fn(),
      addSauceToMeal: jest.fn(),
      removeSauceFromMeal: jest.fn(),
      updateSauceServings: jest.fn(),
    };

    render(
      <PlannerUIProvider>
        <MealDetailSheet
          slot={mockSlot}
          onClose={jest.fn()}
          onRemove={jest.fn()}
        />
      </PlannerUIProvider>,
    );

    expect(screen.getByText(/Ingredients & Pantry Status/i)).toBeInTheDocument();
    expect(screen.getAllByText("✓ In Pantry").length).toBe(2);

    const addButtons = screen.getAllByRole("button", { name: /\+ Add to Pantry/i });
    expect(addButtons.length).toBeGreaterThan(0);

    const firstAddButton = addButtons[0];
    if (firstAddButton) {
      fireEvent.click(firstAddButton);
    }
    expect(mockSetInventory).toHaveBeenCalledWith(["olive oil", "garlic", "tomatoes"]);
  });

  it("PossoWidget renders 'Active in Week Plan' chips for ingredients used on WeekBoard", async () => {
    mockPlannerContext = {
      inventory: ["olive oil", "garlic", "oregano"],
      setInventory: jest.fn(),
      addMealToSlot: jest.fn(),
      currentMenu: {
        id: "menu-1",
        meals: [mockSlot],
      },
    };

    await act(async () => {
      render(<PossoWidget />);
    });

    expect(screen.getByText(/Active in Week Plan/i)).toBeInTheDocument();
    expect(screen.getAllByText("olive oil").length).toBe(2);
    expect(screen.getAllByText("garlic").length).toBe(2);
  });

  it("GroceryListModal renders WeekBoard auto-sync banner and interactive filter tabs", () => {
    mockPlannerContext = {
      groceryList: [
        {
          id: "g-1",
          ingredient: "Olive Oil",
          quantity: 2,
          unit: "tbsp",
          category: "condiments",
          inPantry: true,
          purchased: false,
          usedInRecipes: ["recipe-sun-fire"],
        },
        {
          id: "g-2",
          ingredient: "Tomatoes",
          quantity: 4,
          unit: "whole",
          category: "produce",
          inPantry: false,
          purchased: false,
          usedInRecipes: ["recipe-sun-fire"],
        },
      ],
      updateGroceryItem: jest.fn(),
      regenerateGroceryList: jest.fn(),
      currentMenu: { id: "menu-1", meals: [mockSlot] },
      inventory: ["olive oil"],
      setInventory: jest.fn(),
    };

    render(<GroceryListModal isOpen onClose={jest.fn()} />);

    expect(screen.getByText(/Auto-synced from WeekBoard/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sync WeekBoard/i })).toBeInTheDocument();

    // Click "In Pantry" filter button
    const inPantryTab = screen.getByRole("button", { name: /In Pantry/i });
    fireEvent.click(inPantryTab);

    expect(screen.getByText("Olive Oil")).toBeInTheDocument();
  });
});

describe("Elemental Meal Harmony Visualizer in WeekBoard", () => {
  it("renders daily micro-bar and Astrological Resonance on WeekBoard Sunday header", () => {
    mockPlannerContext = {
      currentMenu: {
        id: "menu-1",
        meals: [mockSlot],
      },
      addMealToSlot: jest.fn(),
      generateMealsForDay: jest.fn(),
      moveMeal: jest.fn(),
      swapMeals: jest.fn(),
    };

    render(
      <PlannerUIProvider>
        <WeekBoard onCopyMeal={jest.fn()} />
      </PlannerUIProvider>,
    );

    // Sunday is ruled by the Sun (Fire), and Spicy Solar Shakshuka is Fire-dominant (0.8 Fire)
    expect(screen.getByText("✦ Resonant")).toBeInTheDocument();
    expect(screen.getByText("Fire")).toBeInTheDocument();
  });

  it("clicking the Elemental meter in WeekSummaryStrip opens ElementalHarmonyModal", () => {
    mockPlannerContext = {
      currentMenu: { id: "menu-1", meals: [mockSlot] },
      weeklyStats: {
        totalMeals: 1,
        totalRecipes: 1,
        elementalDistribution: { Fire: 0.8, Air: 0.2, Water: 0, Earth: 0 },
      },
      weeklyBudget: 100,
      estimatedWeeklyCost: 45,
    };

    function TestHost(): React.JSX.Element {
      const { state, closeModal } = usePlannerUI();
      return (
        <div>
          <WeekSummaryStrip />
          <ElementalHarmonyModal
            isOpen={state.modal === "harmony"}
            onClose={() => closeModal()}
          />
        </div>
      );
    }

    render(
      <PlannerUIProvider>
        <TestHost />
      </PlannerUIProvider>,
    );

    const elementalTrigger = screen.getByTitle(/Inspect Weekly & Daily Elemental Harmony/i);
    fireEvent.click(elementalTrigger);

    expect(screen.getByText("Elemental Harmony & Astrological Resonance")).toBeInTheDocument();
    expect(screen.getByText(/Weekly Elemental Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Alchemical Culinary Guidance/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily Planetary Resonance/i)).toBeInTheDocument();
  });
});
