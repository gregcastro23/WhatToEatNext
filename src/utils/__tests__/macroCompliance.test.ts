/**
 * Compliance is scored over the five macros the catalog publishes for every
 * recipe, and it names that basis (owner ruling 2026-09-27, option b).
 *
 * Real catalog rows: Manakish Za'atar + Authentic Kofta Kebab, a 1,311 kcal
 * day. It read 24.6% while 21 absent or mis-unit nutrients were scored as
 * deficits.
 *
 * Imports only modules that exist on master, so the red proof is behavioural.
 */
import { getServerRecipes } from "@/actions/recipes";
import { NutritionTrackingService } from "@/services/NutritionTrackingService";
import type { DayOfWeek, MealSlot, MealType } from "@/types/menuPlanner";
import type { NutritionalSummary } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";
import {
  calculateOverallCompliance,
  nutrientComplianceScore,
} from "@/utils/nutritionAggregation";

const MACROS: Array<keyof NutritionalSummary> = ["calories", "protein", "carbs", "fat", "fiber"];
const WEDNESDAY: DayOfWeek = 3;
let catalog: Recipe[] = [];

beforeAll(async () => {
  catalog = await getServerRecipes();
});

function slot(id: string, mealType: MealType): MealSlot {
  const recipe = catalog.find((r) => r.id === id);
  if (!recipe) throw new Error(`${id} is not in the catalog`);
  const at = new Date("2026-09-30T12:00:00Z");
  return {
    id: `wed-${mealType}`,
    dayOfWeek: WEDNESDAY,
    mealType,
    recipe,
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

function exampleDay(): MealSlot[] {
  return [
    slot("middleeastern-breakfast-all-manakish-zaatar", "breakfast"),
    slot("middleeastern-lunch-all-authentic-kofta-kebab", "lunch"),
  ];
}

/** The mean of the per-macro scores: what compliance must equal. */
function macroMean(actual: NutritionalSummary, target: NutritionalSummary): number {
  const scores = MACROS.map((k) => nutrientComplianceScore(actual[k] ?? 0, target[k] ?? 0));
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

describe("a day's compliance", () => {
  it("is the mean over calories, protein, carbs, fat and fiber", () => {
    const day = new NutritionTrackingService().calculateDailyNutrition(exampleDay(), new Date());
    expect(day.totals.calories).toBeGreaterThan(1000);
    expect(day.compliance.overall).toBeCloseTo(macroMean(day.totals, day.goals), 12);
  });

  it("names its basis, and scores nothing outside it", () => {
    const day = new NutritionTrackingService().calculateDailyNutrition(exampleDay(), new Date());
    expect(day.compliance.basis).toEqual(MACROS);
    expect(Object.keys(day.compliance.byNutrient).sort()).toEqual([...MACROS].sort());
  });
});

describe("what can move it", () => {
  it("a micronutrient or an upper limit cannot (vitamin C at target, sugar and sodium at 0)", () => {
    const { totals, goals } = new NutritionTrackingService().calculateDailyNutrition(exampleDay(), new Date());
    const base = calculateOverallCompliance(totals, goals);
    expect(calculateOverallCompliance({ ...totals, vitaminC: goals.vitaminC }, goals)).toBe(base);
    expect(calculateOverallCompliance({ ...totals, sugar: 0, sodium: 0 }, goals)).toBe(base);
  });

  it("a macro can (control: the check above is able to see movement)", () => {
    const { totals, goals } = new NutritionTrackingService().calculateDailyNutrition(exampleDay(), new Date());
    expect(calculateOverallCompliance({ ...totals, protein: 0 }, goals)).toBeLessThan(
      calculateOverallCompliance(totals, goals),
    );
  });
});

describe("a week's compliance", () => {
  it("uses the same five macros and says so", () => {
    const week = new NutritionTrackingService().calculateWeeklyNutrition(
      { 0: [], 1: [], 2: [], 3: exampleDay(), 4: [], 5: [], 6: [] },
      new Date("2026-09-27T00:00:00Z"),
    );
    expect(week.weeklyCompliance.basis).toEqual(MACROS);
    expect(week.weeklyCompliance.overall).toBeCloseTo(macroMean(week.weeklyTotals, week.weeklyGoals), 12);
  });
});
