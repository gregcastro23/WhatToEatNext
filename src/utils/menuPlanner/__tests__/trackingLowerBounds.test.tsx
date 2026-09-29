/**
 * The nutrition tracking result says which of sodium, sugar, saturated fat,
 * potassium and cholesterol the planned meals state: a recipe that does not
 * state one reads 0 in its `NutritionalSummary`, so the total is a lower bound
 * (owner ruling 2026-09-29). The unused-but-exported dashboard and highlights
 * show it as one.
 *
 * Real catalog rows: Butter Poppyseed Sauce states sodium and sugar; Authentic
 * Kofta Kebab (10 ingredients) states neither; Falafel publishes no nutrition.
 * The potassium rows are found in the catalog: one recipe that states it, and
 * Kofta, which does not.
 *
 * Imports only modules that exist on the base branch, so the red proof is behavioural.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { getServerRecipes } from "@/actions/recipes";
import { InlineNutritionDashboard } from "@/components/nutrition/InlineNutritionDashboard";
import { MicronutrientHighlights } from "@/components/nutrition/MicronutrientHighlights";
import { NutritionTrackingService } from "@/services/NutritionTrackingService";
import type { DayOfWeek, MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

const SAUCE = "hsca-lunch-all-butter-poppyseed-sauce";
const KOFTA = "middleeastern-lunch-all-authentic-kofta-kebab";
const FALAFEL = "middleeastern-dinner-all-falafel";
const WEDNESDAY: DayOfWeek = 3;
const WEEK_START = new Date("2026-09-27T00:00:00Z");

let catalog: Recipe[] = [];
beforeAll(async () => {
  catalog = await getServerRecipes();
});

function recipe(id: string): Recipe {
  const found = catalog.find((r) => r.id === id);
  if (!found) throw new Error(`${id} is not in the catalog`);
  return found;
}

function slot(found: Recipe, mealType: MealType): MealSlot {
  const at = new Date("2026-09-30T12:00:00Z");
  return {
    id: `${WEDNESDAY}-${mealType}`,
    dayOfWeek: WEDNESDAY,
    mealType,
    recipe: found,
    servings: 1,
    planetarySnapshot: {
      dominantPlanet: "Mercury",
      zodiacSign: "libra",
      lunarPhase: "waxing crescent",
      elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      timestamp: at,
    },
    createdAt: at,
    updatedAt: at,
  };
}

function week(meals: MealSlot[]) {
  const service = new NutritionTrackingService();
  return service.calculateWeeklyNutrition({ 0: [], 1: [], 2: [], 3: meals, 4: [], 5: [], 6: [] }, WEEK_START);
}

const sauceSodium = (): number => recipe(SAUCE).nutrition?.sodium ?? NaN;

describe("the tracking result's nutrient coverage", () => {
  it("counts the planned meals that state each nutrient, apart from the calories coverage", () => {
    const result = week([slot(recipe(SAUCE), "lunch"), slot(recipe(KOFTA), "dinner"), slot(recipe(FALAFEL), "snack")]);
    expect(result.coverage).toEqual({ planned: 3, withNutrition: 2 });
    expect(result.nutrientCoverage.sodium).toEqual({ planned: 3, withNutrition: 1 });
    expect(result.nutrientCoverage.sugar).toEqual({ planned: 3, withNutrition: 1 });
    expect(result.weeklyTotals.sodium).toBeCloseTo(sauceSodium(), 10); // a lower bound, not a whole
  });

  it("records per meal which nutrients its recipe states", () => {
    const day = week([slot(recipe(SAUCE), "lunch"), slot(recipe(KOFTA), "dinner"), slot(recipe(FALAFEL), "snack")]).days[WEDNESDAY];
    expect(day?.meals.map((m) => m.stated.sodium)).toEqual([true, false, false]);
    expect(day?.meals.map((m) => m.stated.sugar)).toEqual([true, false, false]);
    expect(day?.nutrientCoverage.sodium).toEqual({ planned: 3, withNutrition: 1 });
  });
});

describe("the inline dashboard's sodium pill", () => {
  function pill() {
    return screen.getByText("Sodium").closest("div")?.textContent ?? "";
  }

  it("is a lower bound when one of two meals states sodium", () => {
    render(<InlineNutritionDashboard weeklyResult={week([slot(recipe(SAUCE), "lunch"), slot(recipe(KOFTA), "dinner")])} />);
    expect(pill()).toMatch(new RegExp(`^Sodium≥${Math.round(sauceSodium())}`));
    expect(pill()).toMatch(/≥\d+%$/);
  });

  it("is whole when every meal states it", () => {
    render(<InlineNutritionDashboard weeklyResult={week([slot(recipe(SAUCE), "lunch")])} />);
    expect(pill()).toMatch(new RegExp(`^Sodium${Math.round(sauceSodium())}`));
    expect(pill()).not.toContain("≥");
  });

  it("has no figure when no meal states it", () => {
    render(<InlineNutritionDashboard weeklyResult={week([slot(recipe(KOFTA), "dinner")])} />);
    expect(pill()).toMatch(/^Sodium—/);
    expect(pill()).toMatch(/—$/);
  });
});

describe("the key-micronutrients list", () => {
  /** A catalog recipe that states potassium (a complete total), and Kofta, which does not. */
  function statesPotassium(): Recipe {
    const found = catalog.find((r) => typeof r.nutrition?.potassium === "number" && (r.nutrition?.calories ?? 0) > 0);
    if (!found) throw new Error("no catalog recipe states potassium");
    return found;
  }

  function show(meals: MealSlot[]) {
    const result = week(meals);
    render(
      <MicronutrientHighlights
        totals={result.weeklyTotals}
        goals={result.weeklyGoals}
        coverage={result.nutrientCoverage}
      />,
    );
  }

  it("omits potassium when no planned meal states it", () => {
    show([slot(recipe(KOFTA), "dinner")]);
    expect(screen.queryByText("Potassium")).toBeNull();
  });

  it("marks potassium a lower bound when only some do, and whole when all do", () => {
    show([slot(statesPotassium(), "lunch"), slot(recipe(KOFTA), "dinner")]);
    const row = screen.getByText("Potassium").closest("li")?.textContent ?? "";
    expect(row).toContain("≥");
  });

  it("leaves a whole potassium total unmarked", () => {
    show([slot(statesPotassium(), "lunch")]);
    const row = screen.getByText("Potassium").closest("li")?.textContent ?? "";
    expect(row).not.toContain("≥");
  });
});
