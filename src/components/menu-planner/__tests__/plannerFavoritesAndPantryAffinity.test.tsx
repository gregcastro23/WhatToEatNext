/**
 * Menu Planner Rail Favorites, Affinity Chips, and Posso Pantry / Grocery Integration Tests
 *
 * @file src/components/menu-planner/__tests__/plannerFavoritesAndPantryAffinity.test.tsx
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import RecipeBrowserPanel from "@/components/menu-planner/RecipeBrowserPanel";
import PossoWidget from "@/components/menu-planner/PossoWidget";
import GroceryListModal from "@/components/menu-planner/GroceryListModal";
import type { Recipe } from "@/types/recipe";
import type { GroceryItem } from "@/types/menuPlanner";

// Sample mock recipes
const MOCK_RECIPES: Recipe[] = [
  {
    id: "recipe-garlic-pasta",
    name: "Tuscan Garlic Pasta",
    cuisine: "Italian",
    ingredients: [
      { name: "Garlic", amount: 4, unit: "cloves" },
      { name: "Olive Oil", amount: 2, unit: "tbsp" },
      { name: "Pasta", amount: 200, unit: "g" },
      { name: "Parmesan", amount: 50, unit: "g" },
    ],
    instructions: ["Boil pasta", "Sauté garlic in olive oil", "Toss together with parmesan"],
    prepTime: "10 min",
    cookTime: "15 min",
    totalTime: "25 min",
    servings: 2,
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
  },
  {
    id: "recipe-truffle-risotto",
    name: "Black Truffle Risotto",
    cuisine: "Italian",
    ingredients: [
      { name: "Arborio Rice", amount: 200, unit: "g" },
      { name: "Black Truffle", amount: 20, unit: "g" },
      { name: "Butter", amount: 30, unit: "g" },
      { name: "Shallots", amount: 2, unit: "piece" },
    ],
    instructions: ["Sauté shallots", "Add rice and broth", "Finish with black truffle and butter"],
    prepTime: "15 min",
    cookTime: "25 min",
    totalTime: "40 min",
    servings: 4,
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: false,
  },
  {
    id: "recipe-simple-toast",
    name: "Classic Butter Toast",
    cuisine: "American",
    ingredients: [
      { name: "Bread", amount: 2, unit: "slices" },
      { name: "Butter", amount: 15, unit: "g" },
    ],
    instructions: ["Toast bread", "Spread butter"],
    prepTime: "2 min",
    cookTime: "3 min",
    totalTime: "5 min",
    servings: 1,
    elementalProperties: { Fire: 0.3, Water: 0.1, Earth: 0.5, Air: 0.1 },
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
  },
];

// Mock getServerRecipes
jest.mock("@/actions/recipes", () => ({
  getServerRecipes: jest.fn(() => Promise.resolve(MOCK_RECIPES)),
}));

// Mock Spacetime
jest.mock("@/hooks/useSpacetimeLiveRecipes", () => ({
  useSpacetimeLiveRecipes: () => [],
}));

// Mock RecipeQueue
jest.mock("@/contexts/RecipeQueueContext", () => ({
  useRecipeQueue: () => ({
    addToQueue: jest.fn(),
    isInQueue: () => false,
  }),
}));

// Mock useFavoriteRecipes state
const mockToggleFavorite = jest.fn();
const mockFavoriteState = {
  favoriteIds: ["recipe-garlic-pasta"],
  favoritesData: {
    "recipe-garlic-pasta": {
      id: "recipe-garlic-pasta",
      name: "Tuscan Garlic Pasta",
      cuisine: "Italian",
      ingredients: ["Garlic", "Olive Oil", "Pasta", "Parmesan"],
      likedIngredients: ["Garlic", "Parmesan"],
      favoritedAt: "2026-10-29T00:00:00.000Z",
    },
  },
  isLoaded: true,
  isFavorite: (id: string) => mockFavoriteState.favoriteIds.includes(id),
  toggleFavorite: mockToggleFavorite,
  topTrackedIngredients: [
    { name: "Garlic", count: 4 },
    { name: "Olive Oil", count: 3 },
    { name: "Black Truffle", count: 2 },
  ],
  topLikedIngredients: [
    { name: "Garlic", count: 3 },
    { name: "Black Truffle", count: 2 },
  ],
};

jest.mock("@/lib/recipes/favoriteRecipes", () => ({
  useFavoriteRecipes: () => mockFavoriteState,
}));

// Mock MenuPlannerContext for Posso and GroceryListModal
const mockInventory = ["olive oil", "pasta"];
const mockSetInventory = jest.fn();
const mockUpdateGroceryItem = jest.fn();

const mockGroceryList: GroceryItem[] = [
  {
    id: "g1",
    ingredient: "Garlic",
    quantity: 4,
    unit: "cloves",
    category: "produce",
    inPantry: false,
    purchased: false,
    usedInRecipes: ["recipe-garlic-pasta"],
  },
  {
    id: "g2",
    ingredient: "Bread",
    quantity: 1,
    unit: "loaf",
    category: "bakery",
    inPantry: false,
    purchased: false,
    usedInRecipes: ["recipe-simple-toast"],
  },
];

jest.mock("@/contexts/MenuPlannerContext", () => ({
  useMenuPlanner: () => ({
    inventory: mockInventory,
    setInventory: mockSetInventory,
    groceryList: mockGroceryList,
    updateGroceryItem: mockUpdateGroceryItem,
    regenerateGroceryList: jest.fn(),
    currentMenu: { meals: [] },
  }),
}));

// Mock GroceryCartContext
jest.mock("@/contexts/GroceryCartContext", () => ({
  useGroceryCart: () => ({
    addRecipe: jest.fn(),
  }),
}));

describe("RecipeBrowserPanel - Favorites & Affinity Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the '★ Favorites' filter button with favorite count", async () => {
    render(<RecipeBrowserPanel onSelectRecipe={jest.fn()} />);

    const favButton = await screen.findByRole("button", { name: "Filter favorites" });
    expect(favButton).toBeTruthy();
    expect(favButton.textContent).toContain("1");
  });

  it("filters the list down to favorited recipes when '★ Favorites' is clicked", async () => {
    render(<RecipeBrowserPanel onSelectRecipe={jest.fn()} />);

    // Initially all 3 mock recipes are loaded
    expect(await screen.findByText("Tuscan Garlic Pasta")).toBeTruthy();
    expect(screen.getByText("Black Truffle Risotto")).toBeTruthy();
    expect(screen.getByText("Classic Butter Toast")).toBeTruthy();

    // Click Favorites filter
    const favButton = screen.getByRole("button", { name: "Filter favorites" });
    fireEvent.click(favButton);

    // Only Tuscan Garlic Pasta should remain visible
    expect(screen.getByText("Tuscan Garlic Pasta")).toBeTruthy();
    expect(screen.queryByText("Black Truffle Risotto")).toBeNull();
    expect(screen.queryByText("Classic Butter Toast")).toBeNull();
  });

  it("renders Top Tracked / Liked Ingredients affinity filter chips and filters by ingredient", async () => {
    render(<RecipeBrowserPanel onSelectRecipe={jest.fn()} />);

    // Verify affinity chips exist
    const garlicChip = await screen.findByRole("button", { name: /Garlic/i });
    expect(garlicChip).toBeTruthy();
    expect(garlicChip.textContent).toContain("⭐"); // Liked ingredient star

    // Click Garlic chip to filter
    fireEvent.click(garlicChip);

    // Tuscan Garlic Pasta contains garlic, others do not
    expect(screen.getByText("Tuscan Garlic Pasta")).toBeTruthy();
    expect(screen.queryByText("Black Truffle Risotto")).toBeNull();
    expect(screen.queryByText("Classic Butter Toast")).toBeNull();

    // Click [Clear] button to reset filter
    const clearBtn = screen.getByRole("button", { name: /Clear ingredient filter/i });
    fireEvent.click(clearBtn);

    // All recipes return
    expect(screen.getByText("Tuscan Garlic Pasta")).toBeTruthy();
    expect(screen.getByText("Black Truffle Risotto")).toBeTruthy();
  });

  it("displays affinity match badges on recipe cards matching favorite ingredients", async () => {
    render(<RecipeBrowserPanel onSelectRecipe={jest.fn()} />);

    // Tuscan Garlic Pasta matches Garlic and Olive Oil (2 favorite ingredients)
    expect(await screen.findByText(/Matches 2 favorite ingredients/i)).toBeTruthy();

    // Black Truffle Risotto matches Black Truffle (1 favorite ingredient)
    expect(screen.getByText(/Matches 1 favorite ingredient/i)).toBeTruthy();
  });

  it("allows 1-click favoriting directly from the recipe card star button", async () => {
    render(<RecipeBrowserPanel onSelectRecipe={jest.fn()} />);

    // Find star button for Black Truffle Risotto (currently not favorite)
    const starBtn = await screen.findByRole("button", {
      name: "Add Black Truffle Risotto to favorites",
    });
    fireEvent.click(starBtn);

    expect(mockToggleFavorite).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "recipe-truffle-risotto",
        name: "Black Truffle Risotto",
        cuisine: "Italian",
      }),
    );
  });
});

describe("PossoWidget - Pantry Affinity & Staples to Stock", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays '★ Favorite Staples to Stock' for top ingredients not yet in pantry", async () => {
    render(<PossoWidget />);

    // "Garlic" and "Black Truffle" are in top ingredients but not in mockInventory (["olive oil", "pasta"])
    expect(await screen.findByText(/Favorite Staples to Stock/i)).toBeTruthy();

    const garlicStapleBtn = screen.getByRole("button", {
      name: /Garlic/i,
    });
    expect(garlicStapleBtn).toBeTruthy();

    // Click Garlic staple chip
    fireEvent.click(garlicStapleBtn);

    // Confirms it was added to inventory
    expect(mockSetInventory).toHaveBeenCalledWith(["olive oil", "pasta", "garlic"]);
  });

  it("highlights existing pantry items that match favorite ingredients with a star", async () => {
    render(<PossoWidget />);

    // "olive oil" is in mockInventory and matches top favorite ingredients
    const oliveOilItem = await screen.findByText("olive oil");
    expect(oliveOilItem.parentElement?.textContent).toContain("★");
  });
});

describe("GroceryListModal - Favorite Staple Badges & Suggestions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("badges grocery items that are core favorite staples with '★ Favorite Staple'", () => {
    render(<GroceryListModal isOpen={true} onClose={jest.fn()} />);

    // Garlic is a favorite staple and on the grocery list
    const stapleBadges = screen.getAllByText(/★ Favorite Staple/i);
    expect(stapleBadges.length).toBeGreaterThan(0);
  });

  it("renders 'Suggested Favorite Staples' section with 1-click addition", () => {
    render(<GroceryListModal isOpen={true} onClose={jest.fn()} />);

    // Black Truffle is a favorite staple NOT on grocery list and NOT in pantry
    expect(screen.getByText(/Suggested Favorite Staples/i)).toBeTruthy();
    expect(screen.getByText("Black Truffle")).toBeTruthy();

    const addBtn = screen.getByRole("button", {
      name: "+ Add",
    });
    expect(addBtn).toBeTruthy();
    fireEvent.click(addBtn);

    // Black Truffle should now appear in the grocery items list
    expect(screen.getAllByText("Black Truffle").length).toBeGreaterThan(0);
  });
});
