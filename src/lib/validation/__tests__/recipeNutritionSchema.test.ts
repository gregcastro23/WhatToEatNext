import {
  RecipeNutritionSchema,
  toDomainRecipeNutrition,
} from "../recipeResponseSchemas";

describe("RecipeNutritionSchema and toDomainRecipeNutrition", () => {
  it("validates and parses complete nutrition data", () => {
    const raw = {
      calories: 450,
      protein: 25,
      carbs: 55,
      fat: 15,
      fiber: 8,
      sugar: 6,
      sodium: 620,
      saturatedFat: 3,
      iron: 4.2,
      vitaminC: 30,
    };

    const parsed = RecipeNutritionSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const domain = toDomainRecipeNutrition(parsed.data);
    expect(domain.calories).toBe(450);
    expect(domain.protein).toBe(25);
    expect(domain.carbs).toBe(55);
    expect(domain.fat).toBe(15);
    expect(domain.fiber).toBe(8);
    expect(domain.sugar).toBe(6);
    expect(domain.sodium).toBe(620);
    expect(domain.saturatedFat).toBe(3);
    expect(domain.iron).toBe(4.2);
    expect(domain.vitaminC).toBe(30);
  });

  it("validates minimal macro-only nutrition data", () => {
    const raw = {
      calories: 200,
      protein: 10,
      carbs: 30,
      fat: 5,
    };

    const parsed = RecipeNutritionSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const domain = toDomainRecipeNutrition(parsed.data);
    expect(domain.calories).toBe(200);
    expect(domain.protein).toBe(10);
    expect(domain.carbs).toBe(30);
    expect(domain.fat).toBe(5);
    expect("fiber" in domain).toBe(false);
    expect("sodium" in domain).toBe(false);
  });

  it("rejects non-numeric required macros", () => {
    const invalid = {
      calories: "450",
      protein: 25,
      carbs: 55,
      fat: 15,
    };

    const parsed = RecipeNutritionSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects missing required macros", () => {
    const missing = {
      calories: 450,
      protein: 25,
    };

    const parsed = RecipeNutritionSchema.safeParse(missing);
    expect(parsed.success).toBe(false);
  });

  it("tolerates passthrough fields without corrupting domain output", () => {
    const withExtra = {
      calories: 300,
      protein: 20,
      carbs: 40,
      fat: 10,
      extraUnknownField: "tolerated",
    };

    const parsed = RecipeNutritionSchema.safeParse(withExtra);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const domain = toDomainRecipeNutrition(parsed.data);
    expect(domain.calories).toBe(300);
    expect("extraUnknownField" in domain).toBe(false);
  });
});
