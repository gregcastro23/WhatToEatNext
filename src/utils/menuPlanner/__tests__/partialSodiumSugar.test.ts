/**
 * A planned day or week that includes a recipe which does not state sodium or
 * sugar shows that total as a lower bound, marked partial, per nutrient (owner
 * ruling 2026-09-29): its calories can be complete while its sodium is not.
 *
 * Real catalog rows: Butter Poppyseed Sauce states sodium and sugar (butter,
 * poppy seeds); Authentic Kofta Kebab, a computed recipe with 10 ingredients,
 * states neither.
 *
 * Imports only modules that exist on master, so the red proof is behavioural.
 */
import { getServerRecipes } from "@/actions/recipes";
import type { DayOfWeek, MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import {
  calculateDayTotals,
  calculateWeeklyTotals,
} from "@/utils/menuPlanner/nutritionalCalculator";
import { formatCoveredTotal } from "@/utils/menuPlanner/nutritionCoverage";

const SAUCE = "hsca-lunch-all-butter-poppyseed-sauce";
const KOFTA = "middleeastern-lunch-all-authentic-kofta-kebab";
const WEDNESDAY: DayOfWeek = 3;
const THURSDAY: DayOfWeek = 4;

let catalog: Recipe[] = [];
beforeAll(async () => {
  catalog = await getServerRecipes();
});

function recipe(id: string): Recipe {
  const found = catalog.find((r) => r.id === id);
  if (!found) throw new Error(`${id} is not in the catalog`);
  return found;
}

function slot(id: string, dayOfWeek: DayOfWeek, mealType: MealType): MealSlot {
  const at = new Date("2026-09-30T12:00:00Z");
  return {
    id: `${dayOfWeek}-${mealType}`,
    dayOfWeek,
    mealType,
    recipe: recipe(id),
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

const sauceSodium = (): number => recipe(SAUCE).nutrition?.sodium ?? NaN;

describe("a day's sodium and sugar", () => {
  it("is a lower bound when one of two meals does not state it, though its calories are whole", () => {
    const day = calculateDayTotals([slot(SAUCE, WEDNESDAY, "lunch"), slot(KOFTA, WEDNESDAY, "dinner")]);
    expect(day.coverage).toEqual({ planned: 2, withNutrition: 2 });
    expect(day.nutrientCoverage.sodium).toEqual({ planned: 2, withNutrition: 1 });
    expect(day.nutrientCoverage.sugar).toEqual({ planned: 2, withNutrition: 1 });
    expect(day.totals.sodium).toBeCloseTo(sauceSodium(), 10);
    expect(formatCoveredTotal(day.totals.sodium, day.nutrientCoverage.sodium, "mg")).toBe(`≥${Math.round(sauceSodium())}mg`);
  });

  it("is whole when every meal states it", () => {
    const day = calculateDayTotals([slot(SAUCE, WEDNESDAY, "lunch")]);
    expect(day.nutrientCoverage.sodium).toEqual({ planned: 1, withNutrition: 1 });
    expect(formatCoveredTotal(day.totals.sodium, day.nutrientCoverage.sodium, "mg")).toBe(`${Math.round(sauceSodium())}mg`);
  });

  it("has no total when no meal states it", () => {
    const day = calculateDayTotals([slot(KOFTA, WEDNESDAY, "dinner")]);
    expect(day.nutrientCoverage.sodium).toEqual({ planned: 1, withNutrition: 0 });
    expect(formatCoveredTotal(day.totals.sodium, day.nutrientCoverage.sodium, "mg")).toBe("—");
  });
});

describe("a week's sodium and sugar", () => {
  it("counts the meals that state them across its days", () => {
    const week = calculateWeeklyTotals({
      0: [], 1: [], 2: [], 5: [], 6: [],
      [WEDNESDAY]: [slot(SAUCE, WEDNESDAY, "lunch"), slot(KOFTA, WEDNESDAY, "dinner")],
      [THURSDAY]: [slot(KOFTA, THURSDAY, "dinner")],
    });
    expect(week.nutrientCoverage.sodium).toEqual({ planned: 3, withNutrition: 1 });
    expect(week.nutrientCoverage.sugar).toEqual({ planned: 3, withNutrition: 1 });
    expect(week.totalSodium).toBeCloseTo(sauceSodium(), 10);
    expect(formatCoveredTotal(week.totalSodium, week.nutrientCoverage.sodium, "mg")).toMatch(/^≥\d+mg$/);
  });
});
