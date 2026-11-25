/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import SmartSuggestionsSidebar, {
  countRecipeFrequency,
  countUniqueCuisines,
  extractAllIngredients,
} from "../SmartSuggestionsSidebar";
import type { MealSlot, WeeklyMenu } from "@/types/menuPlanner";
import type { EnhancedRecipe } from "@/types/recipe";

const at = new Date("2026-11-25T12:00:00Z");

function makeRecipe(overrides: Partial<EnhancedRecipe> = {}): EnhancedRecipe {
  return {
    id: "recipe-1",
    name: "Garlic Broth",
    ingredients: [{ name: "Garlic", amount: 2, unit: "cloves" }],
    instructions: ["Simmer."],
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    cuisine: "Italian",
    ...overrides,
  };
}

function makeMealSlot(
  id: string,
  recipe?: EnhancedRecipe,
): MealSlot {
  return {
    id,
    dayOfWeek: 0,
    mealType: "lunch",
    servings: 1,
    ...(recipe ? { recipe } : {}),
    planetarySnapshot: {
      dominantPlanet: "Sun",
      zodiacSign: "leo",
      lunarPhase: "full moon",
      elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      timestamp: at,
    },
    createdAt: at,
    updatedAt: at,
  };
}

function makeMenu(meals: MealSlot[]): WeeklyMenu {
  return {
    id: "week-1",
    weekStartDate: at,
    weekEndDate: at,
    meals,
    groceryList: [],
    savedAsTemplate: false,
    createdAt: at,
    updatedAt: at,
  };
}

describe("SmartSuggestionsSidebar helpers and malformed localStorage safety", () => {
  it("returns empty defaults for null weekPlan", () => {
    expect(extractAllIngredients(null)).toEqual([]);
    expect(countRecipeFrequency(null)).toEqual({});
    expect(countUniqueCuisines(null)).toBe(0);
  });

  it("extracts lowercased ingredient names and tolerates malformed legacy entries", () => {
    const missingIngredientsRecipe = makeRecipe({ id: "r-missing" });
    Reflect.deleteProperty(missingIngredientsRecipe, "ingredients");

    const nullIngredientsRecipe = makeRecipe({ id: "r-null" });
    Reflect.set(nullIngredientsRecipe, "ingredients", null);

    const mixedEntriesRecipe = makeRecipe({ id: "r-mixed" });
    Reflect.set(mixedEntriesRecipe, "ingredients", [
      "Fresh Thyme",
      { name: "Sea Salt" },
      {},
      { name: 42 },
      null,
    ]);

    const menu = makeMenu([
      makeMealSlot("empty-slot"),
      makeMealSlot("missing-ing", missingIngredientsRecipe),
      makeMealSlot("null-ing", nullIngredientsRecipe),
      makeMealSlot("mixed-ing", mixedEntriesRecipe),
    ]);

    expect(extractAllIngredients(menu)).toEqual([
      "fresh thyme",
      "sea salt",
      "",
      "",
      "",
    ]);
  });

  it("counts recipe frequencies and unique cuisines safely", () => {
    const r1 = makeRecipe({ id: "pasta", cuisine: "Italian" });
    const r2 = makeRecipe({ id: "taco", cuisine: "mexican" });
    const r3 = makeRecipe({ id: "plain", cuisine: "" });
    const menu = makeMenu([
      makeMealSlot("m1", r1),
      makeMealSlot("m2", r1),
      makeMealSlot("m3", r2),
      makeMealSlot("m4", r3),
      makeMealSlot("m5"),
    ]);

    expect(countRecipeFrequency(menu)).toEqual({
      pasta: 2,
      taco: 1,
      plain: 1,
    });
    expect(countUniqueCuisines(menu)).toBe(2);
  });

  it("renders without throwing when >=5 meals contain malformed localStorage ingredients", () => {
    const legacySlots: MealSlot[] = Array.from({ length: 5 }, (_, idx) => {
      const rec = makeRecipe({ id: `legacy-${idx}`, cuisine: "Fusion" });
      Reflect.set(rec, "ingredients", idx === 0 ? undefined : ["Basil", {}]);
      return makeMealSlot(`slot-${idx}`, rec);
    });
    const menu = makeMenu(legacySlots);

    render(<SmartSuggestionsSidebar weekPlan={menu} weeklyNutrition={null} />);
    expect(screen.getByText(/Smart Suggestions/)).toBeInTheDocument();
  });
});
