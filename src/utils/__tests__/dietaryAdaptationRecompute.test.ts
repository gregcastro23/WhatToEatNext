import {
  adaptRecipe,
  recomputeAdaptedInstructions,
  recomputeSavedVersionReadings,
  resolveAdaptedRecipeState,
} from "@/utils/dietaryAdaptation";
import type { Recipe } from "@/types/recipe";

describe("recomputeAdaptedInstructions", () => {
  it("replaces original spans once, without rewriting flax egg or gluten-free flour", () => {
    const swaps = [
      { index: 0, from: { name: "eggs", amount: 2, unit: "unit" }, to: { name: "flax egg (1 tbsp flax per egg)", amount: 2, unit: "unit" }, reason: "vegan" },
      { index: 1, from: { name: "all-purpose flour", amount: 100, unit: "g" }, to: { name: "gluten-free flour blend", amount: 100, unit: "g" }, reason: "gluten-free" },
    ];
    expect(recomputeAdaptedInstructions(["Whisk eggs into all-purpose flour."], swaps).adaptedInstructions)
      .toEqual(["Whisk flax egg into gluten-free flour blend."]);
  });

  it("does not reduce a compound ingredient to an unrelated standalone ingredient", () => {
    const swaps = [{ index: 0, from: { name: "rice noodles", amount: 100, unit: "g" }, to: { name: "gluten-free pasta", amount: 100, unit: "g" }, reason: "swap" }];
    expect(recomputeAdaptedInstructions(["Mix the rice and rice noodles."], swaps).adaptedInstructions)
      .toEqual(["Mix the rice and gluten-free pasta."]);
  });
  it("replaces swapped ingredients inline while preserving casing and context", () => {
    const instructions = [
      "Slice the chicken breast into thin strips.",
      "In a hot pan with olive oil, sauté chicken until golden brown.",
      "Season with salt and pepper, then serve.",
    ];
    const swaps = [
      {
        index: 0,
        from: { name: "chicken breast", amount: 250, unit: "g" },
        to: { name: "firm tofu", amount: 250, unit: "g" },
        reason: "mild plant protein swap",
      },
    ];

    const result = recomputeAdaptedInstructions(instructions, swaps);

    expect(result.adaptedInstructions).toEqual([
      "Slice the firm tofu into thin strips.",
      "In a hot pan with olive oil, sauté firm tofu until golden brown.",
      "Season with salt and pepper, then serve.",
    ]);
    expect(result.instructionEdits).toHaveLength(2);
    expect(result.instructionEdits[0]?.swappedTerms).toEqual([
      { from: "chicken breast", to: "firm tofu" },
    ]);
  });

  it("does not replace protected compound plant phrases (e.g., chicken of the woods, butternut squash)", () => {
    const instructions = [
      "Prepare the chicken of the woods mushrooms.",
      "Roast the butternut squash with olive oil.",
      "Serve alongside the seared chicken.",
    ];
    const swaps = [
      {
        index: 2,
        from: { name: "chicken", amount: 200, unit: "g" },
        to: { name: "firm tofu", amount: 200, unit: "g" },
        reason: "plant protein",
      },
    ];

    const result = recomputeAdaptedInstructions(instructions, swaps);

    expect(result.adaptedInstructions[0]).toBe("Prepare the chicken of the woods mushrooms.");
    expect(result.adaptedInstructions[1]).toBe("Roast the butternut squash with olive oil.");
    expect(result.adaptedInstructions[2]).toBe("Serve alongside the seared firm tofu.");
    expect(result.instructionEdits).toHaveLength(1);
    expect(result.instructionEdits[0]?.index).toBe(2);
  });
});

