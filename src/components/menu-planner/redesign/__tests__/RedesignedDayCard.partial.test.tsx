/**
 * The day card's kcal read-out is a lower bound when a planned recipe publishes
 * no nutrition, and says so (owner ruling 2026-09-26, option a). Real catalog
 * rows through the real day-total service; only the meal rows are stubbed,
 * because they need the planner context.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { getServerRecipes } from "@/actions/recipes";
import RedesignedDayCard from "@/components/menu-planner/redesign/RedesignedDayCard";
import { NutritionTrackingService } from "@/services/NutritionTrackingService";
import type { DayOfWeek, MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

jest.mock("@/components/menu-planner/redesign/MealRowCard", () => ({
  __esModule: true,
  default: (): null => null,
}));

const WEDNESDAY: DayOfWeek = 3;
let catalog: Recipe[] = [];

beforeAll(async () => {
  catalog = await getServerRecipes();
});

function slot(id: string, mealType: MealType): MealSlot {
  const found = catalog.find((r) => r.id === id);
  if (!found) throw new Error(`${id} is not in the catalog`);
  const at = new Date("2026-09-30T12:00:00Z");
  return {
    id: `wed-${mealType}`,
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

function renderDay(meals: MealSlot[]): void {
  const dailyNutrition = new NutritionTrackingService().calculateDailyNutrition(meals, new Date());
  render(
    <RedesignedDayCard
      dayOfWeek={WEDNESDAY}
      date={new Date("2026-09-30T12:00:00Z")}
      meals={meals}
      dailyNutrition={dailyNutrition}
    />,
  );
}

function kcalOf(id: string): number {
  const calories = catalog.find((r) => r.id === id)?.nutrition?.calories;
  if (typeof calories !== "number") throw new Error(`${id} publishes no calories`);
  return calories;
}

it("Manakish + Kofta + Falafel (no nutrition) reads as a lower bound, marked partial", () => {
  renderDay([
    slot("middleeastern-breakfast-all-manakish-zaatar", "breakfast"),
    slot("middleeastern-lunch-all-authentic-kofta-kebab", "lunch"),
    slot("middleeastern-dinner-all-falafel", "dinner"),
  ]);
  const sum = Math.round(
    kcalOf("middleeastern-breakfast-all-manakish-zaatar") +
      kcalOf("middleeastern-lunch-all-authentic-kofta-kebab"),
  );
  expect(screen.getByText(`≥${sum} KCAL`)).toBeTruthy();
  expect(screen.getByText("partial: 2 of 3 meals have nutrition")).toBeTruthy();
});

it("a day whose only meal publishes no nutrition shows no total", () => {
  renderDay([slot("middleeastern-dinner-all-falafel", "dinner")]);
  expect(screen.getByText("— KCAL")).toBeTruthy();
  expect(screen.getByText("no nutrition published for this meal")).toBeTruthy();
  expect(screen.queryByText("0 KCAL")).toBeNull();
});

it("a day whose meals all publish nutrition is unmarked", () => {
  renderDay([
    slot("middleeastern-breakfast-all-manakish-zaatar", "breakfast"),
    slot("middleeastern-lunch-all-authentic-kofta-kebab", "lunch"),
  ]);
  const sum = Math.round(
    kcalOf("middleeastern-breakfast-all-manakish-zaatar") +
      kcalOf("middleeastern-lunch-all-authentic-kofta-kebab"),
  );
  expect(screen.getByText(`${sum} KCAL`)).toBeTruthy();
  expect(screen.queryByTestId("nutrition-coverage-note")).toBeNull();
});
