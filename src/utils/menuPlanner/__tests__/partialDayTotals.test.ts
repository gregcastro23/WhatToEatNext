/**
 * A planned day that includes a recipe with no nutrition publishes its total
 * as a lower bound, marked partial (owner ruling 2026-09-26, option a); a day
 * where no meal has nutrition has no total. Real catalog rows: Falafel
 * publishes no nutrition on master and under the nutrition gate.
 *
 * Imports only modules that exist on master, so the red proof is behavioural.
 */
import { getServerRecipes } from "@/actions/recipes";
import { NutritionTrackingService } from "@/services/NutritionTrackingService";
import type { DayOfWeek, MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import {
  calculateWeeklyTotals,
  generateDailyCaloriesChartData,
} from "@/utils/menuPlanner/nutritionalCalculator";

const MANAKISH = "middleeastern-breakfast-all-manakish-zaatar";
const KOFTA = "middleeastern-lunch-all-authentic-kofta-kebab";
const FALAFEL = "middleeastern-dinner-all-falafel";
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

function caloriesOf(id: string): number {
  const calories = recipe(id).nutrition?.calories;
  if (typeof calories !== "number") throw new Error(`${id} publishes no calories`);
  return calories;
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

/** Manakish 901 kcal + Kofta 410 kcal + Falafel (no nutrition). */
function partialDay(): MealSlot[] {
  return [
    slot(MANAKISH, WEDNESDAY, "breakfast"),
    slot(KOFTA, WEDNESDAY, "lunch"),
    slot(FALAFEL, WEDNESDAY, "dinner"),
  ];
}

function week(days: Partial<Record<DayOfWeek, MealSlot[]>>): Record<DayOfWeek, MealSlot[]> {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], ...days };
}

describe("the catalog rows this test stands on", () => {
  it("Falafel publishes no nutrition; Manakish and Kofta do", () => {
    expect(recipe(FALAFEL).nutrition).toBeUndefined();
    expect(caloriesOf(MANAKISH)).toBeGreaterThan(0);
    expect(caloriesOf(KOFTA)).toBeGreaterThan(0);
  });
});

describe("the planner's day total (day strip, day cards)", () => {
  it("sums the meals with nutrition and says 2 of 3 entered it", () => {
    const day = new NutritionTrackingService().calculateDailyNutrition(partialDay(), new Date());
    expect(day.totals.calories).toBeCloseTo(caloriesOf(MANAKISH) + caloriesOf(KOFTA), 6);
    expect(day.meals.map((m) => m.hasNutrition)).toEqual([true, true, false]);
    expect(day.coverage).toEqual({ planned: 3, withNutrition: 2 });
  });

  it("a day whose only meal has no nutrition covers nothing", () => {
    const day = new NutritionTrackingService().calculateDailyNutrition(
      [slot(FALAFEL, WEDNESDAY, "dinner")],
      new Date(),
    );
    expect(day.coverage).toEqual({ planned: 1, withNutrition: 0 });
  });

  it("a week with one partial day is partial", () => {
    const result = new NutritionTrackingService().calculateWeeklyNutrition(
      week({ 3: partialDay(), 4: [slot(MANAKISH, THURSDAY, "breakfast"), slot(KOFTA, THURSDAY, "lunch")] }),
      new Date("2026-09-27T00:00:00Z"),
    );
    expect(result.days[THURSDAY]?.coverage).toEqual({ planned: 2, withNutrition: 2 });
    expect(result.coverage).toEqual({ planned: 5, withNutrition: 4 });
  });
});

describe("the nutrition dashboard's totals", () => {
  it("read the catalog's nutrition field (they read 0 kcal for every static recipe)", () => {
    const totals = calculateWeeklyTotals(week({ 3: partialDay() }));
    expect(totals.dailyBreakdown[WEDNESDAY].calories).toBeCloseTo(
      caloriesOf(MANAKISH) + caloriesOf(KOFTA),
      6,
    );
    expect(totals.dailyCoverage[WEDNESDAY]).toEqual({ planned: 3, withNutrition: 2 });
    expect(totals.coverage).toEqual({ planned: 3, withNutrition: 2 });
  });

  it("chart a partial day as a lower bound, and a day with no nutrition as no total", () => {
    const sum = Math.round(caloriesOf(MANAKISH) + caloriesOf(KOFTA));
    const totals = calculateWeeklyTotals(
      week({ 3: partialDay(), 4: [slot(FALAFEL, THURSDAY, "dinner")] }),
    );
    const { data } = generateDailyCaloriesChartData(totals.dailyBreakdown, totals.dailyCoverage);
    expect(data[WEDNESDAY]).toMatchObject({
      label: "Wed (partial: 2 of 3 meals have nutrition)",
      display: `≥${sum} kcal`,
    });
    expect(data[THURSDAY]).toMatchObject({
      label: "Thu (no nutrition published for this meal)",
      display: "—",
    });
  });

  it("leave a whole day unmarked", () => {
    const sum = Math.round(caloriesOf(MANAKISH) + caloriesOf(KOFTA));
    const totals = calculateWeeklyTotals(
      week({ 4: [slot(MANAKISH, THURSDAY, "breakfast"), slot(KOFTA, THURSDAY, "lunch")] }),
    );
    const { data } = generateDailyCaloriesChartData(totals.dailyBreakdown, totals.dailyCoverage);
    expect(totals.coverage).toEqual({ planned: 2, withNutrition: 2 });
    expect(data[THURSDAY]).toMatchObject({ label: "Thu", display: `${sum} kcal` });
  });
});
