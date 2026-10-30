/**
 * @jest-environment jsdom
 *
 * The recipe dossier carousel: pantry matches marked "In Pantry", one-click
 * grocery-cart dispatch, save, navigation, the expandable ingredient list, and
 * the loading and empty states.
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { isRecommendedMeal } from "@/lib/recipe-builder/generateRecommendations";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";
import RecipeSuggestionCarousel from "../RecipeSuggestionCarousel";

const mockPantry = new Set(["garlic"]);
const mockCart = { addRecipe: jest.fn(() => 3), open: jest.fn() };
let mockCartMounted = true;
const mockSaveRecipe = jest.fn();

jest.mock("@/hooks/usePantry", () => ({
  usePantry: () => ({ hasItem: (name: string) => mockPantry.has(name.toLowerCase()) }),
}));
jest.mock("@/contexts/GroceryCartContext", () => ({
  useOptionalGroceryCart: () => (mockCartMounted ? mockCart : null),
}));
jest.mock("@/utils/generatedRecipeStore", () => ({
  saveRecipeToStore: (recipe: unknown) => mockSaveRecipe(recipe),
}));

/** Fixtures pass the same guard the API response does, so they need no cast. */
function meals(...raw: unknown[]): RecommendedMeal[] {
  const valid = raw.filter(isRecommendedMeal);
  expect(valid).toHaveLength(raw.length);
  return valid;
}

const SOUP = {
  mealType: "dinner",
  score: 0.82,
  reasons: ["Venus favours garlic"],
  dayAlignment: 0.7,
  planetaryAlignment: 0.6,
  recipe: {
    id: "garlic-soup",
    name: "Garlic Soup",
    cuisine: "French",
    numberOfServings: 4,
    elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
    alchemicalProperties: { monicaConstant: 1.234 },
    ingredients: [
      { name: "Garlic", amount: 6, unit: "cloves" },
      { name: "Tomato", amount: "2", unit: "whole" },
      { name: "Thyme", amount: 1, unit: "sprig" },
    ],
    instructions: ["Roast the garlic.", "Simmer."],
  },
};

const SALAD = {
  ...SOUP,
  score: 0.5,
  recipe: { ...SOUP.recipe, id: "salad", name: "Tomato Salad", alchemicalProperties: { monicaConstant: null } },
};

interface Rendered {
  onIndexChange: jest.Mock;
  onSaveToQueue: jest.Mock;
}

function renderCarousel(suggestions: RecommendedMeal[], currentIndex = 0): Rendered {
  const onIndexChange = jest.fn();
  const onSaveToQueue = jest.fn();
  render(
    <RecipeSuggestionCarousel
      suggestions={suggestions}
      currentIndex={currentIndex}
      onIndexChange={onIndexChange}
      onSaveToQueue={onSaveToQueue}
      isLoading={false}
    />,
  );
  return { onIndexChange, onSaveToQueue };
}

function ingredientItem(name: string): HTMLElement {
  const item = screen.getByText(new RegExp(`\\b${name}$`)).closest("li");
  if (!item) throw new Error(`no list item for ${name}`);
  return item;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCartMounted = true;
});

describe("RecipeSuggestionCarousel", () => {
  it("shows the current dossier with its match score and position", () => {
    renderCarousel(meals(SOUP, SALAD));

    expect(screen.getByRole("article", { name: "Garlic Soup" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "82% match" })).toBeInTheDocument();
    expect(screen.getByText("Alchemical Synthesis 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("1.23")).toBeInTheDocument();
  });

  it("marks ingredients the pantry already holds as In Pantry", () => {
    renderCarousel(meals(SOUP));

    expect(within(ingredientItem("Garlic")).getByText("In Pantry")).toBeInTheDocument();
    expect(within(ingredientItem("Tomato")).queryByText("In Pantry")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingredients (3) · 1 in pantry" })).toBeInTheDocument();
  });

  it("sends the recipe to the grocery cart and opens the drawer", () => {
    renderCarousel(meals(SOUP));

    fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(mockCart.addRecipe).toHaveBeenCalledWith(
      {
        id: "garlic-soup",
        name: "Garlic Soup",
        baseServings: 4,
        ingredients: [
          { name: "Garlic", amount: 6, unit: "cloves" },
          { name: "Tomato", amount: 2, unit: "whole" },
          { name: "Thyme", amount: 1, unit: "sprig" },
        ],
      },
      4,
    );
    expect(mockCart.open).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Added 3 ingredients to grocery cart");
  });

  it("offers no cart button without the cart provider", () => {
    mockCartMounted = false;
    renderCarousel(meals(SOUP));
    expect(screen.queryByRole("button", { name: "Add to Cart" })).not.toBeInTheDocument();
  });

  it("saves the recipe and reports it to the page", () => {
    const { onSaveToQueue } = renderCarousel(meals(SOUP));

    fireEvent.click(screen.getByRole("button", { name: "Save Recipe" }));

    expect(mockSaveRecipe).toHaveBeenCalledWith(expect.objectContaining({ id: "garlic-soup" }));
    expect(onSaveToQueue).toHaveBeenCalledWith(expect.objectContaining({ score: 0.82 }));
    expect(screen.getByRole("button", { name: "Recipe Saved" })).toBeInTheDocument();
  });

  it("navigates by arrow and by pagination dot", () => {
    const { onIndexChange } = renderCarousel(meals(SOUP, SALAD));

    expect(screen.getByRole("button", { name: "Previous recipe" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Go to recipe 1" })).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: "Next recipe" }));
    fireEvent.click(screen.getByRole("button", { name: "Go to recipe 2" }));
    expect(onIndexChange.mock.calls).toEqual([[1], [1]]);
  });

  it("previews eight ingredients and expands to the rest", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ name: `Herb ${i + 1}`, amount: 1, unit: "g" }));
    renderCarousel(meals({ ...SOUP, recipe: { ...SOUP.recipe, ingredients: many } }));

    const toggle = screen.getByRole("button", { name: "Ingredients (10)" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Herb 9$/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "+2 more" }));

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Herb 10$/)).toBeInTheDocument();
  });

  it("shows a status while loading and a plain empty state with no results", () => {
    const { unmount } = render(
      <RecipeSuggestionCarousel suggestions={[]} currentIndex={0} onIndexChange={jest.fn()} isLoading />,
    );
    expect(screen.getByRole("status", { name: "Synthesizing recipes" })).toBeInTheDocument();
    unmount();

    renderCarousel([]);
    expect(screen.getByText("No recipes synthesized yet")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("\\u");
  });
});
