/**
 * Recipe Schema Validator Tests
 *
 * @file src/__tests__/recipe/recipeSchemaValidator.test.ts
 * @created 2026-01-28
 */

import {
  validateRecipe,
  validateAllRecipes,
  detectDuplicates,
  generateRecipeId,
  isValidTimeFormat,
  normalizeTimeToMinutes,
  validateElementalProperties,
  validateIngredient,
} from "@/utils/recipe/recipeSchemaValidator";

describe("Recipe Schema Validator", () => {
  describe("generateRecipeId", () => {
    it("generates ID from name only", () => {
      const id = generateRecipeId("Pasta Carbonara");
      expect(id).toBe("pasta-carbonara");
    });

    it("generates ID with cuisine prefix", () => {
      const id = generateRecipeId("Pasta Carbonara", "Italian");
      expect(id).toBe("italian-pasta-carbonara");
    });

    it("handles special characters", () => {
      const id = generateRecipeId("Crème Brûlée", "French");
      expect(id).toBe("french-crme-brle");
    });

    it("handles multiple spaces", () => {
      const id = generateRecipeId("Pad   Thai", "Thai");
      expect(id).toBe("thai-pad-thai");
    });
  });

  describe("isValidTimeFormat", () => {
    it("accepts number values", () => {
      expect(isValidTimeFormat(30)).toBe(true);
      expect(isValidTimeFormat(0)).toBe(false);
      expect(isValidTimeFormat(-5)).toBe(false);
    });

    it("accepts minutes format", () => {
      expect(isValidTimeFormat("30 minutes")).toBe(true);
      expect(isValidTimeFormat("30min")).toBe(true);
      expect(isValidTimeFormat("30 min")).toBe(true);
    });

    it("accepts hours format", () => {
      expect(isValidTimeFormat("1 hour")).toBe(true);
      expect(isValidTimeFormat("2 hours")).toBe(true);
      expect(isValidTimeFormat("1.5 hours")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isValidTimeFormat("quick")).toBe(false);
      expect(isValidTimeFormat("")).toBe(false);
      expect(isValidTimeFormat(null)).toBe(false);
    });
  });

  describe("normalizeTimeToMinutes", () => {
    it("converts minutes strings", () => {
      expect(normalizeTimeToMinutes("30 minutes")).toBe(30);
      expect(normalizeTimeToMinutes("30min")).toBe(30);
      expect(normalizeTimeToMinutes("45 mins")).toBe(45);
    });

    it("converts hours strings", () => {
      expect(normalizeTimeToMinutes("1 hour")).toBe(60);
      expect(normalizeTimeToMinutes("2 hours")).toBe(120);
      expect(normalizeTimeToMinutes("1.5 hours")).toBe(90);
    });

    it("passes through numbers", () => {
      expect(normalizeTimeToMinutes(30)).toBe(30);
    });

    it("returns null for invalid input", () => {
      expect(normalizeTimeToMinutes("quick")).toBe(null);
      expect(normalizeTimeToMinutes(null)).toBe(null);
    });
  });

  describe("validateElementalProperties", () => {
    it("validates correct properties", () => {
      const result = validateElementalProperties({
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      });
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("detects missing properties", () => {
      const result = validateElementalProperties({
        Fire: 0.5,
        Water: 0.5,
      });
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.includes("Earth"))).toBe(true);
      expect(result.issues.some((i) => i.includes("Air"))).toBe(true);
    });

    it("detects sum not equal to 1", () => {
      const result = validateElementalProperties({
        Fire: 0.5,
        Water: 0.5,
        Earth: 0.5,
        Air: 0.5,
      });
      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.includes("sum"))).toBe(true);
    });

    it("normalizes properties", () => {
      const result = validateElementalProperties({
        Fire: 1,
        Water: 1,
        Earth: 1,
        Air: 1,
      });
      expect(result.normalized).toEqual({
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      });
    });
  });

  describe("validateIngredient", () => {
    it("validates correct ingredient", () => {
      const issues = validateIngredient(
        {
          name: "flour",
          amount: 2,
          unit: "cups",
        },
        0,
      );
      expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("detects missing name", () => {
      const issues = validateIngredient(
        {
          amount: 2,
          unit: "cups",
        },
        0,
      );
      expect(
        issues.some((i) => i.field.includes("name") && i.severity === "error"),
      ).toBe(true);
    });

    it("detects missing amount", () => {
      const issues = validateIngredient(
        {
          name: "flour",
          unit: "cups",
        },
        0,
      );
      expect(issues.some((i) => i.field.includes("amount"))).toBe(true);
    });

    it("detects missing unit", () => {
      const issues = validateIngredient(
        {
          name: "flour",
          amount: 2,
        },
        0,
      );
      expect(issues.some((i) => i.field.includes("unit"))).toBe(true);
    });
  });

  describe("validateRecipe", () => {
    const validRecipe = {
      id: "italian-pasta-carbonara",
      name: "Pasta Carbonara",
      description: "Classic Italian pasta dish",
      cuisine: "Italian",
      ingredients: [
        { name: "pasta", amount: 400, unit: "g" },
        { name: "eggs", amount: 4, unit: "whole" },
      ],
      instructions: [
        "Cook pasta until al dente",
        "Mix eggs with cheese",
        "Combine and serve",
      ],
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
    };

    it("validates a complete recipe", () => {
      const result = validateRecipe(validRecipe);
      expect(result.isValid).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(
        0,
      );
    });

    it("detects missing name", () => {
      const recipe = { ...validRecipe, name: undefined };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((i) => i.field === "name" && i.severity === "error"),
      ).toBe(true);
    });

    it("detects missing ingredients", () => {
      const recipe = { ...validRecipe, ingredients: undefined };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(
        result.issues.some(
          (i) => i.field === "ingredients" && i.severity === "error",
        ),
      ).toBe(true);
    });

    it("detects missing instructions", () => {
      const recipe = {
        ...validRecipe,
        instructions: undefined,
        preparationSteps: undefined,
      };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(
        result.issues.some(
          (i) => i.field === "instructions" && i.severity === "error",
        ),
      ).toBe(true);
    });

    it("warns about missing ID", () => {
      const recipe = { ...validRecipe, id: undefined };
      const result = validateRecipe(recipe);
      expect(
        result.issues.some((i) => i.field === "id" && i.severity === "warning"),
      ).toBe(true);
    });

    it("calculates quality score", () => {
      const result = validateRecipe(validRecipe);
      expect(result.qualityScore).toBeGreaterThan(50);
    });

    it("calculates field coverage", () => {
      const result = validateRecipe(validRecipe);
      expect(result.fieldCoverage).toBeGreaterThan(0);
    });
  });

  describe("validateAllRecipes", () => {
    it("validates multiple recipes", () => {
      const recipes = [
        {
          name: "Recipe 1",
          ingredients: [{ name: "item", amount: 1, unit: "piece" }],
          instructions: ["Step 1"],
        },
        {
          name: "Recipe 2",
          ingredients: [{ name: "item", amount: 1, unit: "piece" }],
          instructions: ["Step 1"],
        },
      ];

      const report = validateAllRecipes(recipes);
      expect(report.totalRecipes).toBe(2);
      expect(report.recipeResults).toHaveLength(2);
    });

    it("calculates aggregate statistics", () => {
      const recipes = [
        {
          name: "Complete Recipe",
          id: "complete",
          description: "A complete recipe",
          cuisine: "Italian",
          ingredients: [{ name: "item", amount: 1, unit: "piece" }],
          instructions: ["Step 1"],
          elementalProperties: {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25,
          },
        },
      ];

      const report = validateAllRecipes(recipes);
      expect(report.averageFieldCoverage).toBeGreaterThan(0);
      expect(report.averageQualityScore).toBeGreaterThan(0);
    });

    it("counts issues by severity", () => {
      const recipes = [
        { name: "", ingredients: [] }, // Multiple errors
      ];

      const report = validateAllRecipes(recipes);
      expect(report.issuesBySeverity.error).toBeGreaterThan(0);
    });
  });

  describe("detectDuplicates", () => {
    it("detects recipes with similar names", () => {
      const recipes = [
        {
          id: "1",
          name: "Pasta Carbonara",
          cuisine: "Italian",
          ingredients: [],
        },
        {
          id: "2",
          name: "Pasta Carbonara",
          cuisine: "Italian",
          ingredients: [],
        },
      ];

      const report = detectDuplicates(recipes, 0.8);
      expect(report.totalDuplicateGroups).toBe(1);
      expect(report.duplicateGroups[0].recipes).toHaveLength(2);
    });

    it("does not flag different recipes", () => {
      const recipes = [
        {
          id: "1",
          name: "Pasta Carbonara",
          cuisine: "Italian",
          ingredients: [],
        },
        { id: "2", name: "Pad Thai", cuisine: "Thai", ingredients: [] },
      ];

      const report = detectDuplicates(recipes, 0.8);
      expect(report.totalDuplicateGroups).toBe(0);
    });

    it("considers ingredient overlap", () => {
      const recipes = [
        {
          id: "1",
          name: "Pasta Dish",
          cuisine: "Italian",
          ingredients: [{ name: "pasta" }, { name: "cheese" }],
        },
        {
          id: "2",
          name: "Pasta Recipe",
          cuisine: "Italian",
          ingredients: [{ name: "pasta" }, { name: "cheese" }],
        },
      ];

      const report = detectDuplicates(recipes, 0.7);
      expect(report.totalDuplicateGroups).toBeGreaterThanOrEqual(1);
    });

    it("suggests which recipe to keep", () => {
      const recipes = [
        { id: "1", name: "Pasta", ingredients: [] },
        {
          id: "2",
          name: "Pasta",
          description: "A pasta dish",
          ingredients: [{ name: "pasta" }],
          instructions: ["Cook it"],
        },
      ];

      const report = detectDuplicates(recipes, 0.9);
      if (report.duplicateGroups.length > 0) {
        expect(report.duplicateGroups[0].suggestedKeep).toBe("2");
      }
    });
  });
});
