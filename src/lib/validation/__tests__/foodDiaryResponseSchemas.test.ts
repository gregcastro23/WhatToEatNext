/**
 * Tests for FoodDiary Response Schemas
 *
 * @file src/lib/validation/__tests__/foodDiaryResponseSchemas.test.ts
 */

import {
  FoodDiaryEntrySchema,
  FoodDiaryFoodSourceSchema,
  FoodDiaryNutritionSchema,
} from "@/lib/validation/foodDiaryResponseSchemas";

describe("FoodDiaryResponseSchemas", () => {
  describe("FoodDiaryNutritionSchema", () => {
    it("accepts valid numeric dictionaries", () => {
      const valid = { calories: 250, protein: 15.5, carbs: 30, fat: 8 };
      expect(FoodDiaryNutritionSchema.safeParse(valid).success).toBe(true);
      expect(FoodDiaryNutritionSchema.safeParse({}).success).toBe(true);
    });

    it("rejects non-numeric values, arrays, and primitives", () => {
      expect(FoodDiaryNutritionSchema.safeParse({ calories: "250" }).success).toBe(false);
      expect(FoodDiaryNutritionSchema.safeParse([1, 2, 3]).success).toBe(false);
      expect(FoodDiaryNutritionSchema.safeParse("nutrition").success).toBe(false);
      expect(FoodDiaryNutritionSchema.safeParse(null).success).toBe(false);
      expect(FoodDiaryNutritionSchema.safeParse({ calories: NaN }).success).toBe(false);
    });
  });

  describe("FoodDiaryFoodSourceSchema", () => {
    it("preserves 'manual' and does not relabel it as 'custom'", () => {
      const parsed = FoodDiaryFoodSourceSchema.parse("manual");
      expect(parsed).toBe("manual");
    });

    it("accepts all valid sources", () => {
      const sources = [
        "recipe",
        "custom",
        "restaurant",
        "barcode",
        "search",
        "quick",
        "favorite",
        "manual",
      ];
      for (const s of sources) {
        expect(FoodDiaryFoodSourceSchema.parse(s)).toBe(s);
      }
    });

    it("falls back to 'custom' for unknown sources", () => {
      expect(FoodDiaryFoodSourceSchema.parse("unknown-source")).toBe("custom");
    });
  });

  describe("FoodDiaryEntrySchema", () => {
    it("parses valid entry with manual source", () => {
      const entry = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        foodName: "Steak and Eggs",
        foodSource: "manual",
        date: new Date("2026-10-04T12:00:00Z"),
        mealType: "lunch",
        time: "12:30",
        serving: { amount: 1, unit: "serving", grams: 350 },
        quantity: 1,
        nutrition: { calories: 550, protein: 45, fat: 35 },
        nutritionConfidence: "high",
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = FoodDiaryEntrySchema.safeParse(entry);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.foodSource).toBe("manual");
        expect(parsed.data.nutritionConfidence).toBe("high");
      }
    });
  });
});
