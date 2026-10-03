/**
 * No display shows a vitamin or mineral as an amount. They render as labelled
 * % Daily Value, "≥" where not every ingredient lists them; label rows the
 * recipe does not publish read "—", not 0 (owner rulings 2026-09-27).
 *
 * Real catalog row: Authentic Kofta Kebab, a computed recipe. Its vitamin B12
 * is a DV fraction (lamb and yogurt list it, 2 of the 10 ingredients in its
 * total). The nutrition modal showed it as "1mcg 59%".
 *
 * Imports only modules that exist on master, so the red proof is behavioural.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { getServerRecipes } from "@/actions/recipes";
import RecipeDetailModal from "@/components/menu-planner/RecipeDetailModal";
import { RecipeNutritionModal } from "@/components/nutrition/RecipeNutritionModal";
import { RecipeNutritionQuickView } from "@/components/nutrition/RecipeNutritionQuickView";
import type { Recipe } from "@/types/recipe";

jest.mock("@/contexts/MenuPlannerContext", () => ({
  useMenuPlanner: () => ({ inventory: [] }),
}));
jest.mock("@/hooks/useRecipeCollections", () => ({
  useRecipeCollections: () => ({
    isFavorite: () => false,
    toggleFavorite: () => undefined,
    getRecipeNote: () => "",
    setRecipeNote: () => undefined,
    getRecipeRating: () => 0,
    setRecipeRating: () => undefined,
    markViewed: () => undefined,
  }),
}));
jest.mock("@/components/RestaurantDiscovery", () => ({ RestaurantDiscovery: () => null }));

let kofta: Recipe;
let sauce: Recipe;
beforeAll(async () => {
  const catalog = await getServerRecipes();
  const found = catalog.find((r) => r.id === "middleeastern-lunch-all-authentic-kofta-kebab");
  const complete = catalog.find((r) => r.id === "hsca-lunch-all-butter-poppyseed-sauce");
  if (!found || !complete) throw new Error("a fixture recipe is not in the catalog");
  kofta = found;
  sauce = complete;
});

/** The label row that starts with `label`, as one string. */
function row(label: string): string {
  const el = screen.getAllByText(new RegExp(`^${label}`))[0];
  return el?.closest("div")?.textContent ?? "";
}

describe("the recipe nutrition modal", () => {
  beforeEach(() => {
    render(<RecipeNutritionModal recipe={kofta} isOpen onClose={() => undefined} ingredientMapping={{}} />);
  });

  it("shows vitamins as labelled %DV, a lower bound where not every ingredient lists them", () => {
    expect(document.body.textContent).not.toMatch(/\dmcg/);
    expect(row("Vitamin B12")).toMatch(/^Vitamin B12≥\d+%$/);
    expect(screen.getByText(/mixes the pre-2016 and 2016 Daily Value tables/)).toBeTruthy();
  });

  it("shows what the recipe publishes, and — for what it does not", () => {
    // Sugar, sodium and saturated fat publish only when every ingredient states them (2026-09-29).
    expect(kofta.nutrition?.sugar).toBeUndefined();
    expect(row("Total Sugars")).toBe("Total Sugars —");
    expect(row("Sodium")).toBe("Sodium —");
    expect(row("Saturated Fat")).toBe("Saturated Fat —");
    expect(row("Cholesterol")).toBe("Cholesterol —");
    expect(row("Trans Fat")).toBe("Trans Fat —");
    expect(row("Potassium")).toBe("Potassium —");
  });
});

describe("a recipe whose every ingredient states sugar and sodium", () => {
  it("shows both, as amounts", () => {
    // Butter and poppy seeds: 142 mg sodium a serving.
    render(<RecipeNutritionModal recipe={sauce} isOpen onClose={() => undefined} ingredientMapping={{}} />);
    const { sugar, sodium } = sauce.nutrition ?? {};
    expect(row("Sodium")).toMatch(new RegExp(`^Sodium ${Math.round(sodium ?? NaN)}mg`));
    expect(row("Total Sugars")).toMatch(new RegExp(`^Total Sugars ${Math.round(sugar ?? NaN)}g`));
  });
});

describe("the quick view's good-source badges", () => {
  it("fire on 10% of the Daily Value in the portion, and name that basis", () => {
    render(<RecipeNutritionQuickView recipe={kofta} servings={2} />);
    // Iron: the ingredients list ≥28% DV a serving. The badge compared that fraction with 2 mg.
    expect(screen.getByTitle(/^Good source of Iron: ≥\d+% of the Daily Value/)).toBeTruthy();
    // Control: vitamin C is under 10% DV even for 2 servings, so no badge.
    expect(screen.queryByText(/Vit C/)).toBeNull();
  });
});

describe("the recipe detail modal's nutrition tab", () => {
  it("shows %DV chips, and no sodium where the recipe publishes none", () => {
    render(<RecipeDetailModal recipe={kofta} isOpen onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Nutrition" }));
    expect(screen.getByText(/^Vitamin B12: /).textContent).toMatch(/^Vitamin B12: ≥\d+% DV$/);
    expect(screen.queryByText(/^Sodium: /)).toBeNull();
  });

  it("shows sodium with its unit where the recipe publishes it", () => {
    render(<RecipeDetailModal recipe={sauce} isOpen onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Nutrition" }));
    expect(screen.getByText(/^Sodium: /).textContent).toMatch(/^Sodium: \d+ mg$/);
  });
});
