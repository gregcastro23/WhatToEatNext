/**
 * @jest-environment node
 */

const mockGetServerRecipes = jest.fn();

jest.mock("@/actions/recipes", () => ({
  getServerRecipes: () => mockGetServerRecipes(),
}));

jest.mock("@/utils/recipeAlchemicalQuantities", () => ({
  calculateRecipeAlchemicalQuantities: jest.fn((names: string[]) => ({
    totalSpirit: names.length,
    totalEssence: names.length,
    totalMatter: names.length,
    totalSubstance: names.length,
    totalASharp: names.length * 4,
    matchRate: 1,
    perIngredient: [],
  })),
}));

jest.mock("@/utils/logger", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import {
  extractIngredientName,
  UnifiedRecipeService,
} from "../UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-1",
    name: "Roasted Garlic Pasta",
    description: "Savory weeknight pasta",
    cuisine: "Italian",
    ingredients: [
      { name: "garlic", amount: 3, unit: "cloves" },
      { name: "olive oil", amount: 2, unit: "tbsp" },
    ],
    instructions: ["Boil pasta", "Toss with garlic oil"],
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    ...overrides,
  };
}

describe("UnifiedRecipeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("extracts ingredient names from strings and structured objects safely", () => {
    expect(extractIngredientName("garlic")).toBe("garlic");
    expect(extractIngredientName({ name: "basil", amount: 1 })).toBe("basil");
    expect(extractIngredientName({ name: 123 })).toBe("");
    expect(extractIngredientName({})).toBe("");
    expect(extractIngredientName(null)).toBe("");
    expect(extractIngredientName(42)).toBe("");
  });

  it("enriches recipe alchemical quantities from ingredient names", () => {
    const service = UnifiedRecipeService.getInstance();
    const enriched = service.enrichRecipeWithIngredientAlchemicals(makeRecipe());

    expect(enriched.ingredientAlchemicalSummary).toBeDefined();
    expect(enriched.ingredientAlchemicalSummary?.totalASharp).toBe(8);
  });

  it("searches recipes across ingredient names without unsafe calls", async () => {
    mockGetServerRecipes.mockResolvedValue([
      makeRecipe(),
      makeRecipe({
        id: "recipe-2",
        name: "Miso Soup",
        cuisine: "Japanese",
        ingredients: [{ name: "white miso", amount: 2, unit: "tbsp" }],
      }),
    ]);

    const service = UnifiedRecipeService.getInstance();
    const matches = await service.searchRecipes("miso");

    expect(matches.map((r) => r.id)).toEqual(["recipe-2"]);
  });
});
