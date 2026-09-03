import {
  applyNutritionFilters,
  sortByNutrition,
  type NutritionFilterValues,
} from "@/components/nutrition/NutritionFilters";

describe("NutritionFilters characterisation", () => {
  const sampleRecipes = [
    {
      id: "r1",
      title: "High Protein Salad",
      nutrition: {
        calories: 350,
        protein: 28,
        carbs: 15,
        fat: 10,
        macronutrients: {
          protein: 28,
          carbs: 15,
          fat: 10,
          fiber: 8,
        },
      },
    },
    {
      id: "r2",
      title: "Low Calorie Soup",
      nutrition: {
        calories: 120,
        protein: 8,
        carbs: 18,
        fat: 2,
        macronutrients: {
          protein: 8,
          carbs: 18,
          fat: 2,
          fiber: 6,
        },
      },
    },
    {
      id: "r3",
      title: "Rich Pasta",
      nutrition: {
        calories: 650,
        protein: 18,
        carbs: 85,
        fat: 25,
        macronutrients: {
          protein: 18,
          carbs: 85,
          fat: 25,
          fiber: 3,
        },
      },
    },
    {
      id: "r4",
      title: "Mystery Bowl (No Nutrition)",
    },
  ];

  describe("applyNutritionFilters", () => {
    it("returns all recipes when filters are empty", () => {
      const result = applyNutritionFilters(sampleRecipes, {});
      expect(result).toHaveLength(4);
    });

    it("excludes recipes without nutrition when any filter is active", () => {
      const filters: NutritionFilterValues = { highProtein: true };
      const result = applyNutritionFilters(sampleRecipes, filters);
      expect(result.some((r) => r.id === "r4")).toBe(false);
    });

    it("filters by calorieRange correctly", () => {
      const filters: NutritionFilterValues = { calorieRange: [100, 400] };
      const result = applyNutritionFilters(sampleRecipes, filters);
      const ids = result.map((r) => r.id);
      expect(ids).toEqual(["r1", "r2"]);
    });

    it("filters by minProtein correctly", () => {
      const filters: NutritionFilterValues = { minProtein: 20 };
      const result = applyNutritionFilters(sampleRecipes, filters);
      expect(result.map((r) => r.id)).toEqual(["r1"]);
    });

    it("filters by maxCarbs correctly", () => {
      const filters: NutritionFilterValues = { maxCarbs: 20 };
      const result = applyNutritionFilters(sampleRecipes, filters);
      expect(result.map((r) => r.id)).toEqual(["r1", "r2"]);
    });

    it("filters by maxFat correctly", () => {
      const filters: NutritionFilterValues = { maxFat: 5 };
      const result = applyNutritionFilters(sampleRecipes, filters);
      expect(result.map((r) => r.id)).toEqual(["r2"]);
    });

    it("applies highProtein threshold (>= 20g)", () => {
      const filters: NutritionFilterValues = { highProtein: true };
      const result = applyNutritionFilters(sampleRecipes, filters);
      expect(result.map((r) => r.id)).toEqual(["r1"]);
    });

    it("applies highFiber threshold (>= 5g)", () => {
      const filters: NutritionFilterValues = { highFiber: true };
      const result = applyNutritionFilters(sampleRecipes, filters);
      expect(result.map((r) => r.id)).toEqual(["r1", "r2"]);
    });

    it("allows lowSodium through without excluding recipes with nutrition", () => {
      const filters: NutritionFilterValues = { lowSodium: true };
      const result = applyNutritionFilters(sampleRecipes, filters);
      expect(result.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
    });
  });

  describe("sortByNutrition", () => {
    it("sorts by calories-asc (ascending)", () => {
      const result = sortByNutrition(sampleRecipes, "calories-asc");
      expect(result.map((r) => r.id)).toEqual(["r4", "r2", "r1", "r3"]);
    });

    it("sorts by calories-desc (descending)", () => {
      const result = sortByNutrition(sampleRecipes, "calories-desc");
      expect(result.map((r) => r.id)).toEqual(["r3", "r1", "r2", "r4"]);
    });

    it("sorts by protein-desc (descending)", () => {
      const result = sortByNutrition(sampleRecipes, "protein-desc");
      expect(result.map((r) => r.id)).toEqual(["r1", "r3", "r2", "r4"]);
    });

    it("sorts by fiber-desc (descending)", () => {
      const result = sortByNutrition(sampleRecipes, "fiber-desc");
      expect(result.map((r) => r.id)).toEqual(["r1", "r2", "r3", "r4"]);
    });

    it("returns unchanged order for relevance", () => {
      const result = sortByNutrition(sampleRecipes, "relevance");
      expect(result.map((r) => r.id)).toEqual(["r1", "r2", "r3", "r4"]);
    });
  });
});
