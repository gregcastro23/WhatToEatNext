/**
 * The planner's two recipe-detail openers work (owner rulings 2026-09-28).
 *
 * 1. A meal slot's compact nutrition chips carry a small "Details →" that opens
 *    RecipeNutritionModal. On master the compact view never rendered its opener,
 *    so the modal MealSlot mounts could not open.
 * 2. The recipe browser's "Details" opens the planner's RecipeDetailModal and
 *    stays on the page. It was a <Link> to /recipes/[id] whose onClick also
 *    opened the modal, so the modal flashed and the page navigated away. The
 *    recipe name stays the link to the full recipe page.
 *
 * Real catalog rows: Authentic Kofta Kebab (a computed recipe with nutrition).
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { getServerRecipes } from "@/actions/recipes";
import RecipeBrowserPanel from "@/components/menu-planner/RecipeBrowserPanel";
import { RecipeNutritionQuickView } from "@/components/nutrition/RecipeNutritionQuickView";
import type { Recipe } from "@/types/recipe";

jest.mock("@/contexts/RecipeQueueContext", () => ({
  useRecipeQueue: () => ({
    addToQueue: () => undefined,
    isInQueue: () => false,
  }),
}));
jest.mock("@/hooks/useSpacetimeLiveRecipes", () => ({
  useSpacetimeLiveRecipes: () => [],
}));

const KOFTA_ID = "middleeastern-lunch-all-authentic-kofta-kebab";
let catalog: Recipe[];
let kofta: Recipe;

beforeAll(async () => {
  catalog = await getServerRecipes();
  const found = catalog.find((r) => r.id === KOFTA_ID);
  if (!found) throw new Error("Authentic Kofta Kebab is not in the catalog");
  kofta = found;
});

describe("a meal slot's nutrition details", () => {
  it("renders a details control on a compact view when an opener is provided", () => {
    const onShowDetails = jest.fn();
    render(
      <RecipeNutritionQuickView
        recipe={kofta}
        compact
        onShowDetails={onShowDetails}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Nutrition details" }));
    expect(onShowDetails).toHaveBeenCalledTimes(1);
  });

  it("control: a compact view with no opener shows no details control", () => {
    render(<RecipeNutritionQuickView recipe={kofta} compact />);
    expect(screen.getByText(/^P:\d+g$/)).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});

/** The browser card whose name links to `recipeId`, once the catalog loads. */
async function findCard(recipeId: string): Promise<HTMLElement> {
  const name = await screen.findByRole(
    "link",
    { name: kofta.name },
    { timeout: 10_000 },
  );
  expect(name.getAttribute("href")).toBe(`/recipes/${recipeId}`);
  const card = name.closest<HTMLElement>(".group");
  if (!card) throw new Error("recipe card not found");
  return card;
}

describe("the recipe browser's Details", () => {
  it("opens the planner's detail modal and does not navigate", async () => {
    const onViewRecipeDetail = jest.fn<undefined, [Recipe]>();
    render(
      <RecipeBrowserPanel
        onSelectRecipe={() => undefined}
        onViewRecipeDetail={onViewRecipeDetail}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/Search recipes/), {
      target: { value: kofta.name },
    });
    const card = await findCard(KOFTA_ID);

    const details = within(card).getByRole("button", { name: "Details" });
    expect(details.hasAttribute("href")).toBe(false);
    fireEvent.click(details);

    expect(onViewRecipeDetail).toHaveBeenCalledTimes(1);
    expect(onViewRecipeDetail.mock.calls[0]?.[0]?.id).toBe(KOFTA_ID);
  });

  it("stays a link to the recipe page when the planner opens no modal", async () => {
    render(<RecipeBrowserPanel onSelectRecipe={() => undefined} />);
    fireEvent.change(screen.getByPlaceholderText(/Search recipes/), {
      target: { value: kofta.name },
    });
    const card = await findCard(KOFTA_ID);

    await waitFor(() => {
      const details = within(card).getByRole("link", { name: "Details" });
      expect(details.getAttribute("href")).toBe(`/recipes/${KOFTA_ID}`);
    });
    expect(within(card).queryByRole("button", { name: "Details" })).toBeNull();
  });
});
