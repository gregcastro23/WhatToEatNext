/**
 * The recipe browser's cards show calories as a whole number. Searching
 * "Kofta" in local dev printed "410.00997676887453 cal" for Authentic Kofta
 * Kebab: a computed total is a float, and `x && ...` also hid a stated 0.
 *
 * Real catalog rows: Authentic Kofta Kebab and Authentic Malai Kofta, from
 * `getServerRecipes()`.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { getServerRecipes } from "@/actions/recipes";
import RecipeBrowserPanel from "@/components/menu-planner/RecipeBrowserPanel";
import { roundedCalories } from "@/utils/roundedCalories";

jest.mock("@/contexts/RecipeQueueContext", () => ({
  useRecipeQueue: () => ({ addToQueue: () => undefined, isInQueue: () => false }),
}));
jest.mock("@/hooks/useRecipeCollections", () => ({
  useRecipeCollections: () => ({ isFavorite: () => false, toggleFavorite: () => undefined }),
}));
jest.mock("@/hooks/useSpacetimeLiveRecipes", () => ({ useSpacetimeLiveRecipes: () => [] }));

const KOFTA_KEBAB = "middleeastern-lunch-all-authentic-kofta-kebab";

describe("the recipe browser's calorie label", () => {
  it("rounds the calories of a searched recipe", async () => {
    const kebab = (await getServerRecipes()).find((r) => r.id === KOFTA_KEBAB);
    const calories = kebab?.nutrition?.calories;
    if (typeof calories !== "number") throw new Error("Authentic Kofta Kebab publishes no calories");
    expect(Number.isInteger(calories)).toBe(false); // the bug needs a float

    render(<RecipeBrowserPanel onSelectRecipe={() => undefined} />);
    fireEvent.change(await screen.findByPlaceholderText(/Search recipes/), { target: { value: "Kofta" } });

    const labels = (await screen.findAllByText(/^🔥 .* cal$/)).map((el) => el.textContent);
    expect(labels).toContain(`🔥 ${Math.round(calories)} cal`);
    expect(labels.filter((t) => !/^🔥 \d+ cal$/.test(t ?? ""))).toEqual([]);
  });
});

describe("roundedCalories", () => {
  it("rounds, keeps a stated 0, and reports absent as null", () => {
    expect(roundedCalories(410.00997676887453)).toBe(410);
    expect(roundedCalories(296.7539911918525)).toBe(297);
    expect(roundedCalories(0)).toBe(0);
    expect(roundedCalories(undefined)).toBeNull();
    expect(roundedCalories(NaN)).toBeNull();
    expect(roundedCalories("410")).toBeNull();
  });
});
