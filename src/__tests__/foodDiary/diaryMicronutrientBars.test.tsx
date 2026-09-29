/**
 * The food-tracking dashboard's potassium and saturated-fat bars say how many
 * of the day's entries they cover; an entry that is silent about a nutrient is
 * not 0 mg of it. The Vitamin C bar is gone: no food source supplies vitamin C
 * in mg. A recipe logged with "I ate this" never feeds an mg micronutrient:
 * its vitamins and minerals are Daily Value fractions (owner rulings 2026-09-28).
 *
 * Real catalog rows: the "banana" quick-food preset (358 mg potassium per
 * 100 g, a 118 g serving), and SCRAMBLED EGGS, one of the 2 recipes that
 * publish potassium (47.1 mg, in mg since #910) and one that publishes
 * saturated fat (7.2 g). A recipe entry drops even real-mg potassium: the
 * ruling is by source, since menus saved before #910 still carry DV fractions
 * in those fields. A guest's diary, which lives in server memory.
 *
 * Imports only modules that exist on master, so the red proof is behavioural.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { getServerRecipes } from "@/actions/recipes";
import NutritionDashboard from "@/components/food-diary/NutritionDashboard";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { DailyFoodDiarySummary, FoodDiaryEntry } from "@/types/foodDiary";
import { buildDiaryEntryFromPlan } from "@/utils/foodDiary/logMealFromPlan";

jest.mock("@/services/questEventReporter", () => ({ reportQuestEventBestEffort: jest.fn() }));
jest.mock("@/services/TokenEconomyService", () => ({ tokenEconomy: { creditMultipleTokens: jest.fn() } }));

const DAY = new Date("2026-09-28T12:00:00Z");
/** What a recipe entry may keep: amounts, never Daily Value fractions. */
const AMOUNTS = ["calories", "protein", "carbs", "fat", "fiber", "sugar", "addedSugar", "sodium", "saturatedFat", "transFat", "cholesterol"];

let recipeEntry: FoodDiaryEntry;
let recipeSatFat = 0;
let summary: DailyFoodDiarySummary;

beforeAll(async () => {
  const eggs = (await getServerRecipes()).find((r) => r.id === "hsca-breakfast-all-scrambled-eggs");
  if (!eggs) throw new Error("SCRAMBLED EGGS is not in the catalog");
  // The premise: the recipe publishes both values this test is about.
  if (!(Number(eggs.nutrition?.potassium) > 0) || !(Number(eggs.nutrition?.saturatedFat) > 0.5)) {
    throw new Error("SCRAMBLED EGGS no longer publishes potassium and saturated fat; pick another row");
  }
  recipeSatFat = Number(eggs.nutrition?.saturatedFat);
  await foodDiaryService.createEntry("guest", {
    foodName: "Banana", foodSource: "quick", sourceId: "banana", date: DAY, mealType: "breakfast",
    time: "08:00", serving: { amount: 1, unit: "piece", grams: 118, description: "1 medium" }, quantity: 1,
  });
  recipeEntry = await foodDiaryService.createEntry(
    "guest",
    buildDiaryEntryFromPlan({ recipe: eggs, mealType: "lunch", servings: 1, date: DAY, time: "12:30" }),
  );
  summary = await foodDiaryService.getDailySummary("guest", DAY);
});

/** The bar row that starts with `label`, as one string. */
function row(label: string): string {
  return screen.getByText(label).closest("div")?.textContent ?? "";
}

describe("a day's entries", () => {
  it("a logged recipe keeps only the nutrients it publishes as amounts", () => {
    const stray = Object.keys(recipeEntry.nutrition).filter((k) => !AMOUNTS.includes(k));
    expect(stray).toEqual([]);
  });

  it("the day's potassium is the banana's alone, and covers 1 of its 2 entries", () => {
    expect(summary.entries).toHaveLength(2);
    expect(summary.totalNutrition.potassium).toBeCloseTo(422.4, 6);
    expect(summary.nutrientCoverage?.potassium).toEqual({ entries: 2, withValue: 1 });
  });
});

describe("the dashboard's bars", () => {
  beforeEach(() => {
    render(<NutritionDashboard dailySummary={summary} weeklySummary={null} stats={null} insights={[]} />);
  });

  it("mark a total over some of the entries as a lower bound, and say how many", () => {
    expect(row("Potassium")).toBe("Potassium≥422mg / 4700mg");
    expect(row("Sat. Fat")).toBe(`Sat. Fat≥${Math.round(recipeSatFat)}g / 20g`);
    expect(screen.getAllByText("1 of 2 entries list it")).toHaveLength(2);
  });

  it("show no Vitamin C bar", () => {
    expect(screen.queryByText("Vitamin C")).toBeNull();
  });
});

describe("a day of one banana", () => {
  it("shows — for saturated fat, which it doesn't list, and potassium whole", async () => {
    const day = new Date("2026-09-29T12:00:00Z");
    await foodDiaryService.createEntry("guest", {
      foodName: "Banana", foodSource: "quick", sourceId: "banana", date: day, mealType: "breakfast",
      time: "08:00", serving: { amount: 1, unit: "piece", grams: 118, description: "1 medium" }, quantity: 1,
    });
    const oneBanana = await foodDiaryService.getDailySummary("guest", day);
    render(<NutritionDashboard dailySummary={oneBanana} weeklySummary={null} stats={null} insights={[]} />);
    expect(row("Sat. Fat")).toBe("Sat. Fat— / 20g");
    expect(screen.getByText("this entry doesn't list it")).toBeTruthy();
    // Control: a total every entry carries is shown whole, with no mark.
    expect(row("Potassium")).toBe("Potassium422mg / 4700mg");
  });
});
