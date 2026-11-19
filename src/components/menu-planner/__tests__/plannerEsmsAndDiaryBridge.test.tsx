/**
 * Tests for Orthogonal Alchemical ESMS Quantities & Cooked/Diary Reward Loop in Meal Planner
 *
 * @file src/components/menu-planner/__tests__/plannerEsmsAndDiaryBridge.test.tsx
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { PRACTICE_REWARD_EVENT } from "@/lib/economy/practiceClient";
import type { MealSlot } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import MealDetailSheet from "../board/MealDetailSheet";
import ElementalHarmonyModal from "../modals/ElementalHarmonyModal";
import {
  computeWeeklyEsmsSnapshot,
  dominantEsms,
  readRecipeEsms,
} from "../redesign/elementUtils";
import { PlannerUIProvider } from "../shell/PlannerUIContext";
import WeekSummaryStrip from "../shell/WeekSummaryStrip";

const mockCookAndLogPlannedMeal = jest.fn();

jest.mock("@/actions/foodDiary", () => ({
  cookAndLogPlannedMeal: (...args: unknown[]) =>
    mockCookAndLogPlannedMeal(...args),
}));

let mockPlannerContext: Record<string, unknown> = {};
jest.mock("@/contexts/MenuPlannerContext", () => ({
  useMenuPlanner: () => mockPlannerContext,
}));

const esmsRecipe: Recipe = {
  id: "recipe-esms-1",
  name: "Saffron Solar Risotto",
  cuisine: "Italian",
  servings: 2,
  spirit: 4.0,
  essence: 3.0,
  matter: 2.0,
  substance: 1.0,
  ingredients: [{ name: "Arborio Rice", amount: 1, unit: "cup" }],
  instructions: ["Simmer with saffron broth"],
  nutrition: { calories: 420 },
  elementalProperties: {
    Fire: 0.5,
    Water: 0.3,
    Earth: 0.1,
    Air: 0.1,
  },
};

const esmsSlot: MealSlot = {
  id: "slot-mon-dinner",
  dayOfWeek: 1,
  mealType: "dinner",
  recipe: esmsRecipe,
  servings: 2,
  isLocked: false,
  planetarySnapshot: {
    dominantPlanet: "Moon",
    zodiacSign: "cancer",
    lunarPhase: "full moon",
    elementalState: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    timestamp: new Date("2026-11-16T12:00:00.000Z"),
  },
  createdAt: new Date("2026-11-16T12:00:00.000Z"),
  updatedAt: new Date("2026-11-16T12:00:00.000Z"),
};

beforeEach(() => {
  mockCookAndLogPlannedMeal.mockReset();
  mockPlannerContext = {};
});

describe("Orthogonal ESMS quantity helpers (elementUtils)", () => {
  it("reads top-level spirit/essence/matter/substance and scales by servings", () => {
    const q1 = readRecipeEsms(esmsRecipe, 1);
    expect(q1).toEqual({
      Spirit: 4,
      Essence: 3,
      Matter: 2,
      Substance: 1,
      totalASharp: 10,
    });

    const q2 = readRecipeEsms(esmsRecipe, 2);
    expect(q2).toEqual({
      Spirit: 8,
      Essence: 6,
      Matter: 4,
      Substance: 2,
      totalASharp: 20,
    });
    expect(dominantEsms(q2)).toBe("Spirit");
  });

  it("never derives ESMS from classical elements when ESMS quantities are absent or zero", () => {
    const elementsOnly: Recipe = {
      id: "elements-only",
      name: "Plain Broth",
      ingredients: [],
      instructions: [],
      elementalProperties: { Fire: 0.9, Water: 0.1, Earth: 0, Air: 0 },
    };
    expect(readRecipeEsms(elementsOnly, 1)).toBeNull();
    expect(
      readRecipeEsms(
        { spirit: 0, essence: 0, matter: 0, substance: 0 },
        1,
      ),
    ).toBeNull();
  });

  it("aggregates weekly ESMS snapshot across meal slots", () => {
    const snap = computeWeeklyEsmsSnapshot([esmsSlot]);
    expect(snap.mealsWithEsms).toBe(1);
    expect(snap.totalASharp).toBeCloseTo(20, 5);
    expect(snap.dominant).toBe("Spirit");
    expect(snap.dist.Spirit).toBeCloseTo(0.4, 5);
    expect(snap.dist.Essence).toBeCloseTo(0.3, 5);
    expect(snap.dist.Matter).toBeCloseTo(0.2, 5);
    expect(snap.dist.Substance).toBeCloseTo(0.1, 5);
  });
});

describe("WeekSummaryStrip & ElementalHarmonyModal ESMS display", () => {
  it("renders A# and Natal Constitutional ESMS Affinity when user has a natal chart", () => {
    mockPlannerContext = {
      currentMenu: { id: "menu-esms", meals: [esmsSlot] },
      weeklyStats: {
        totalMeals: 1,
        totalRecipes: 1,
        elementalDistribution: { Fire: 0.5, Water: 0.3, Earth: 0.1, Air: 0.1 },
      },
      weeklyBudget: 120,
      estimatedWeeklyCost: 48,
    };
    render(
      <PlannerUIProvider>
        <WeekSummaryStrip />
        <ElementalHarmonyModal
          isOpen
          onClose={jest.fn()}
          natalAlchemical={{
            Spirit: 37,
            Essence: 33,
            Matter: 20,
            Substance: 10,
          }}
        />
      </PlannerUIProvider>,
    );

    expect(screen.getByText(/A# 20\.0 · 🝇 Spirit/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Alchemical ESMS Quantities \(A#\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/✦ 97% Natal ESMS Affinity/i),
    ).toBeInTheDocument();
  });
});

describe("MealDetailSheet ESMS readout & Cooked/Diary Matter reward", () => {
  it("displays meal ESMS quantities and triggers cooked_recipe Matter reward toast on click", async () => {
    mockPlannerContext = {
      inventory: [],
      setInventory: jest.fn(),
      updateMealServings: jest.fn().mockResolvedValue(undefined),
      lockMeal: jest.fn(),
      unlockMeal: jest.fn(),
      addSauceToMeal: jest.fn(),
      removeSauceFromMeal: jest.fn(),
      updateSauceServings: jest.fn(),
    };
    mockCookAndLogPlannedMeal.mockResolvedValue({
      entry: { id: "diary-1", mealType: "dinner" },
      reward: {
        tokenType: "Matter",
        amount: 4,
        hint: "The kitchen is the true athanor",
      },
    });

    const receivedRewards: unknown[] = [];
    const listener = (e: Event) => {
      if (e instanceof CustomEvent) receivedRewards.push(e.detail);
    };
    window.addEventListener(PRACTICE_REWARD_EVENT, listener);

    try {
      render(
        <PlannerUIProvider>
          <MealDetailSheet
            slot={esmsSlot}
            onClose={jest.fn()}
            onRemove={jest.fn()}
          />
        </PlannerUIProvider>,
      );

      expect(screen.getByText("A# 20.0")).toBeInTheDocument();

      const cookBtn = screen.getByRole("button", {
        name: /I Cooked This · Log & Earn 🝙 Matter/i,
      });
      fireEvent.click(cookBtn);

      await waitFor(() => {
        expect(mockCookAndLogPlannedMeal).toHaveBeenCalledWith({
          mealSlot: esmsSlot,
        });
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Cooked & Logged to Diary/i }),
        ).toBeInTheDocument();
      });

      expect(receivedRewards).toEqual([
        {
          tokenType: "Matter",
          amount: 4,
          hint: "The kitchen is the true athanor",
        },
      ]);
    } finally {
      window.removeEventListener(PRACTICE_REWARD_EVENT, listener);
    }
  });
});
