/**
 * Both ways to open the planner's Nutrition Dashboard (owner rulings
 * 2026-09-29):
 * - the tools-bar "Nutrition Dashboard" button. Before, it toggled a flag that
 *   only styled itself, and nothing ever opened the mounted modal;
 * - "Week nutrition" beside "Shop the week" on phones, where the tools bar is
 *   hidden. The page hands the calendar the opener, and the mobile planner
 *   renders it.
 *
 * The real page and the real dashboard. Everything else on the page is a stub
 * (next/dynamic hands back the real dashboard and a calendar stub that renders
 * whatever opener it is given). Imports only modules that exist on master.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import MenuPlannerPage from "@/app/menu-planner/page";
import RedesignedMobilePlanner from "@/components/menu-planner/redesign/RedesignedMobilePlanner";
import { emptyDayRecord } from "@/utils/dayCircuitCalculations";

jest.mock("next/dynamic", () => (load: () => unknown) => {
  const source = String(load);
  if (source.includes("menu-planner/NutritionalDashboard")) {
    return require("@/components/menu-planner/NutritionalDashboard").default;
  }
  if (source.includes("menu-planner/WeeklyCalendar")) {
    return function CalendarStub(props: { onOpenNutrition?: () => void }) {
      const { createElement } = require("react");
      return props.onOpenNutrition
        ? createElement("button", { onClick: props.onOpenNutrition }, "calendar: week nutrition")
        : null;
    };
  }
  return () => null;
});
jest.mock("@/components/menu-builder/QuickActionsToolbar", () => () => null);
jest.mock("@/components/menu-planner/redesign/FastStartCard", () => () => null);
jest.mock("@/components/menu-planner/redesign/RedesignedDayCard", () => () => null);
jest.mock("@/components/menu-planner/redesign/WeeklyInsights", () => () => null);
jest.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
jest.mock("@/contexts/SpacetimeContext", () => ({ useSpacetime: () => ({ connection: null, status: "disconnected" }) }));
jest.mock("@/hooks/useSpacetimePlannerSync", () => ({
  useSpacetimePlannerSync: () => ({ live: false, liveSlotCount: 0, unappliedRemoteSlots: 0 }),
}));
jest.mock("@/hooks/useRecipeRefResolver", () => ({ useRecipeRefResolver: () => () => null }));
jest.mock("@/hooks/useNutritionTracking", () => ({ useNutritionTracking: () => null }));
jest.mock("@/hooks/useShareIdentityDefault", () => ({ useShareIdentityDefault: () => ({ shareByDefault: true }) }));
jest.mock("@/lib/spacetime/liveFeedPublish", () => ({ publishLiveFeedEvent: jest.fn() }));
jest.mock("@/contexts/RecipeQueueContext", () => ({
  RecipeQueueProvider: ({ children }: { children: React.ReactNode }) => children,
  useRecipeQueue: () => ({ queueSize: 0 }),
}));
jest.mock("@/contexts/MenuPlannerContext", () => ({
  MenuPlannerProvider: ({ children }: { children: React.ReactNode }) => children,
  useMenuPlanner: () => ({
    currentMenu: { meals: [] },
    weeklyStats: null,
    participants: [],
    generationPreferences: { nutritionalTargets: null },
    regenerateGroceryList: jest.fn(),
    toggleSyncWithLunarCycle: jest.fn(),
    syncWithLunarCycle: false,
  }),
}));

function dashboard(): HTMLElement | null {
  return screen.queryByRole("dialog", { name: "Nutrition Dashboard" });
}

describe("the planner page", () => {
  it("opens the Nutrition Dashboard from the tools-bar button", () => {
    render(<MenuPlannerPage />);
    expect(dashboard()).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Nutrition Dashboard/ }));
    expect(dashboard()).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close nutrition dashboard" }));
    expect(dashboard()).toBeNull();
  });

  it("hands the calendar an opener for the phone layout", () => {
    render(<MenuPlannerPage />);
    fireEvent.click(screen.getByRole("button", { name: "calendar: week nutrition" }));
    expect(dashboard()).not.toBeNull();
  });
});

describe("the mobile planner", () => {
  const weekDates = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2026, 8, 27 + i)));
  const props = {
    weekDates: [weekDates[0], weekDates[1], weekDates[2], weekDates[3], weekDates[4], weekDates[5], weekDates[6]],
    mealsByDay: emptyDayRecord(() => []),
    todayDayOfWeek: null,
  };

  it("renders 'Week nutrition' beside 'Shop the week', and it opens the dashboard", () => {
    const onOpenNutrition = jest.fn();
    render(<RedesignedMobilePlanner {...props} onShopWeek={jest.fn()} onOpenNutrition={onOpenNutrition} />);
    const button = screen.getByRole("button", { name: /Week nutrition/ });
    expect(button.parentElement?.contains(screen.getByRole("button", { name: /Shop the week/ }))).toBe(true);
    fireEvent.click(button);
    expect(onOpenNutrition).toHaveBeenCalledTimes(1);
  });

  it("control: with no opener there is no 'Week nutrition' button", () => {
    render(<RedesignedMobilePlanner {...props} onShopWeek={jest.fn()} onOpenNutrition={undefined} />);
    expect(screen.queryByRole("button", { name: /Week nutrition/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Shop the week/ })).toBeTruthy();
  });
});
