import { extractRecipesFromCuisine } from "@/utils/recipe/batchEnrichment";

describe("batch enrichment cuisine boundary", () => {
  it("returns no recipes for a non-object cuisine payload", () => {
    expect(extractRecipesFromCuisine(null)).toEqual([]);
    expect(extractRecipesFromCuisine("italian")).toEqual([]);
  });

  it("normalizes nested dish arrays with cuisine and meal defaults", () => {
    const recipes = extractRecipesFromCuisine({
      name: "Test Cuisine",
      dishes: {
        dinner: {
          all: [
            {
              id: "dish-1",
              name: "Boundary Stew",
              ingredients: [{ name: "water", amount: 1, unit: "cup" }],
            },
          ],
        },
      },
    });

    expect(recipes[0]).toEqual(
      expect.objectContaining({
        id: "dish-1",
        cuisine: "Test Cuisine",
        mealType: ["dinner"],
      }),
    );
  });

  it("skips malformed recipes without discarding valid siblings", () => {
    const recipes = extractRecipesFromCuisine({
      id: "fallback-cuisine",
      recipes: [
        { id: "invalid", ingredients: [{ name: "salt" }] },
        { id: "valid", name: "Valid Dish", ingredients: [] },
      ],
    });

    expect(recipes).toHaveLength(1);
    expect(recipes[0]?.cuisine).toBe("fallback-cuisine");
  });
});
