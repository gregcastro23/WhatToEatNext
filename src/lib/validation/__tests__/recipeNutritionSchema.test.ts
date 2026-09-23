import {
  RecipeNutritionSchema,
  toDomainRecipeNutrition,
  OPTIONAL_NUTRITION_KEYS,
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

  it("tolerates legacy rows with null optional micronutrients without dropping nutrition", () => {
    const legacyRow = {
      calories: 350,
      protein: 20,
      carbs: 45,
      fat: 10,
      fiber: null,
      sugar: null,
      sodium: 300,
    };

    const parsed = RecipeNutritionSchema.safeParse(legacyRow);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const domain = toDomainRecipeNutrition(parsed.data);
    expect(domain.calories).toBe(350);
    expect(domain.sodium).toBe(300);
    expect("fiber" in domain).toBe(false);
  });

  it("coerces string numeric optional fields from legacy data", () => {
    const stringRow = {
      calories: 300,
      protein: 15,
      carbs: 40,
      fat: 8,
      fiber: "4.5",
      sugar: "0",
    };

    const parsed = RecipeNutritionSchema.safeParse(stringRow);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const domain = toDomainRecipeNutrition(parsed.data);
    expect(domain.fiber).toBe(4.5);
    expect(domain.sugar).toBe(0);
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

  it("rejects missing required macros (including empty column default {})", () => {
    const missing = {
      calories: 450,
      protein: 25,
    };

    expect(RecipeNutritionSchema.safeParse(missing).success).toBe(false);
    expect(RecipeNutritionSchema.safeParse({}).success).toBe(false);
  });

  it("derives OPTIONAL_NUTRITION_KEYS dynamically from schema shape", () => {
    expect(OPTIONAL_NUTRITION_KEYS.length).toBeGreaterThan(30);
    expect(OPTIONAL_NUTRITION_KEYS).toContain("fiber");
    expect(OPTIONAL_NUTRITION_KEYS).toContain("iron");
    expect(OPTIONAL_NUTRITION_KEYS).not.toContain("calories");
    expect(OPTIONAL_NUTRITION_KEYS).not.toContain("protein");
    expect(OPTIONAL_NUTRITION_KEYS).not.toContain("carbs");
    expect(OPTIONAL_NUTRITION_KEYS).not.toContain("fat");
  });
});
