import { toExtendedRecipe } from "@/types/ExtendedRecipe";
import type { Recipe } from "@/types";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-1",
    name: "Test Recipe",
    ingredients: [{ name: "water", amount: 1, unit: "cup" }],
    instructions: ["Stir"],
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    ...overrides,
  };
}

describe("toExtendedRecipe", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("preserves authored ingredient extension fields", () => {
    const recipe = toExtendedRecipe(
      makeRecipe({
        ingredients: [
          {
            id: "ingredient-1",
            name: "water",
            amount: 1,
            unit: "cup",
            preparation: "warm",
            optional: true,
            notes: "filtered",
          },
        ],
      }),
    );

    expect(recipe.ingredients[0]).toEqual(
      expect.objectContaining({
        id: "ingredient-1",
        preparation: "warm",
        optional: true,
        notes: "filtered",
      }),
    );
  });

  it("adds stable per-recipe ingredient defaults", () => {
    const recipe = toExtendedRecipe(makeRecipe());

    expect(recipe.ingredients[0]).toEqual(
      expect.objectContaining({
        id: "recipe-1-ingredient-1",
        preparation: "",
        optional: false,
        notes: "",
      }),
    );
  });

  it("keeps runtime fallbacks for malformed recipe boundaries", () => {
    jest.spyOn(Date, "now").mockReturnValue(1234);
    const malformedRecipe = {
      ...makeRecipe(),
      id: undefined,
      ingredients: undefined,
    } as unknown as Recipe;

    expect(toExtendedRecipe(malformedRecipe)).toEqual(
      expect.objectContaining({
        id: "recipe-1234",
        ingredients: [],
      }),
    );
  });

  it("defaults malformed ingredient extension fields", () => {
    const malformedRecipe = makeRecipe({
      ingredients: [
        {
          name: "water",
          amount: 1,
          unit: "cup",
          id: 42,
          preparation: {},
          optional: "yes",
          notes: 42,
          category: 42,
          substitutes: ["ice", 42],
          planetaryInfluences: ["Moon", 42],
        } as unknown as Recipe["ingredients"][number],
      ],
    });

    expect(toExtendedRecipe(malformedRecipe).ingredients[0]).toEqual(
      expect.objectContaining({
        id: "recipe-1-ingredient-1",
        preparation: "",
        optional: false,
        notes: "",
        category: undefined,
        substitutes: undefined,
        planetaryInfluences: undefined,
      }),
    );
  });
});
