import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import WeekBoard from "../board/WeekBoard";
import GenerationPreferencesPanel from "../GenerationPreferencesPanel";
import { PlannerUIProvider, usePlannerUI } from "../shell/PlannerUIContext";
import { usePlanActions } from "../shell/usePlanActions";
import type { GenerationPreferences } from "@/contexts/MenuPlannerContext";
import { useUndoableClear } from "../shell/useUndoableClear";
import PlannerUndoToast from "../shell/PlannerUndoToast";
import type { MealSlot } from "@/types/menuPlanner";

const mockAdd = jest.fn().mockResolvedValue(undefined);
const mockUpdateServings = jest.fn().mockResolvedValue(undefined);
const mockGenerate = jest.fn().mockResolvedValue(undefined);
const mockGetRecipes = jest.fn().mockResolvedValue([]);
const mockUpdatePreference = jest.fn();
const mockAddSauce = jest.fn().mockResolvedValue(undefined);
const mockRecommendSauces = jest.fn().mockReturnValue([]);
const recipe = {
  id: "oats",
  name: "Morning oats",
  ingredients: [],
  nutrition: { calories: 300 },
};
const at = new Date("2026-10-25T12:00:00");
const makeSlot = (filled = false): MealSlot => ({
  id: "sun-breakfast",
  dayOfWeek: 0,
  mealType: "breakfast",
  servings: 1,
  ...(filled ? { recipe } : {}),
  createdAt: at,
  updatedAt: at,
  planetarySnapshot: {
    dominantPlanet: "Sun",
    zodiacSign: "libra",
    lunarPhase: "full moon",
    elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    timestamp: at,
  },
});
let mockMeals: MealSlot[];
let mockMenuId = "week-a";
const mockClear = jest.fn().mockResolvedValue(undefined);
const preferences: GenerationPreferences = {
  dietaryRestrictions: [],
  excludeIngredients: [],
  requiredIngredients: [],
  preferredCuisines: [],
  preferredCookingMethods: [],
  flavorPreferences: [],
  maxPrepTimeMinutes: null,
  nutritionalTargets: {
    dailyCalories: 2000,
    dailyProteinG: null,
    dailyCarbsG: null,
    dailyFatG: null,
    dailyFiberG: null,
    prioritizeProtein: false,
    prioritizeFiber: false,
  },
};
jest.mock("@/contexts/MenuPlannerContext", () => ({
  useMenuPlanner: () => ({
    currentMenu: { id: mockMenuId, meals: mockMeals },
    navigation: { currentWeekStart: at },
    addMealToSlot: mockAdd,
    updateMealServings: mockUpdateServings,
    generateMealsForDay: mockGenerate,
    removeMealFromSlot: jest.fn().mockResolvedValue(undefined),
    clearWeek: mockClear,
    clearDay: mockClear,
    generationPreferences: preferences,
    updateGenerationPreference: mockUpdatePreference,
    resetGenerationPreferences: jest.fn(),
    lockMeal: jest.fn(),
    unlockMeal: jest.fn(),
    addSauceToMeal: mockAddSauce,
  }),
}));
jest.mock("@/contexts/UserContext", () => ({ useOptionalUser: () => null }));
jest.mock("@/actions/recipes", () => ({
  getServerRecipes: (...args: unknown[]) => mockGetRecipes(...args),
}));
jest.mock("@/lib/questReporter", () => ({ reportQuestEvent: jest.fn() }));
jest.mock("../RecipeSelector", () => () => null);
jest.mock("@/utils/cuisine/intelligentSauceRecommender", () => ({
  recommendSauces: (...args: unknown[]) => mockRecommendSauces(...args),
}));

function Controls() {
  const ui = usePlannerUI();
  return (
    <>
      <button onClick={() => ui.startPlacing(recipe)}>Pick oats</button>
      <button onClick={() => ui.setView("day", 0)}>Focus Sunday</button>
    </>
  );
}
function Board() {
  return (
    <PlannerUIProvider>
      <Controls />
      <WeekBoard onCopyMeal={jest.fn()} />
      <PlannerUndoToast />
    </PlannerUIProvider>
  );
}
beforeEach(() => {
  mockMeals = [makeSlot()];
  mockMenuId = "week-a";
  preferences.dietaryRestrictions = [];
  preferences.excludeIngredients = [];
  mockAdd.mockResolvedValue(undefined);
  window.localStorage.clear();
});

