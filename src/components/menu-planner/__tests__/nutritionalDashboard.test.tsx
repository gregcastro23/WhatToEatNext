/**
 * The planner's Nutrition Dashboard (owner rulings 2026-09-29):
 * - it opens as a dialog on <body>, so a filtered ancestor cannot confine it;
 * - only the sections with a basis stay (no holistic score, no Greg's Energy
 *   trend, no alchemical metrics);
 * - every total is a lower bound, marked, when a planned meal publishes no
 *   nutrition, and no advice is drawn from totals that do not exist.
 *
 * Real catalog rows through the real weekly calculator: Manakish and Kofta
 * publish nutrition, Lentil Soup publishes none. Only the planner context is
 * replaced. Imports only modules that exist on master.
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { getServerRecipes } from "@/actions/recipes";
import NutritionalDashboard from "@/components/menu-planner/NutritionalDashboard";
import type { MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

let mockMeals: MealSlot[] = [];
jest.mock("@/contexts/MenuPlannerContext", () => ({
  useMenuPlanner: () => ({ currentMenu: { meals: mockMeals } }),
}));

const MANAKISH = "middleeastern-breakfast-all-manakish-zaatar";
const KOFTA = "middleeastern-lunch-all-authentic-kofta-kebab";
const LENTIL_SOUP = "middleeastern-dinner-all-lentil-soup-shorbat-adas";
let catalog: Recipe[] = [];

beforeAll(async () => {
  catalog = await getServerRecipes();
});

function recipe(id: string): Recipe {
  const found = catalog.find((r) => r.id === id);
  if (!found) throw new Error(`${id} is not in the catalog`);
  return found;
}

function monday(id: string, mealType: MealType): MealSlot {
  const at = new Date("2026-09-28T12:00:00Z");
  return {
    id: `mon-${mealType}`,
    dayOfWeek: 1,
    mealType,
    recipe: recipe(id),
    servings: 1,
    planetarySnapshot: {
      dominantPlanet: "Moon",
      zodiacSign: "libra",
      lunarPhase: "waxing crescent",
      elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      timestamp: at,
    },
    createdAt: at,
    updatedAt: at,
  };
}

function kcal(id: string): number {
  const calories = recipe(id).nutrition?.calories;
  if (typeof calories !== "number") throw new Error(`${id} publishes no calories`);
  return calories;
}

function openSection(title: RegExp): HTMLElement {
  const toggle = screen.getByRole("button", { name: title });
  fireEvent.click(toggle);
  const section = toggle.closest("section");
  if (!section) throw new Error("section toggle outside a section");
  return section;
}

afterEach(() => {
  mockMeals = [];
});

it("premise: Manakish and Kofta publish calories, Lentil Soup publishes none", () => {
  expect(kcal(MANAKISH)).toBeGreaterThan(0);
  expect(kcal(KOFTA)).toBeGreaterThan(0);
  expect(recipe(LENTIL_SOUP).nutrition?.calories).toBeUndefined();
});

it("opens as a dialog on <body>, focused on its close button; Escape closes it", () => {
  mockMeals = [monday(MANAKISH, "breakfast")];
  const onClose = jest.fn();
  render(
    <div data-testid="slot" style={{ backdropFilter: "blur(12px)" }}>
      <NutritionalDashboard isOpen onClose={onClose} />
    </div>,
  );
  const dialog = screen.getByRole("dialog", { name: "Nutrition Dashboard" });
  expect(screen.getByTestId("slot").contains(dialog)).toBe(false);
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Close nutrition dashboard" }),
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("keeps only the sections with a basis", () => {
  mockMeals = [monday(MANAKISH, "breakfast"), monday(KOFTA, "lunch")];
  render(<NutritionalDashboard isOpen onClose={jest.fn()} />);
  for (const kept of [/Weekly Overview/, /Macronutrient Distribution/, /Daily Calories/, /Elemental Balance/, /Nutritional Insights/]) {
    expect(screen.getByRole("button", { name: kept })).toBeTruthy();
  }
  expect(screen.queryByText(/Holistic Nutrition Score/)).toBeNull();
  expect(screen.queryByText(/Greg's Energy Trend/)).toBeNull();
  expect(screen.queryByText(/Alchemical Metrics/)).toBeNull();
});

it("a week with a meal that publishes no nutrition reads as lower bounds, marked partial", () => {
  mockMeals = [monday(MANAKISH, "breakfast"), monday(KOFTA, "lunch"), monday(LENTIL_SOUP, "dinner")];
  render(<NutritionalDashboard isOpen onClose={jest.fn()} />);
  const sum = kcal(MANAKISH) + kcal(KOFTA);
  expect(screen.getByText(`≥${Math.round(sum)} kcal`)).toBeTruthy();
  expect(screen.getByText("partial: 2 of 3 meals have nutrition")).toBeTruthy();
  const insights = openSection(/Nutritional Insights/);
  expect(within(insights).getByText(`Average daily calories: ≥${Math.round(sum / 7)} kcal`)).toBeTruthy();
});

it("control: a week whose meals all publish nutrition is unmarked", () => {
  mockMeals = [monday(MANAKISH, "breakfast"), monday(KOFTA, "lunch")];
  render(<NutritionalDashboard isOpen onClose={jest.fn()} />);
  expect(screen.getByText(`${Math.round(kcal(MANAKISH) + kcal(KOFTA))} kcal`)).toBeTruthy();
  expect(screen.queryByTestId("nutrition-coverage-note")).toBeNull();
});

it("a week whose meals publish no nutrition shows no totals and gives no macro advice", () => {
  mockMeals = [monday(LENTIL_SOUP, "dinner")];
  render(<NutritionalDashboard isOpen onClose={jest.fn()} />);
  expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  const macros = openSection(/Macronutrient Distribution/);
  expect(within(macros).getByText("No planned meal publishes protein, carbs or fat.")).toBeTruthy();
  const insights = openSection(/Nutritional Insights/);
  expect(within(insights).queryByText(/intake is low/)).toBeNull();
});

it("an empty week says nothing is planned instead of showing totals", () => {
  render(<NutritionalDashboard isOpen onClose={jest.fn()} />);
  expect(screen.getByText(/No meals are planned this week yet/)).toBeTruthy();
  expect(screen.queryByText(/intake is low/)).toBeNull();
  expect(screen.queryByText(/Dominant element/)).toBeNull();
});

it("renders nothing while closed", () => {
  mockMeals = [monday(MANAKISH, "breakfast")];
  render(<NutritionalDashboard isOpen={false} onClose={jest.fn()} />);
  expect(screen.queryByRole("dialog")).toBeNull();
});
