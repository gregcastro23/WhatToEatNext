/**
 * The meal slot's three modals open on <body> (owner ruling 2026-09-29).
 *
 * The slot and the day card have a backdrop-filter, which makes them the
 * containing block for `position: fixed`. Rendered inside them, RecipeSelector
 * opened as a 323×270 px overlay in the Breakfast slot instead of covering the
 * 1440×1000 page (measured in local dev). SauceSelector and RecipeRitualModal
 * mount the same way. jsdom lays nothing out, so the check is ancestry: the
 * overlay must not be inside the filtered slot.
 *
 * Imports only modules that exist on master.
 */
import { render, screen } from "@testing-library/react";
import React from "react";
import RecipeSelector from "@/components/menu-planner/RecipeSelector";
import SauceSelector from "@/components/menu-planner/SauceSelector";

jest.mock("@/contexts/RecipeQueueContext", () => ({
  useRecipeQueue: () => ({ addToQueue: jest.fn(), isInQueue: () => false }),
}));
jest.mock("@/services/UnifiedRecipeService", () => ({
  UnifiedRecipeService: { getInstance: () => ({ getAllRecipes: async () => [] }) },
}));

function inFilteredSlot(modal: React.ReactElement): HTMLElement {
  render(
    <div data-testid="slot" style={{ backdropFilter: "blur(12px)" }}>
      {modal}
    </div>,
  );
  return screen.getByTestId("slot");
}

it("RecipeSelector opens outside the slot", async () => {
  const slot = inFilteredSlot(<RecipeSelector isOpen onClose={jest.fn()} onSelectRecipe={jest.fn()} />);
  const search = await screen.findByPlaceholderText(/Search recipes by name/);
  expect(document.body.contains(search)).toBe(true);
  expect(slot.contains(search)).toBe(false);
});

it("SauceSelector opens outside the slot", () => {
  const slot = inFilteredSlot(<SauceSelector isOpen onClose={jest.fn()} onSelectSauce={jest.fn()} />);
  const heading = screen.getByText("Select a Sauce");
  expect(slot.contains(heading)).toBe(false);
});

it("control: closed, none of them renders anywhere", () => {
  inFilteredSlot(
    <>
      <RecipeSelector isOpen={false} onClose={jest.fn()} onSelectRecipe={jest.fn()} />
      <SauceSelector isOpen={false} onClose={jest.fn()} onSelectSauce={jest.fn()} />
    </>,
  );
  expect(screen.queryByPlaceholderText(/Search recipes by name/)).toBeNull();
  expect(screen.queryByText("Select a Sauce")).toBeNull();
});