it("places a rail recipe in Day view instead of opening another selector", async () => {
  render(<Board />);
  fireEvent.click(screen.getByText("Focus Sunday"));
  fireEvent.click(screen.getByText("Pick oats"));
  fireEvent.click(
    screen.getByRole("button", {
      name: "Place Morning oats at Sunday breakfast",
    }),
  );
  await waitFor(() =>
    expect(mockAdd).toHaveBeenCalledWith(0, "breakfast", recipe),
  );
});

it("does not label a non-current focused date Today", () => {
  render(<Board />);
  fireEvent.click(screen.getByText("Focus Sunday"));
  expect(screen.queryByRole("heading", { name: "Today" })).toBeNull();
});

it("keeps meal details synchronized after serving and lock updates", async () => {
  mockMeals = [makeSlot(true)];
  const view = render(<Board />);
  fireEvent.click(
    screen.getByRole("button", { name: /Morning oats.*Open details/ }),
  );
  const [firstMeal] = mockMeals;
  if (firstMeal) {
    mockMeals = [{ ...firstMeal, servings: 2, isLocked: true }];
  }
  view.rerender(<Board />);
  const dialog = screen.getByRole("dialog", { name: "Morning oats" });
  expect(within(dialog).getByText("600 kcal")).toBeTruthy();
  expect(
    within(dialog).getByRole("button", { name: "Unlock slot" }),
  ).toBeTruthy();
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Increase servings" }),
  );
  await waitFor(() =>
    expect(mockUpdateServings).toHaveBeenCalledWith("sun-breakfast", 3),
  );
});

it("moves keyboard focus between board slots with arrow keys", () => {
  mockMeals = [
    makeSlot(),
    { ...makeSlot(), id: "mon-breakfast", dayOfWeek: 1 },
  ];
  render(<Board />);
  const sunday = screen.getByRole("button", { name: "Add Sunday breakfast" });
  sunday.focus();
  fireEvent.keyDown(sunday, { key: "ArrowRight" });
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Add Monday breakfast" }),
  );
});

it("exposes custom calories, flavors, and required ingredients in the settings drawer", () => {
  render(<GenerationPreferencesPanel isOpen embedded onToggle={jest.fn()} />);
  expect(screen.getByDisplayValue("2000")).toBeTruthy();
  expect(screen.getByText("Flavor Profile")).toBeTruthy();
  expect(screen.getByText(/Include Ingredients/)).toBeTruthy();
});

it("does not replace freshly generated recipes with catalog fallback picks", async () => {
  mockGetRecipes.mockResolvedValue([{ ...recipe, id: "fallback" }]);
  function Action() {
    const actions = usePlanActions(["breakfast"]);
    return <button onClick={() => actions.fillNextDay()}>Fill day</button>;
  }
  render(<Action />);
  await act(async () => {
    fireEvent.click(screen.getByText("Fill day"));
  });
  expect(mockGenerate).toHaveBeenCalled();
  expect(mockAdd).not.toHaveBeenCalled();
});

it.each(["balance", "addVariety"] as const)(
  "%s respects diet and excluded ingredients",
  async (kind) => {
    mockMeals = ([0, 1, 2] as const).map((day) => ({
      ...makeSlot(true),
      id: `slot-${day}`,
      dayOfWeek: day,
    }));
    preferences.dietaryRestrictions = ["vegetarian"];
    preferences.excludeIngredients = ["Peanut"];
    mockGetRecipes.mockResolvedValue([
      {
        ...recipe,
        id: "meat",
        isVegetarian: false,
        mealType: ["breakfast"],
        ingredients: [{ name: "beef" }],
        nutrition: { calories: 400, protein: 50, fiber: 10 },
      },
      {
        ...recipe,
        id: "nuts",
        isVegetarian: true,
        mealType: ["breakfast"],
        ingredients: [{ name: "peanut" }],
        nutrition: { calories: 400, protein: 50, fiber: 10 },
      },
      {
        ...recipe,
        id: "safe",
        isVegetarian: true,
        mealType: ["breakfast"],
        ingredients: [{ name: "lentils" }],
        nutrition: { calories: 400, protein: 30, fiber: 8 },
      },
    ]);
    function Action() {
      const actions = usePlanActions(["breakfast"]);
      return <button onClick={() => actions[kind]()}>Optimize</button>;
    }
    render(<Action />);
    await act(async () => {
      fireEvent.click(screen.getByText("Optimize"));
    });
    expect(mockAdd).toHaveBeenCalled();
    expect(mockAdd.mock.calls.every((call) => call[2].id === "safe")).toBe(
      true,
    );
  },
);

