/**
 * The planner's "planned" counts count slots that hold a recipe, over the
 * slots the week has.
 *
 * Measured in local dev 2026-09-29:
 * - the Today card read "4/4 planned" on a day with nothing planned, because
 *   it counted slot objects, and a slot exists for every meal window;
 * - Quick Actions read "(28/21 meals planned)" on a full week, because it
 *   divided the 28 filled slots (breakfast, lunch, dinner and snack × 7) by a
 *   hardcoded 21.
 *
 * Real components and one real catalog recipe; the planner, queue and user
 * contexts are stubs. Imports only modules that exist on master.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import { getServerRecipes } from "@/actions/recipes";
import QuickActionsToolbar from "@/components/menu-builder/QuickActionsToolbar";
import TodaysMealsWidget from "@/components/menu-planner/TodaysMealsWidget";
import type { DayOfWeek, MealSlot, MealType, WeeklyMenu } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

let mockMenu: WeeklyMenu | null = null;
jest.mock("@/contexts/MenuPlannerContext", () => ({
  useMenuPlanner: () => ({
    currentMenu: mockMenu,
    moveMeal: jest.fn(),
    removeMealFromSlot: jest.fn(),
    addMealToSlot: jest.fn(),
    clearWeek: jest.fn(),
    generateMealsForDay: jest.fn(),
    weeklyBudget: null,
    setWeeklyBudget: jest.fn(),
    estimatedWeeklyCost: 0,
    costConfidence: "low",
    costBreakdown: [],
    budgetPerMeal: null,
    generationPreferences: {
      preferredCuisines: [],
      dietaryRestrictions: [],
      preferredCookingMethods: [],
      flavorPreferences: [],
      excludeIngredients: [],
      requiredIngredients: [],
      maxPrepTimeMinutes: null,
      nutritionalTargets: {
        dailyCalories: null,
        dailyProteinG: null,
        dailyCarbsG: null,
        dailyFatG: null,
        dailyFiberG: null,
        prioritizeProtein: false,
        prioritizeFiber: false,
      },
    },
  }),
}));
jest.mock("@/contexts/RecipeQueueContext", () => ({
  useRecipeQueue: () => ({ addToQueue: jest.fn(), isInQueue: () => false }),
}));
jest.mock("@/contexts/UserContext", () => ({ useUser: () => ({ currentUser: null }) }));
jest.mock("@/actions/foodDiary", () => ({ logServerMealFromPlan: jest.fn() }));
jest.mock("@/lib/questReporter", () => ({ reportQuestEvent: jest.fn() }));
jest.mock("@/components/menu-planner/RecipeSelector", () => () => null);
jest.mock("@/components/menu-planner/RecipeCollisionModal", () => () => null);

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
// The widget reads "today" from the clock, as the page does.
const TODAY = new Date().getDay();
let lunch: Recipe;

beforeAll(async () => {
  const found = (await getServerRecipes()).find((r) => r.id === "middleeastern-lunch-all-authentic-kofta-kebab");
  if (!found) throw new Error("Authentic Kofta Kebab is not in the catalog");
  lunch = found;
});

/** A week with every slot the planner creates (4 × 7 = 28), filled where `filled` says. */
function week(filled: (day: DayOfWeek, mealType: MealType) => boolean): WeeklyMenu {
  const at = new Date();
  const meals: MealSlot[] = DAYS.flatMap((dayOfWeek) =>
    MEAL_TYPES.map((mealType) => ({
      id: `${dayOfWeek}-${mealType}`,
      dayOfWeek,
      mealType,
      servings: 1,
      ...(filled(dayOfWeek, mealType) ? { recipe: lunch } : {}),
      planetarySnapshot: {
        dominantPlanet: "Moon",
        zodiacSign: "libra",
        lunarPhase: "waxing crescent",
        elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        timestamp: at,
      },
      createdAt: at,
      updatedAt: at,
    })),
  );
  return { id: "w", weekStartDate: at, weekEndDate: at, meals, groceryList: [], savedAsTemplate: false, createdAt: at, updatedAt: at };
}

afterEach(() => {
  mockMenu = null;
});

describe("the Today card", () => {
  it("counts only today's slots that hold a recipe", () => {
    mockMenu = week((day, mealType) => day === TODAY && mealType === "lunch");
    render(<TodaysMealsWidget weekPlan={mockMenu} />);
    expect(screen.getByText("1/4 planned")).toBeTruthy();
  });

  it("reads 0/4 on a day with nothing planned", () => {
    mockMenu = week(() => false);
    render(<TodaysMealsWidget weekPlan={mockMenu} />);
    expect(screen.getByText("0/4 planned")).toBeTruthy();
  });

  it("control: a fully planned day reads 4/4", () => {
    mockMenu = week((day) => day === TODAY);
    render(<TodaysMealsWidget weekPlan={mockMenu} />);
    expect(screen.getByText("4/4 planned")).toBeTruthy();
  });
});

describe("Quick Actions", () => {
  it("counts filled slots over the week's 28", () => {
    mockMenu = week((_day, mealType) => mealType === "lunch");
    render(<QuickActionsToolbar />);
    expect(screen.getByText("(7/28 meals planned)")).toBeTruthy();
  });

  it("a full week reads 28/28", () => {
    mockMenu = week(() => true);
    render(<QuickActionsToolbar />);
    expect(screen.getByText("(28/28 meals planned)")).toBeTruthy();
  });
});
