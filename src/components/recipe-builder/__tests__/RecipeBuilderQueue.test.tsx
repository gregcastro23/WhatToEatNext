/**
 * @jest-environment jsdom
 *
 * The Alchemical Crucible: its elemental quad-spectrum (whole-percent shares
 * that always total 100, read from the queued ingredients' own values), the
 * gauge's meters, chip removal, and the empty state.
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { RecipeBuilderProvider, type SelectedIngredient } from "@/contexts/RecipeBuilderContext";
import { computeElementalBalance } from "../crucible/elementalBalance";
import RecipeBuilderQueue from "../RecipeBuilderQueue";

const STORAGE_KEY = "alchm-recipe-builder";

const GARLIC: SelectedIngredient = {
  name: "garlic",
  elementalProperties: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 },
};
const CUCUMBER: SelectedIngredient = {
  name: "cucumber",
  elementalProperties: { Fire: 0, Water: 0.7, Earth: 0.1, Air: 0.2 },
};

function renderQueue(saved: Record<string, unknown>): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  render(
    <RecipeBuilderProvider>
      <RecipeBuilderQueue />
    </RecipeBuilderProvider>,
  );
}

function shareOf(element: string): string | null {
  return screen.getByRole("meter", { name: element }).getAttribute("aria-valuenow");
}

describe("computeElementalBalance", () => {
  it("sums each element across the queued ingredients and reports whole-percent shares", () => {
    expect(computeElementalBalance([GARLIC, CUCUMBER])).toEqual({
      shares: { Fire: 30, Water: 40, Earth: 15, Air: 15 },
      indexedCount: 2,
    });
  });

  it("keeps the four shares at exactly 100 when rounding alone would not", () => {
    const even = { name: "even", elementalProperties: { Fire: 1, Water: 1, Earth: 1, Air: 0 } };
    const balance = computeElementalBalance([even]);
    expect(balance?.shares).toEqual({ Fire: 34, Water: 33, Earth: 33, Air: 0 });
  });

  it("ignores ingredients without elemental values and negative or non-finite values", () => {
    const bare = { name: "salt" };
    const odd = { name: "odd", elementalProperties: { Fire: -5, Water: Number.NaN, Earth: 1 } };
    expect(computeElementalBalance([bare, odd])).toEqual({
      shares: { Fire: 0, Water: 0, Earth: 100, Air: 0 },
      indexedCount: 1,
    });
  });

  it("is null when nothing queued carries an elemental value", () => {
    expect(computeElementalBalance([])).toBeNull();
    expect(computeElementalBalance([{ name: "salt" }])).toBeNull();
  });
});

describe("RecipeBuilderQueue", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders the elemental gauge as four meters carrying the live shares", async () => {
    renderQueue({ selectedIngredients: [GARLIC, CUCUMBER] });

    const gauge = await screen.findByRole("group", { name: /Crucible elemental balance across 2 indexed ingredients/ });
    expect(gauge).toHaveAccessibleName(
      "Crucible elemental balance across 2 indexed ingredients: Fire 30%, Water 40%, Earth 15%, Air 15%",
    );
    expect(shareOf("Fire")).toBe("30");
    expect(shareOf("Water")).toBe("40");
    expect(shareOf("Earth")).toBe("15");
    expect(shareOf("Air")).toBe("15");
  });

  it("re-balances when a queued ingredient is removed", async () => {
    renderQueue({ selectedIngredients: [GARLIC, CUCUMBER] });

    fireEvent.click(await screen.findByRole("button", { name: "Remove cucumber" }));

    const ingredients = screen.getByRole("group", { name: "Ingredients" });
    expect(within(ingredients).queryByText("cucumber")).not.toBeInTheDocument();
    expect(within(ingredients).getByText("garlic")).toBeInTheDocument();
    expect(shareOf("Fire")).toBe("60");
    expect(shareOf("Water")).toBe("10");
  });

  it("shows no gauge when no queued ingredient carries elemental values", async () => {
    renderQueue({ selectedIngredients: [{ name: "salt" }] });

    expect(await screen.findByText("salt")).toBeInTheDocument();
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
  });

  it("returns to the empty crucible once the last selection is removed", async () => {
    renderQueue({ selectedIngredients: [GARLIC], mealType: "Dinner" });

    fireEvent.click(await screen.findByRole("button", { name: "Remove garlic" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear meal type" }));

    expect(screen.getByText("The Alchemical Crucible is Empty")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Alchemical Crucible" })).not.toBeInTheDocument();
  });

  it("empties everything with Clear Crucible", async () => {
    renderQueue({ selectedIngredients: [GARLIC], selectedCuisines: ["Thai"], flavors: ["spicy"] });

    fireEvent.click(await screen.findByRole("button", { name: "Clear Crucible" }));

    expect(screen.getByText("The Alchemical Crucible is Empty")).toBeInTheDocument();
  });

  it("starts empty with nothing saved", () => {
    render(
      <RecipeBuilderProvider>
        <RecipeBuilderQueue />
      </RecipeBuilderProvider>,
    );
    expect(screen.getByText("The Alchemical Crucible is Empty")).toBeInTheDocument();
  });
});