it("retains the selected recipe when placement fails so the user can retry", async () => {
  mockAdd.mockRejectedValueOnce(new Error("offline"));
  render(<Board />);
  fireEvent.click(screen.getByText("Pick oats"));
  fireEvent.click(
    screen.getByRole("button", {
      name: "Place Morning oats at Sunday breakfast",
    }),
  );
  await waitFor(() => expect(mockAdd).toHaveBeenCalled());
  expect(
    screen.getByRole("button", {
      name: "Place Morning oats at Sunday breakfast",
    }),
  ).toBeTruthy();
});

function ClearControl() {
  const { clearWeekWithUndo } = useUndoableClear();
  return (
    <>
      <button onClick={clearWeekWithUndo}>Clear plan</button>
      <PlannerUndoToast />
    </>
  );
}
function ClearHarness() {
  return (
    <PlannerUIProvider>
      <ClearControl />
    </PlannerUIProvider>
  );
}
it("undo cannot write cleared meals into a different week", async () => {
  mockMeals = [makeSlot(true)];
  const view = render(<ClearHarness />);
  await act(async () => {
    fireEvent.click(screen.getByText("Clear plan"));
  });
  mockMenuId = "week-b";
  mockMeals = [makeSlot()];
  view.rerender(<ClearHarness />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  });
  expect(mockAdd).not.toHaveBeenCalled();
});
it("undo restores the cleared recipe, serving count, and lock in the original week", async () => {
  mockMeals = [{ ...makeSlot(true), servings: 3, isLocked: true }];
  const view = render(<ClearHarness />);
  await act(async () => {
    fireEvent.click(screen.getByText("Clear plan"));
  });
  mockMeals = [makeSlot()];
  view.rerender(<ClearHarness />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  });
  expect(mockAdd).toHaveBeenCalledWith(0, "breakfast", recipe, 3, true);
});

it("undo still restores a meal after its detail sheet has unmounted", async () => {
  mockMeals = [makeSlot(true)];
  const view = render(<Board />);
  fireEvent.click(
    screen.getByRole("button", { name: /Morning oats.*Open details/ }),
  );
  await act(async () => {
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Morning oats" })).getByRole(
        "button",
        { name: "Remove" },
      ),
    );
  });
  mockMeals = [makeSlot()];
  view.rerender(<Board />);
  expect(screen.queryByRole("dialog", { name: "Morning oats" })).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  });
  expect(mockAdd).toHaveBeenCalledWith(0, "breakfast", recipe, 1, false);
});

it("returns keyboard focus to the opener when a meal sheet closes", async () => {
  mockMeals = [makeSlot(true)];
  render(<Board />);
  const opener = screen.getByRole("button", {
    name: /Morning oats.*Open details/,
  });
  opener.focus();
  fireEvent.click(opener);
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Morning oats" }), {
    key: "Escape",
  });
  await waitFor(() => expect(document.activeElement).toBe(opener));
});

it.each([false, true])(
  "opens a usable sauce picker with only genuine ESMS quantities (available: %s)",
  async (hasQuantities) => {
    const quantities = { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 };
    mockMeals = [
      {
        ...makeSlot(true),
        recipe: {
          ...recipe,
          elementalProperties: {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25,
          },
          alchemicalProperties: {
            heat: 88,
            entropy: 3,
            stability: 7,
            reactivity: 12,
          },
          ...(hasQuantities ? { mappedAlchemy: quantities } : {}),
        },
      },
    ];
    render(<Board />);
    fireEvent.click(
      screen.getByRole("button", { name: /Morning oats.*Open details/ }),
    );
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Morning oats" })).getByRole(
        "button",
        { name: /Add Sauce/i },
      ),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Morning oats" })).toBeNull(),
    );
    expect(screen.getByRole("dialog", { name: "Select a Sauce" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Select a Sauce" }),
    ).toBeTruthy();
    expect(
      mockRecommendSauces.mock.calls.at(-1)?.[0].targetAlchemicalProperties,
    ).toEqual(hasQuantities ? quantities : undefined);
    fireEvent.click(screen.getByRole("button", { name: /All Sauces/ }));
    const [firstSauceBtn] = screen.getAllByRole("button", { name: "Add Sauce" });
    if (firstSauceBtn) fireEvent.click(firstSauceBtn);
    await waitFor(() =>
      expect(mockAddSauce).toHaveBeenCalledWith(
        "sun-breakfast",
        expect.any(String),
      ),
    );
    expect(screen.getByRole("dialog", { name: "Morning oats" })).toBeTruthy();
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Morning oats" })).getByRole(
        "button",
        { name: /Add Sauce/i },
      ),
    );
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Select a Sauce" }), {
      key: "Escape",
    });
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Select a Sauce" }),
      ).toBeNull(),
    );
    expect(screen.getByRole("dialog", { name: "Morning oats" })).toBeTruthy();
  },
);