describe("recomputeSavedVersionReadings", () => {
  it("keeps partial elemental and fabricated alchemical readings unavailable", () => {
    const readings = recomputeSavedVersionReadings({
      ingredients: [{ name: "firm tofu", amount: 200, unit: "g" }, { name: "zzunmappedzz", amount: 200, unit: "g" }],
      numberOfServings: 2,
    });
    expect(readings.elementalProperties).toBeNull();
    expect(readings.alchemicalSummary).toBeNull();
    expect(readings.isComplete).toBe(false);
  });

  it.each([undefined, 0, 0.5, -1, NaN, Infinity])("does not invent per-serving nutrition for servings %s", (numberOfServings) => {
    const readings = recomputeSavedVersionReadings({
      ingredients: [{ name: "firm tofu", amount: 200, unit: "g" }],
      ...(numberOfServings !== undefined ? { numberOfServings } : {}),
    });
    expect(readings.nutritionPerServing).toBeNull();
    expect(readings.isComplete).toBe(false);
  });

  it.each([0, -1, NaN, Infinity])("does not invent quantities for amount %s", (amount) => {
    expect(recomputeSavedVersionReadings({ ingredients: [{ name: "firm tofu", amount, unit: "g" }], numberOfServings: 2 }).nutritionPerServing).toBeNull();
  });
  it("computes elemental properties and nutrition per serving from adapted ingredients", () => {
    const ingredients = [
      { name: "firm tofu", amount: 200, unit: "g" },
      { name: "extra virgin olive oil", amount: 15, unit: "ml" },
      { name: "garlic", amount: 5, unit: "g" },
    ];
    const readings = recomputeSavedVersionReadings({
      ingredients,
      numberOfServings: 2,
    });

    expect(readings.elementalProperties).not.toBeNull();
    if (readings.elementalProperties) {
      const sum =
        readings.elementalProperties.Fire +
        readings.elementalProperties.Water +
        readings.elementalProperties.Earth +
        readings.elementalProperties.Air;
      expect(sum).toBeCloseTo(1.0, 2);
    }
    expect(readings.alchemicalSummary).toBeNull();
    expect(readings.nutritionPerServing).not.toBeNull();
    if (readings.nutritionPerServing) {
      expect(readings.nutritionPerServing.calories).toBeGreaterThan(0);
      expect(readings.nutritionPerServing.protein).toBeGreaterThan(0);
    }
    expect(readings.isComplete).toBe(true);
  });
});

describe("adaptRecipe with end-to-end recomputation", () => {
  const chickenSkillet: Recipe = {
    id: "recipe-chicken-skillet",
    name: "Classic Chicken Skillet",
    cuisine: "Mediterranean",
    numberOfServings: 2,
    ingredients: [
      { name: "chicken breast", amount: 250, unit: "g" },
      { name: "extra virgin olive oil", amount: 15, unit: "ml" },
      { name: "fresh garlic", amount: 6, unit: "g" },
    ],
    instructions: [
      "Cut the chicken breast into bite-sized cubes.",
      "Heat olive oil and garlic in a skillet.",
      "Add chicken breast cubes and cook until internal temperature is 165°F.",
    ],
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.25, Air: 0.15 },
    nutrition: {
      calories: 320,
      protein: 38,
      carbs: 2,
      fat: 18,
      fiber: 0.5,
    },
  };

  it("recomputes instructions, elemental properties, and nutrition", () => {
    const adapted = adaptRecipe(chickenSkillet, "vegetarian");

    expect(adapted.swaps).toHaveLength(1);
    expect(adapted.swaps[0]?.to.name).toBe("firm tofu");
    expect(adapted.adaptedInstructions[0]).toContain("firm tofu");
    expect(adapted.adaptedInstructions[2]).toContain("firm tofu");
    expect(adapted.instructionEdits).toHaveLength(2);

    expect(adapted.recomputedElemental).not.toBeNull();
    expect(adapted.recomputedNutrition).not.toBeNull();
    expect(adapted.readingsComplete).toBe(true);
  });

  it("resolveAdaptedRecipeState surfaces recomputed state and allows suppressing original reading banner", () => {
    const adapted = adaptRecipe(chickenSkillet, "vegetarian");
    const state = resolveAdaptedRecipeState(chickenSkillet, adapted);

    expect(state.hasSwaps).toBe(true);
    expect(state.elementalRecomputed).toBe(true);
    expect(state.nutritionRecomputed).toBe(true);
    expect(state.instructionsRecomputed).toBe(true);
    expect(state.activeInstructions[0]).toContain("firm tofu");
    expect(state.activeElementalProperties).toEqual(adapted.recomputedElemental);
    expect(state.activeNutrition?.calories).toBe(
      Math.round(adapted.recomputedNutrition?.calories ?? 0),
    );
  });

  it("does not carry original nutrients or shopping identity into a replacement", () => {
    const recipe = {
      ...chickenSkillet,
      ingredients: chickenSkillet.ingredients.map((ingredient) => ({ ...ingredient, asin: "original-product", id: "original-id" })),
      nutrition: { ...chickenSkillet.nutrition, sodium: 900, sugar: 50, vitamins: ["B12"], minerals: ["iron"] },
    };
    const adapted = adaptRecipe(recipe, "vegetarian");
    adapted.recomputedNutrition = { calories: 100, protein: 10, carbs: 5, fat: 5, fiber: 1 };
    const state = resolveAdaptedRecipeState(recipe, adapted);
    expect(state.activeNutrition).toEqual(expect.objectContaining({ sodium: undefined, sugar: undefined, vitamins: undefined, minerals: undefined }));
    expect(adapted.swaps[0]?.to).not.toHaveProperty("asin");
    expect(adapted.swaps[0]?.to).not.toHaveProperty("id");
  });
});
