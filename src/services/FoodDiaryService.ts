/**
 * FoodDiaryService
 * Central service for managing food diary entries, tracking nutrition,
 * and generating insights for personalized recommendations.
 * Uses PostgreSQL for persistent storage with in-memory fallback.
 *
 * @file src/services/FoodDiaryService.ts
 * @created 2026-02-02
 * @updated 2026-02-03 - Added PostgreSQL persistence
 */

import { _logger } from "@/lib/logger";
import { userCache } from "@/lib/performance/advanced-cache";
import type {
  FoodDiaryEntry,
  CreateFoodDiaryEntryInput,
  UpdateFoodDiaryEntryInput,
  DailyFoodDiarySummary,
  WeeklyFoodDiarySummary,
  FoodDiaryFilters,
  FoodDiaryStats,
  FoodPatterns,
  FoodInsight,
  FoodRating,
  MoodTag,
  FoodSearchResult,
  UserFoodFavorite,
  QuickFoodPreset,
  QuickFoodCategory,
  ServingSize,
  calculateEntryNutrition,
  createEmptyDailySummary,
} from "@/types/foodDiary";
import type { MealType } from "@/types/menuPlanner";
import type { NutritionalSummary } from "@/types/nutrition";
import { createEmptyNutritionalSummary } from "@/types/nutrition";
import { getNutritionTrackingService } from "./NutritionTrackingService";

// Check if we should use database (only in server-side contexts with DB available)
const isServerWithDB = (): boolean => {
  return typeof window === "undefined" && !!process.env.DATABASE_URL;
};

// Lazy-load database module to avoid build-time issues
let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch (error) {
      _logger.warn("Database module not available, using in-memory storage");
    }
  }
  return dbModule;
};

/**
 * Quick food presets for common snacks and simple foods
 * Sodium values sourced from USDA FoodData Central (per 100g)
 */
const QUICK_FOOD_PRESETS: QuickFoodPreset[] = [
  // ============================================================
  // FRUITS (naturally low in sodium)
  // ============================================================
  {
    id: "apple",
    name: "Apple",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 180,
      description: "1 medium apple",
    },
    nutritionPer100g: {
      calories: 52,
      carbs: 14,
      fiber: 2.4,
      sugar: 10,
      protein: 0.3,
      fat: 0.2,
      sodium: 1,
      vitaminC: 4.6,
      potassium: 107,
    },
    icon: "apple",
  },
  {
    id: "banana",
    name: "Banana",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 118,
      description: "1 medium banana",
    },
    nutritionPer100g: {
      calories: 89,
      carbs: 23,
      fiber: 2.6,
      sugar: 12,
      protein: 1.1,
      fat: 0.3,
      sodium: 1,
      vitaminB6: 0.4,
      potassium: 358,
    },
    icon: "banana",
  },
  {
    id: "orange",
    name: "Orange",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 130,
      description: "1 medium orange",
    },
    nutritionPer100g: {
      calories: 47,
      carbs: 12,
      fiber: 2.4,
      sugar: 9,
      protein: 0.9,
      fat: 0.1,
      sodium: 0,
      vitaminC: 53,
      folate: 30,
    },
    icon: "orange",
  },
  {
    id: "berries-mixed",
    name: "Mixed Berries",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 150,
      description: "1 cup mixed berries",
    },
    nutritionPer100g: {
      calories: 43,
      carbs: 10,
      fiber: 3,
      sugar: 5,
      protein: 0.7,
      fat: 0.3,
      sodium: 1,
      vitaminC: 20,
    },
    icon: "berry",
  },
  {
    id: "grapes",
    name: "Grapes",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 151,
      description: "1 cup grapes",
    },
    nutritionPer100g: {
      calories: 67,
      carbs: 17,
      fiber: 0.9,
      sugar: 16,
      protein: 0.6,
      fat: 0.4,
      sodium: 2,
      vitaminK: 14.6,
    },
    icon: "grape",
  },
  {
    id: "strawberries",
    name: "Strawberries",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 152,
      description: "1 cup whole",
    },
    nutritionPer100g: {
      calories: 32,
      carbs: 7.7,
      fiber: 2,
      sugar: 4.9,
      protein: 0.7,
      fat: 0.3,
      sodium: 1,
      vitaminC: 58.8,
      potassium: 153,
    },
    icon: "strawberry",
  },
  {
    id: "blueberries",
    name: "Blueberries",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 148,
      description: "1 cup",
    },
    nutritionPer100g: {
      calories: 57,
      carbs: 14.5,
      fiber: 2.4,
      sugar: 10,
      protein: 0.7,
      fat: 0.3,
      sodium: 1,
      vitaminC: 9.7,
      vitaminK: 19.3,
    },
    icon: "blueberry",
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "fruits",
    defaultServing: {
      amount: 0.5,
      unit: "piece",
      grams: 100,
      description: "1/2 medium avocado",
    },
    nutritionPer100g: {
      calories: 160,
      carbs: 8.5,
      fiber: 6.7,
      sugar: 0.7,
      protein: 2,
      fat: 15,
      sodium: 7,
      potassium: 485,
      vitaminK: 21,
    },
    icon: "avocado",
  },
  {
    id: "mango",
    name: "Mango",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 165,
      description: "1 cup chunks",
    },
    nutritionPer100g: {
      calories: 60,
      carbs: 15,
      fiber: 1.6,
      sugar: 14,
      protein: 0.8,
      fat: 0.4,
      sodium: 1,
      vitaminC: 36,
      vitaminA: 54,
    },
    icon: "mango",
  },
  {
    id: "watermelon",
    name: "Watermelon",
    category: "fruits",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 154,
      description: "1 cup diced",
    },
    nutritionPer100g: {
      calories: 30,
      carbs: 7.5,
      fiber: 0.4,
      sugar: 6.2,
      protein: 0.6,
      fat: 0.2,
      sodium: 1,
      vitaminC: 8.1,
      vitaminA: 28,
    },
    icon: "watermelon",
  },

  // ============================================================
  // VEGETABLES
  // ============================================================
  {
    id: "carrot",
    name: "Carrot",
    category: "vegetables",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 61,
      description: "1 medium carrot",
    },
    nutritionPer100g: {
      calories: 41,
      carbs: 10,
      fiber: 2.8,
      sugar: 5,
      protein: 0.9,
      fat: 0.2,
      sodium: 69,
      vitaminA: 835,
    },
    icon: "carrot",
  },
  {
    id: "cucumber",
    name: "Cucumber",
    category: "vegetables",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 52,
      description: "1/2 cup sliced",
    },
    nutritionPer100g: {
      calories: 15,
      carbs: 3.6,
      fiber: 0.5,
      sugar: 1.7,
      protein: 0.7,
      fat: 0.1,
      sodium: 2,
      vitaminK: 16,
    },
    icon: "cucumber",
  },
  {
    id: "celery",
    name: "Celery",
    category: "vegetables",
    defaultServing: {
      amount: 2,
      unit: "piece",
      grams: 80,
      description: "2 stalks",
    },
    nutritionPer100g: {
      calories: 14,
      carbs: 3,
      fiber: 1.6,
      sugar: 1.3,
      protein: 0.7,
      fat: 0.2,
      sodium: 80,
      vitaminK: 29,
    },
    icon: "celery",
  },
  {
    id: "broccoli",
    name: "Broccoli",
    category: "vegetables",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 91,
      description: "1 cup chopped",
    },
    nutritionPer100g: {
      calories: 34,
      carbs: 7,
      fiber: 2.6,
      sugar: 1.7,
      protein: 2.8,
      fat: 0.4,
      sodium: 33,
      vitaminC: 89,
      potassium: 316,
    },
    icon: "broccoli",
  },
  {
    id: "spinach",
    name: "Spinach (raw)",
    category: "vegetables",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 30,
      description: "1 cup raw",
    },
    nutritionPer100g: {
      calories: 23,
      carbs: 3.6,
      fiber: 2.2,
      sugar: 0.4,
      protein: 2.9,
      fat: 0.4,
      sodium: 79,
      iron: 2.7,
      vitaminK: 483,
    },
    icon: "spinach",
  },
  {
    id: "tomato",
    name: "Tomato",
    category: "vegetables",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 123,
      description: "1 medium tomato",
    },
    nutritionPer100g: {
      calories: 18,
      carbs: 3.9,
      fiber: 1.2,
      sugar: 2.6,
      protein: 0.9,
      fat: 0.2,
      sodium: 5,
      vitaminC: 14,
      potassium: 237,
    },
    icon: "tomato",
  },
  {
    id: "bell-pepper",
    name: "Bell Pepper",
    category: "vegetables",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 119,
      description: "1 medium pepper",
    },
    nutritionPer100g: {
      calories: 31,
      carbs: 6,
      fiber: 2.1,
      sugar: 4.2,
      protein: 1,
      fat: 0.3,
      sodium: 4,
      vitaminC: 128,
      vitaminA: 157,
    },
    icon: "pepper",
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    category: "vegetables",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 130,
      description: "1 medium",
    },
    nutritionPer100g: {
      calories: 86,
      carbs: 20,
      fiber: 3,
      sugar: 4.2,
      protein: 1.6,
      fat: 0.1,
      sodium: 55,
      vitaminA: 709,
      potassium: 337,
    },
    icon: "sweet-potato",
  },
  {
    id: "lettuce",
    name: "Lettuce (romaine)",
    category: "vegetables",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 47,
      description: "1 cup shredded",
    },
    nutritionPer100g: {
      calories: 17,
      carbs: 3.3,
      fiber: 2.1,
      sugar: 1.2,
      protein: 1.2,
      fat: 0.3,
      sodium: 8,
      vitaminA: 436,
      vitaminK: 102,
    },
    icon: "lettuce",
  },
  {
    id: "onion",
    name: "Onion",
    category: "vegetables",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 80,
      description: "1/2 cup chopped",
    },
    nutritionPer100g: {
      calories: 40,
      carbs: 9.3,
      fiber: 1.7,
      sugar: 4.2,
      protein: 1.1,
      fat: 0.1,
      sodium: 4,
      vitaminC: 7.4,
      potassium: 146,
    },
    icon: "onion",
  },

  // ============================================================
  // PROTEINS
  // ============================================================
  {
    id: "hard-boiled-egg",
    name: "Hard Boiled Egg",
    category: "proteins",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 50,
      description: "1 large egg",
    },
    nutritionPer100g: {
      calories: 155,
      protein: 13,
      fat: 11,
      carbs: 1.1,
      sodium: 124,
      cholesterol: 373,
      vitaminB12: 1.1,
      iron: 1.2,
    },
    icon: "egg",
  },
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    category: "proteins",
    defaultServing: {
      amount: 3,
      unit: "oz",
      grams: 85,
      description: "3 oz grilled",
    },
    nutritionPer100g: {
      calories: 165,
      protein: 31,
      fat: 3.6,
      carbs: 0,
      sodium: 74,
      iron: 1,
      vitaminB6: 0.5,
    },
    icon: "chicken",
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt",
    category: "proteins",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 245,
      description: "1 cup plain",
    },
    nutritionPer100g: {
      calories: 59,
      protein: 10,
      fat: 0.7,
      carbs: 3.6,
      sodium: 36,
      calcium: 110,
    },
    icon: "yogurt",
  },
  {
    id: "salmon",
    name: "Salmon (baked)",
    category: "proteins",
    defaultServing: {
      amount: 3,
      unit: "oz",
      grams: 85,
      description: "3 oz fillet",
    },
    nutritionPer100g: {
      calories: 208,
      protein: 20,
      fat: 13,
      carbs: 0,
      sodium: 59,
      vitaminD: 11,
      vitaminB12: 2.8,
    },
    icon: "fish",
  },
  {
    id: "tuna-canned",
    name: "Tuna (canned in water)",
    category: "proteins",
    defaultServing: {
      amount: 3,
      unit: "oz",
      grams: 85,
      description: "3 oz drained",
    },
    nutritionPer100g: {
      calories: 116,
      protein: 26,
      fat: 0.8,
      carbs: 0,
      sodium: 338,
      iron: 1.3,
      vitaminB12: 2.5,
    },
    icon: "fish",
  },
  {
    id: "turkey-breast",
    name: "Turkey Breast",
    category: "proteins",
    defaultServing: {
      amount: 3,
      unit: "oz",
      grams: 85,
      description: "3 oz sliced",
    },
    nutritionPer100g: {
      calories: 135,
      protein: 30,
      fat: 0.7,
      carbs: 0,
      sodium: 46,
      iron: 0.4,
      vitaminB6: 0.5,
    },
    icon: "turkey",
  },
  {
    id: "ground-beef",
    name: "Ground Beef (90% lean)",
    category: "proteins",
    defaultServing: {
      amount: 3,
      unit: "oz",
      grams: 85,
      description: "3 oz cooked",
    },
    nutritionPer100g: {
      calories: 196,
      protein: 27,
      fat: 10,
      carbs: 0,
      sodium: 76,
      iron: 2.6,
      vitaminB12: 2.5,
    },
    icon: "beef",
  },
  {
    id: "tofu",
    name: "Tofu (firm)",
    category: "proteins",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 126,
      description: "1/2 cup cubed",
    },
    nutritionPer100g: {
      calories: 76,
      protein: 8,
      fat: 4.8,
      carbs: 1.9,
      sodium: 7,
      calcium: 350,
      iron: 5.4,
    },
    icon: "tofu",
  },
  {
    id: "black-beans",
    name: "Black Beans (cooked)",
    category: "proteins",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 86,
      description: "1/2 cup",
    },
    nutritionPer100g: {
      calories: 132,
      protein: 8.9,
      fat: 0.5,
      carbs: 24,
      fiber: 8.7,
      sodium: 1,
      iron: 2.1,
      potassium: 355,
    },
    icon: "beans",
  },
  {
    id: "lentils",
    name: "Lentils (cooked)",
    category: "proteins",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 99,
      description: "1/2 cup",
    },
    nutritionPer100g: {
      calories: 116,
      protein: 9,
      fat: 0.4,
      carbs: 20,
      fiber: 7.9,
      sodium: 2,
      iron: 3.3,
      folate: 181,
    },
    icon: "lentils",
  },

  // ============================================================
  // NUTS & SEEDS
  // ============================================================
  {
    id: "almonds",
    name: "Almonds",
    category: "nuts_seeds",
    defaultServing: {
      amount: 1,
      unit: "oz",
      grams: 28,
      description: "1 oz (~23 almonds)",
    },
    nutritionPer100g: {
      calories: 579,
      protein: 21,
      fat: 50,
      carbs: 22,
      fiber: 12.5,
      sodium: 1,
      vitaminE: 26,
      magnesium: 270,
    },
    icon: "almond",
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter",
    category: "nuts_seeds",
    defaultServing: {
      amount: 2,
      unit: "tbsp",
      grams: 32,
      description: "2 tablespoons",
    },
    nutritionPer100g: {
      calories: 588,
      protein: 25,
      fat: 50,
      carbs: 20,
      fiber: 6,
      sodium: 426,
      vitaminE: 9,
      magnesium: 168,
    },
    icon: "peanut",
  },
  {
    id: "walnuts",
    name: "Walnuts",
    category: "nuts_seeds",
    defaultServing: {
      amount: 1,
      unit: "oz",
      grams: 28,
      description: "1 oz (~14 halves)",
    },
    nutritionPer100g: {
      calories: 654,
      protein: 15,
      fat: 65,
      carbs: 14,
      fiber: 6.7,
      sodium: 2,
      magnesium: 158,
    },
    icon: "walnut",
  },
  {
    id: "cashews",
    name: "Cashews",
    category: "nuts_seeds",
    defaultServing: {
      amount: 1,
      unit: "oz",
      grams: 28,
      description: "1 oz (~18 pieces)",
    },
    nutritionPer100g: {
      calories: 553,
      protein: 18,
      fat: 44,
      carbs: 30,
      fiber: 3.3,
      sodium: 12,
      magnesium: 292,
      iron: 6.7,
    },
    icon: "cashew",
  },
  {
    id: "sunflower-seeds",
    name: "Sunflower Seeds",
    category: "nuts_seeds",
    defaultServing: {
      amount: 0.25,
      unit: "cup",
      grams: 32,
      description: "1/4 cup",
    },
    nutritionPer100g: {
      calories: 584,
      protein: 21,
      fat: 51,
      carbs: 20,
      fiber: 8.6,
      sodium: 9,
      vitaminE: 35,
      magnesium: 325,
    },
    icon: "seed",
  },
  {
    id: "chia-seeds",
    name: "Chia Seeds",
    category: "nuts_seeds",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 12,
      description: "1 tablespoon",
    },
    nutritionPer100g: {
      calories: 486,
      protein: 17,
      fat: 31,
      carbs: 42,
      fiber: 34,
      sodium: 16,
      calcium: 631,
      iron: 7.7,
    },
    icon: "seed",
  },
  {
    id: "peanuts",
    name: "Peanuts (roasted)",
    category: "nuts_seeds",
    defaultServing: { amount: 1, unit: "oz", grams: 28, description: "1 oz" },
    nutritionPer100g: {
      calories: 567,
      protein: 26,
      fat: 49,
      carbs: 16,
      fiber: 8.5,
      sodium: 410,
      magnesium: 168,
      vitaminE: 8.3,
    },
    icon: "peanut",
  },

  // ============================================================
  // DAIRY
  // ============================================================
  {
    id: "cheese-cheddar",
    name: "Cheddar Cheese",
    category: "dairy",
    defaultServing: {
      amount: 1,
      unit: "oz",
      grams: 28,
      description: "1 oz slice",
    },
    nutritionPer100g: {
      calories: 403,
      protein: 25,
      fat: 33,
      carbs: 1.3,
      sodium: 621,
      calcium: 721,
      vitaminA: 265,
    },
    icon: "cheese",
  },
  {
    id: "milk",
    name: "Milk (2%)",
    category: "dairy",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 244,
      description: "1 cup",
    },
    nutritionPer100g: {
      calories: 50,
      protein: 3.3,
      fat: 2,
      carbs: 5,
      sodium: 47,
      calcium: 120,
      vitaminD: 1.2,
    },
    icon: "milk",
  },
  {
    id: "cottage-cheese",
    name: "Cottage Cheese",
    category: "dairy",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 113,
      description: "1/2 cup",
    },
    nutritionPer100g: {
      calories: 98,
      protein: 11,
      fat: 4.3,
      carbs: 3.4,
      sodium: 364,
      calcium: 83,
    },
    icon: "cottage",
  },
  {
    id: "cheese-mozzarella",
    name: "Mozzarella Cheese",
    category: "dairy",
    defaultServing: { amount: 1, unit: "oz", grams: 28, description: "1 oz" },
    nutritionPer100g: {
      calories: 280,
      protein: 28,
      fat: 17,
      carbs: 3.1,
      sodium: 628,
      calcium: 505,
    },
    icon: "cheese",
  },
  {
    id: "cheese-parmesan",
    name: "Parmesan Cheese",
    category: "dairy",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 10,
      description: "1 tbsp grated",
    },
    nutritionPer100g: {
      calories: 431,
      protein: 38,
      fat: 29,
      carbs: 4.1,
      sodium: 1529,
      calcium: 1184,
    },
    icon: "cheese",
  },
  {
    id: "cheese-feta",
    name: "Feta Cheese",
    category: "dairy",
    defaultServing: {
      amount: 1,
      unit: "oz",
      grams: 28,
      description: "1 oz crumbled",
    },
    nutritionPer100g: {
      calories: 264,
      protein: 14,
      fat: 21,
      carbs: 4.1,
      sodium: 917,
      calcium: 493,
    },
    icon: "cheese",
  },
  {
    id: "cream-cheese",
    name: "Cream Cheese",
    category: "dairy",
    defaultServing: {
      amount: 2,
      unit: "tbsp",
      grams: 28,
      description: "2 tablespoons",
    },
    nutritionPer100g: {
      calories: 342,
      protein: 6,
      fat: 34,
      carbs: 4.1,
      sodium: 321,
      calcium: 80,
      vitaminA: 362,
    },
    icon: "cheese",
  },
  {
    id: "butter",
    name: "Butter",
    category: "dairy",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 14,
      description: "1 tablespoon",
    },
    nutritionPer100g: {
      calories: 717,
      protein: 0.9,
      fat: 81,
      carbs: 0.1,
      sodium: 11,
      vitaminA: 684,
      cholesterol: 215,
    },
    icon: "butter",
  },
  {
    id: "sour-cream",
    name: "Sour Cream",
    category: "dairy",
    defaultServing: {
      amount: 2,
      unit: "tbsp",
      grams: 30,
      description: "2 tablespoons",
    },
    nutritionPer100g: {
      calories: 198,
      protein: 2.4,
      fat: 19,
      carbs: 4.6,
      sodium: 80,
      calcium: 110,
    },
    icon: "cream",
  },

  // ============================================================
  // GRAINS & BREADS
  // ============================================================
  {
    id: "bread-whole-wheat",
    name: "Whole Wheat Bread",
    category: "grains",
    defaultServing: {
      amount: 1,
      unit: "slice",
      grams: 43,
      description: "1 slice",
    },
    nutritionPer100g: {
      calories: 247,
      protein: 13,
      fat: 3.4,
      carbs: 41,
      fiber: 6,
      sodium: 472,
      iron: 2.5,
    },
    icon: "bread",
  },
  {
    id: "bread-white",
    name: "White Bread",
    category: "grains",
    defaultServing: {
      amount: 1,
      unit: "slice",
      grams: 30,
      description: "1 slice",
    },
    nutritionPer100g: {
      calories: 266,
      protein: 9,
      fat: 3.3,
      carbs: 49,
      fiber: 2.7,
      sodium: 491,
      iron: 3.6,
    },
    icon: "bread",
  },
  {
    id: "bagel",
    name: "Bagel (plain)",
    category: "grains",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 98,
      description: "1 medium bagel",
    },
    nutritionPer100g: {
      calories: 275,
      protein: 11,
      fat: 1.6,
      carbs: 53,
      fiber: 2.3,
      sodium: 475,
      iron: 3.2,
    },
    icon: "bagel",
  },
  {
    id: "tortilla-flour",
    name: "Flour Tortilla",
    category: "grains",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 45,
      description: "1 medium (8-inch)",
    },
    nutritionPer100g: {
      calories: 312,
      protein: 8.2,
      fat: 8.4,
      carbs: 52,
      fiber: 2.1,
      sodium: 580,
      iron: 3.2,
    },
    icon: "tortilla",
  },
  {
    id: "tortilla-corn",
    name: "Corn Tortilla",
    category: "grains",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 24,
      description: "1 small (6-inch)",
    },
    nutritionPer100g: {
      calories: 218,
      protein: 5.7,
      fat: 2.9,
      carbs: 45,
      fiber: 5.3,
      sodium: 46,
      calcium: 46,
    },
    icon: "tortilla",
  },
  {
    id: "oatmeal",
    name: "Oatmeal (cooked)",
    category: "grains",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 234,
      description: "1 cup cooked",
    },
    nutritionPer100g: {
      calories: 68,
      protein: 2.4,
      fat: 1.4,
      carbs: 12,
      fiber: 1.7,
      sodium: 4,
      iron: 1.5,
    },
    icon: "oatmeal",
  },
  {
    id: "rice-brown",
    name: "Brown Rice (cooked)",
    category: "grains",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 98,
      description: "1/2 cup cooked",
    },
    nutritionPer100g: {
      calories: 112,
      protein: 2.6,
      fat: 0.9,
      carbs: 24,
      fiber: 1.8,
      sodium: 4,
      magnesium: 43,
    },
    icon: "rice",
  },
  {
    id: "rice-white",
    name: "White Rice (cooked)",
    category: "grains",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 79,
      description: "1/2 cup cooked",
    },
    nutritionPer100g: {
      calories: 130,
      protein: 2.7,
      fat: 0.3,
      carbs: 28,
      fiber: 0.4,
      sodium: 1,
      iron: 0.2,
    },
    icon: "rice",
  },
  {
    id: "pasta-cooked",
    name: "Pasta (cooked)",
    category: "grains",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 140,
      description: "1 cup cooked",
    },
    nutritionPer100g: {
      calories: 131,
      protein: 5,
      fat: 1.1,
      carbs: 25,
      fiber: 1.8,
      sodium: 1,
      iron: 1.3,
    },
    icon: "pasta",
  },
  {
    id: "crackers",
    name: "Whole Grain Crackers",
    category: "grains",
    defaultServing: {
      amount: 5,
      unit: "piece",
      grams: 30,
      description: "5 crackers",
    },
    nutritionPer100g: {
      calories: 430,
      protein: 9,
      fat: 14,
      carbs: 67,
      fiber: 5,
      sodium: 600,
    },
    icon: "cracker",
  },
  {
    id: "english-muffin",
    name: "English Muffin",
    category: "grains",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 57,
      description: "1 muffin",
    },
    nutritionPer100g: {
      calories: 227,
      protein: 8.7,
      fat: 1.8,
      carbs: 44,
      fiber: 2.3,
      sodium: 410,
      iron: 3.4,
    },
    icon: "bread",
  },
  {
    id: "cereal-corn-flakes",
    name: "Corn Flakes",
    category: "grains",
    defaultServing: { amount: 1, unit: "cup", grams: 28, description: "1 cup" },
    nutritionPer100g: {
      calories: 357,
      protein: 7.5,
      fat: 0.4,
      carbs: 84,
      fiber: 3.3,
      sodium: 729,
      iron: 28,
    },
    icon: "cereal",
  },
  {
    id: "granola",
    name: "Granola",
    category: "grains",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 61,
      description: "1/2 cup",
    },
    nutritionPer100g: {
      calories: 471,
      protein: 10,
      fat: 20,
      carbs: 64,
      fiber: 5.3,
      sodium: 26,
      iron: 3.4,
    },
    icon: "granola",
  },

  // ============================================================
  // SNACKS
  // ============================================================
  {
    id: "hummus",
    name: "Hummus",
    category: "snacks",
    defaultServing: {
      amount: 2,
      unit: "tbsp",
      grams: 30,
      description: "2 tablespoons",
    },
    nutritionPer100g: {
      calories: 166,
      protein: 8,
      fat: 10,
      carbs: 14,
      fiber: 6,
      sodium: 379,
      iron: 2.4,
    },
    icon: "hummus",
  },
  {
    id: "dark-chocolate",
    name: "Dark Chocolate",
    category: "sweets",
    defaultServing: {
      amount: 1,
      unit: "oz",
      grams: 28,
      description: "1 oz (1 square)",
    },
    nutritionPer100g: {
      calories: 546,
      protein: 5,
      fat: 31,
      carbs: 60,
      fiber: 7,
      sodium: 24,
      iron: 8,
    },
    icon: "chocolate",
  },
  {
    id: "granola-bar",
    name: "Granola Bar",
    category: "snacks",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 35,
      description: "1 bar",
    },
    nutritionPer100g: {
      calories: 450,
      protein: 7,
      fat: 16,
      carbs: 68,
      fiber: 4,
      sodium: 160,
    },
    icon: "granola",
  },
  {
    id: "popcorn",
    name: "Popcorn (air-popped)",
    category: "snacks",
    defaultServing: {
      amount: 3,
      unit: "cup",
      grams: 24,
      description: "3 cups",
    },
    nutritionPer100g: {
      calories: 387,
      protein: 13,
      fat: 4.5,
      carbs: 78,
      fiber: 15,
      sodium: 8,
    },
    icon: "popcorn",
  },
  {
    id: "trail-mix",
    name: "Trail Mix",
    category: "snacks",
    defaultServing: {
      amount: 0.25,
      unit: "cup",
      grams: 35,
      description: "1/4 cup",
    },
    nutritionPer100g: {
      calories: 462,
      protein: 13,
      fat: 29,
      carbs: 44,
      fiber: 4,
      sodium: 100,
    },
    icon: "trail-mix",
  },
  {
    id: "pretzels",
    name: "Pretzels",
    category: "snacks",
    defaultServing: { amount: 1, unit: "oz", grams: 28, description: "1 oz" },
    nutritionPer100g: {
      calories: 380,
      protein: 9.2,
      fat: 3.5,
      carbs: 79,
      fiber: 2.8,
      sodium: 1266,
      iron: 4.3,
    },
    icon: "pretzel",
  },
  {
    id: "chips-potato",
    name: "Potato Chips",
    category: "snacks",
    defaultServing: {
      amount: 1,
      unit: "oz",
      grams: 28,
      description: "1 oz (~15 chips)",
    },
    nutritionPer100g: {
      calories: 536,
      protein: 7,
      fat: 35,
      carbs: 53,
      fiber: 4.4,
      sodium: 525,
      potassium: 1196,
    },
    icon: "chips",
  },
  {
    id: "chips-tortilla",
    name: "Tortilla Chips",
    category: "snacks",
    defaultServing: {
      amount: 1,
      unit: "oz",
      grams: 28,
      description: "1 oz (~10 chips)",
    },
    nutritionPer100g: {
      calories: 489,
      protein: 7,
      fat: 24,
      carbs: 63,
      fiber: 4.5,
      sodium: 418,
    },
    icon: "chips",
  },
  {
    id: "rice-cakes",
    name: "Rice Cakes",
    category: "snacks",
    defaultServing: {
      amount: 2,
      unit: "piece",
      grams: 18,
      description: "2 cakes",
    },
    nutritionPer100g: {
      calories: 387,
      protein: 8,
      fat: 2.8,
      carbs: 81,
      fiber: 4.2,
      sodium: 28,
    },
    icon: "rice-cake",
  },
  {
    id: "jerky-beef",
    name: "Beef Jerky",
    category: "snacks",
    defaultServing: { amount: 1, unit: "oz", grams: 28, description: "1 oz" },
    nutritionPer100g: {
      calories: 410,
      protein: 33,
      fat: 26,
      carbs: 11,
      fiber: 0.5,
      sodium: 2081,
      iron: 4.5,
    },
    icon: "jerky",
  },

  // ============================================================
  // CONDIMENTS & SAUCES
  // ============================================================
  {
    id: "ketchup",
    name: "Ketchup",
    category: "condiments",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 17,
      description: "1 tablespoon",
    },
    nutritionPer100g: {
      calories: 112,
      protein: 1.7,
      fat: 0.1,
      carbs: 26,
      sugar: 22,
      sodium: 907,
    },
    icon: "sauce",
  },
  {
    id: "mustard",
    name: "Mustard (yellow)",
    category: "condiments",
    defaultServing: {
      amount: 1,
      unit: "tsp",
      grams: 5,
      description: "1 teaspoon",
    },
    nutritionPer100g: {
      calories: 60,
      protein: 4.4,
      fat: 3.3,
      carbs: 5.3,
      fiber: 4,
      sodium: 1135,
    },
    icon: "sauce",
  },
  {
    id: "mayonnaise",
    name: "Mayonnaise",
    category: "condiments",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 14,
      description: "1 tablespoon",
    },
    nutritionPer100g: {
      calories: 680,
      protein: 1,
      fat: 75,
      carbs: 0.6,
      sodium: 635,
    },
    icon: "sauce",
  },
  {
    id: "soy-sauce",
    name: "Soy Sauce",
    category: "condiments",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 16,
      description: "1 tablespoon",
    },
    nutritionPer100g: {
      calories: 53,
      protein: 5.6,
      fat: 0.1,
      carbs: 4.9,
      sodium: 5493,
    },
    icon: "sauce",
  },
  {
    id: "salsa",
    name: "Salsa",
    category: "condiments",
    defaultServing: {
      amount: 2,
      unit: "tbsp",
      grams: 32,
      description: "2 tablespoons",
    },
    nutritionPer100g: {
      calories: 36,
      protein: 1.5,
      fat: 0.2,
      carbs: 7.6,
      fiber: 1.8,
      sodium: 600,
      vitaminC: 5,
    },
    icon: "salsa",
  },
  {
    id: "hot-sauce",
    name: "Hot Sauce",
    category: "condiments",
    defaultServing: {
      amount: 1,
      unit: "tsp",
      grams: 5,
      description: "1 teaspoon",
    },
    nutritionPer100g: {
      calories: 11,
      protein: 0.5,
      fat: 0.4,
      carbs: 1.8,
      sodium: 2643,
      vitaminC: 4,
    },
    icon: "sauce",
  },
  {
    id: "bbq-sauce",
    name: "BBQ Sauce",
    category: "condiments",
    defaultServing: {
      amount: 2,
      unit: "tbsp",
      grams: 34,
      description: "2 tablespoons",
    },
    nutritionPer100g: {
      calories: 172,
      protein: 0.8,
      fat: 0.6,
      carbs: 41,
      sugar: 33,
      sodium: 990,
    },
    icon: "sauce",
  },
  {
    id: "ranch-dressing",
    name: "Ranch Dressing",
    category: "condiments",
    defaultServing: {
      amount: 2,
      unit: "tbsp",
      grams: 30,
      description: "2 tablespoons",
    },
    nutritionPer100g: {
      calories: 450,
      protein: 1.5,
      fat: 47,
      carbs: 5.9,
      sodium: 918,
    },
    icon: "sauce",
  },
  {
    id: "italian-dressing",
    name: "Italian Dressing",
    category: "condiments",
    defaultServing: {
      amount: 2,
      unit: "tbsp",
      grams: 30,
      description: "2 tablespoons",
    },
    nutritionPer100g: {
      calories: 260,
      protein: 0.3,
      fat: 26,
      carbs: 6.7,
      sodium: 908,
    },
    icon: "sauce",
  },
  {
    id: "olive-oil",
    name: "Olive Oil",
    category: "condiments",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 14,
      description: "1 tablespoon",
    },
    nutritionPer100g: {
      calories: 884,
      protein: 0,
      fat: 100,
      carbs: 0,
      sodium: 2,
      vitaminE: 14,
      vitaminK: 60,
    },
    icon: "oil",
  },
  {
    id: "honey",
    name: "Honey",
    category: "condiments",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 21,
      description: "1 tablespoon",
    },
    nutritionPer100g: {
      calories: 304,
      protein: 0.3,
      fat: 0,
      carbs: 82,
      sugar: 82,
      sodium: 4,
    },
    icon: "honey",
  },
  {
    id: "maple-syrup",
    name: "Maple Syrup",
    category: "condiments",
    defaultServing: {
      amount: 1,
      unit: "tbsp",
      grams: 20,
      description: "1 tablespoon",
    },
    nutritionPer100g: {
      calories: 260,
      protein: 0,
      fat: 0.1,
      carbs: 67,
      sugar: 60,
      sodium: 12,
      manganese: 2.9,
    },
    icon: "syrup",
  },

  // ============================================================
  // PREPARED/PROCESSED FOODS (typically high sodium)
  // ============================================================
  {
    id: "pizza-slice",
    name: "Pizza (cheese)",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "slice",
      grams: 107,
      description: "1 slice",
    },
    nutritionPer100g: {
      calories: 266,
      protein: 11,
      fat: 10,
      carbs: 33,
      fiber: 2.3,
      sodium: 598,
      calcium: 201,
    },
    icon: "pizza",
  },
  {
    id: "hot-dog",
    name: "Hot Dog",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 52,
      description: "1 frankfurter",
    },
    nutritionPer100g: {
      calories: 290,
      protein: 10,
      fat: 26,
      carbs: 2,
      sodium: 1090,
      cholesterol: 70,
    },
    icon: "hotdog",
  },
  {
    id: "hamburger",
    name: "Hamburger (with bun)",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 165,
      description: "1 burger",
    },
    nutritionPer100g: {
      calories: 250,
      protein: 15,
      fat: 10,
      carbs: 24,
      fiber: 1.3,
      sodium: 520,
      iron: 2.4,
    },
    icon: "burger",
  },
  {
    id: "chicken-nuggets",
    name: "Chicken Nuggets",
    category: "prepared_foods",
    defaultServing: {
      amount: 5,
      unit: "piece",
      grams: 85,
      description: "5 pieces",
    },
    nutritionPer100g: {
      calories: 296,
      protein: 15,
      fat: 19,
      carbs: 17,
      sodium: 558,
      cholesterol: 41,
    },
    icon: "chicken",
  },
  {
    id: "french-fries",
    name: "French Fries",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "serving",
      grams: 117,
      description: "medium serving",
    },
    nutritionPer100g: {
      calories: 312,
      protein: 3.4,
      fat: 15,
      carbs: 41,
      fiber: 3.8,
      sodium: 210,
      potassium: 579,
    },
    icon: "fries",
  },
  {
    id: "mac-and-cheese",
    name: "Mac and Cheese",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 200,
      description: "1 cup",
    },
    nutritionPer100g: {
      calories: 164,
      protein: 6.5,
      fat: 7.4,
      carbs: 18,
      fiber: 0.9,
      sodium: 561,
      calcium: 130,
    },
    icon: "pasta",
  },
  {
    id: "ramen-instant",
    name: "Instant Ramen",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "serving",
      grams: 85,
      description: "1 package",
    },
    nutritionPer100g: {
      calories: 436,
      protein: 10,
      fat: 17,
      carbs: 62,
      fiber: 2.4,
      sodium: 1820,
      iron: 3.5,
    },
    icon: "noodles",
  },
  {
    id: "soup-chicken-noodle",
    name: "Chicken Noodle Soup",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 248,
      description: "1 cup",
    },
    nutritionPer100g: {
      calories: 31,
      protein: 1.8,
      fat: 0.9,
      carbs: 4.2,
      fiber: 0.3,
      sodium: 343,
    },
    icon: "soup",
  },
  {
    id: "soup-tomato",
    name: "Tomato Soup",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 248,
      description: "1 cup",
    },
    nutritionPer100g: {
      calories: 74,
      protein: 1.6,
      fat: 2,
      carbs: 12,
      fiber: 1.2,
      sodium: 471,
      vitaminA: 23,
      vitaminC: 10,
    },
    icon: "soup",
  },
  {
    id: "bacon",
    name: "Bacon (cooked)",
    category: "prepared_foods",
    defaultServing: {
      amount: 2,
      unit: "slice",
      grams: 16,
      description: "2 slices",
    },
    nutritionPer100g: {
      calories: 541,
      protein: 37,
      fat: 42,
      carbs: 1.4,
      sodium: 1717,
      cholesterol: 110,
    },
    icon: "bacon",
  },
  {
    id: "sausage",
    name: "Sausage (pork)",
    category: "prepared_foods",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 67,
      description: "1 link",
    },
    nutritionPer100g: {
      calories: 301,
      protein: 18,
      fat: 25,
      carbs: 1,
      sodium: 749,
      iron: 1.4,
      vitaminB12: 1.1,
    },
    icon: "sausage",
  },
  {
    id: "deli-ham",
    name: "Deli Ham",
    category: "prepared_foods",
    defaultServing: {
      amount: 2,
      unit: "slice",
      grams: 56,
      description: "2 slices",
    },
    nutritionPer100g: {
      calories: 145,
      protein: 18,
      fat: 5.5,
      carbs: 3.8,
      sodium: 1203,
      iron: 0.8,
    },
    icon: "ham",
  },
  {
    id: "deli-turkey",
    name: "Deli Turkey",
    category: "prepared_foods",
    defaultServing: {
      amount: 2,
      unit: "slice",
      grams: 56,
      description: "2 slices",
    },
    nutritionPer100g: {
      calories: 104,
      protein: 17,
      fat: 1.7,
      carbs: 4.2,
      sodium: 1015,
      iron: 0.6,
    },
    icon: "turkey",
  },
  {
    id: "pepperoni",
    name: "Pepperoni",
    category: "prepared_foods",
    defaultServing: {
      amount: 14,
      unit: "slice",
      grams: 28,
      description: "14 slices",
    },
    nutritionPer100g: {
      calories: 504,
      protein: 23,
      fat: 44,
      carbs: 1.2,
      sodium: 1761,
      vitaminB12: 1.3,
    },
    icon: "pepperoni",
  },
  {
    id: "canned-corn",
    name: "Canned Corn",
    category: "prepared_foods",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 82,
      description: "1/2 cup",
    },
    nutritionPer100g: {
      calories: 79,
      protein: 2.3,
      fat: 1.2,
      carbs: 16,
      fiber: 1.8,
      sodium: 286,
      potassium: 170,
    },
    icon: "corn",
  },
  {
    id: "canned-beans",
    name: "Canned Beans (kidney)",
    category: "prepared_foods",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 128,
      description: "1/2 cup",
    },
    nutritionPer100g: {
      calories: 84,
      protein: 5.5,
      fat: 0.3,
      carbs: 15,
      fiber: 5.3,
      sodium: 379,
      iron: 1.6,
    },
    icon: "beans",
  },

  // ============================================================
  // BEVERAGES
  // ============================================================
  {
    id: "coffee-black",
    name: "Coffee (black)",
    category: "beverages",
    defaultServing: {
      amount: 8,
      unit: "fl_oz",
      grams: 240,
      description: "8 oz cup",
    },
    nutritionPer100g: {
      calories: 1,
      protein: 0.1,
      fat: 0,
      carbs: 0,
      sodium: 5,
      caffeine: 40,
    },
    icon: "coffee",
  },
  {
    id: "green-tea",
    name: "Green Tea",
    category: "beverages",
    defaultServing: {
      amount: 8,
      unit: "fl_oz",
      grams: 240,
      description: "8 oz cup",
    },
    nutritionPer100g: {
      calories: 1,
      protein: 0,
      fat: 0,
      carbs: 0,
      sodium: 1,
      caffeine: 12,
    },
    icon: "tea",
  },
  {
    id: "orange-juice",
    name: "Orange Juice",
    category: "beverages",
    defaultServing: {
      amount: 8,
      unit: "fl_oz",
      grams: 248,
      description: "8 oz glass",
    },
    nutritionPer100g: {
      calories: 45,
      protein: 0.7,
      fat: 0.2,
      carbs: 10,
      sugar: 8,
      sodium: 1,
      vitaminC: 50,
    },
    icon: "juice",
  },
  {
    id: "smoothie",
    name: "Fruit Smoothie",
    category: "beverages",
    defaultServing: {
      amount: 12,
      unit: "fl_oz",
      grams: 340,
      description: "12 oz",
    },
    nutritionPer100g: {
      calories: 65,
      protein: 1.5,
      fat: 0.5,
      carbs: 14,
      fiber: 1.5,
      sodium: 15,
    },
    icon: "smoothie",
  },
  {
    id: "soda-cola",
    name: "Cola (regular)",
    category: "beverages",
    defaultServing: {
      amount: 12,
      unit: "fl_oz",
      grams: 355,
      description: "12 oz can",
    },
    nutritionPer100g: {
      calories: 42,
      protein: 0,
      fat: 0,
      carbs: 11,
      sugar: 11,
      sodium: 4,
      caffeine: 10,
    },
    icon: "soda",
  },
  {
    id: "sports-drink",
    name: "Sports Drink",
    category: "beverages",
    defaultServing: {
      amount: 12,
      unit: "fl_oz",
      grams: 355,
      description: "12 oz",
    },
    nutritionPer100g: {
      calories: 26,
      protein: 0,
      fat: 0,
      carbs: 6.5,
      sugar: 6,
      sodium: 41,
      potassium: 12,
    },
    icon: "drink",
  },
  {
    id: "energy-drink",
    name: "Energy Drink",
    category: "beverages",
    defaultServing: {
      amount: 8.4,
      unit: "fl_oz",
      grams: 250,
      description: "1 can",
    },
    nutritionPer100g: {
      calories: 45,
      protein: 0.4,
      fat: 0,
      carbs: 11,
      sugar: 11,
      sodium: 80,
      caffeine: 32,
    },
    icon: "drink",
  },
  {
    id: "almond-milk",
    name: "Almond Milk (unsweetened)",
    category: "beverages",
    defaultServing: {
      amount: 1,
      unit: "cup",
      grams: 240,
      description: "1 cup",
    },
    nutritionPer100g: {
      calories: 15,
      protein: 0.6,
      fat: 1.1,
      carbs: 0.6,
      sodium: 72,
      calcium: 184,
      vitaminD: 1,
    },
    icon: "milk",
  },
  {
    id: "coconut-water",
    name: "Coconut Water",
    category: "beverages",
    defaultServing: {
      amount: 8,
      unit: "fl_oz",
      grams: 240,
      description: "8 oz",
    },
    nutritionPer100g: {
      calories: 19,
      protein: 0.7,
      fat: 0.2,
      carbs: 3.7,
      sugar: 2.6,
      sodium: 105,
      potassium: 250,
    },
    icon: "coconut",
  },

  // ============================================================
  // SWEETS & DESSERTS
  // ============================================================
  {
    id: "ice-cream",
    name: "Ice Cream (vanilla)",
    category: "sweets",
    defaultServing: {
      amount: 0.5,
      unit: "cup",
      grams: 66,
      description: "1/2 cup",
    },
    nutritionPer100g: {
      calories: 207,
      protein: 3.5,
      fat: 11,
      carbs: 24,
      sugar: 21,
      sodium: 80,
      calcium: 128,
    },
    icon: "ice-cream",
  },
  {
    id: "cookie-chocolate-chip",
    name: "Chocolate Chip Cookie",
    category: "sweets",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 30,
      description: "1 medium cookie",
    },
    nutritionPer100g: {
      calories: 488,
      protein: 5.1,
      fat: 24,
      carbs: 64,
      sugar: 36,
      sodium: 315,
      iron: 2.4,
    },
    icon: "cookie",
  },
  {
    id: "brownie",
    name: "Brownie",
    category: "sweets",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 50,
      description: "1 piece (2-inch)",
    },
    nutritionPer100g: {
      calories: 405,
      protein: 4.7,
      fat: 16,
      carbs: 64,
      sugar: 40,
      sodium: 268,
      iron: 2.3,
    },
    icon: "brownie",
  },
  {
    id: "cake-chocolate",
    name: "Chocolate Cake",
    category: "sweets",
    defaultServing: {
      amount: 1,
      unit: "slice",
      grams: 95,
      description: "1 slice",
    },
    nutritionPer100g: {
      calories: 389,
      protein: 4.5,
      fat: 17,
      carbs: 57,
      sugar: 44,
      sodium: 418,
      iron: 2.3,
    },
    icon: "cake",
  },
  {
    id: "donut",
    name: "Donut (glazed)",
    category: "sweets",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 60,
      description: "1 donut",
    },
    nutritionPer100g: {
      calories: 421,
      protein: 5.4,
      fat: 23,
      carbs: 49,
      sugar: 25,
      sodium: 340,
      iron: 1.7,
    },
    icon: "donut",
  },
  {
    id: "candy-bar",
    name: "Candy Bar (chocolate)",
    category: "sweets",
    defaultServing: {
      amount: 1,
      unit: "piece",
      grams: 44,
      description: "1 bar",
    },
    nutritionPer100g: {
      calories: 535,
      protein: 7.7,
      fat: 30,
      carbs: 60,
      sugar: 52,
      sodium: 79,
      calcium: 189,
    },
    icon: "candy",
  },
];

/**
 * FoodDiaryService - Main class for food tracking operations
 * Uses PostgreSQL for persistent storage with in-memory fallback
 */
class FoodDiaryService {
  // In-memory fallback storage
  private entries: Map<string, FoodDiaryEntry> = new Map();
  private userEntries: Map<string, Set<string>> = new Map(); // userId -> entryIds
  private favorites: Map<string, UserFoodFavorite[]> = new Map(); // userId -> favorites
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private initialized = false;

  constructor() {
    // Lazy initialization to avoid build-time issues
  }

  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    _logger.debug("FoodDiaryService initialized");
  }

  // ============================================================
  // CRUD Operations for Food Diary Entries
  // ============================================================

  /**
   * Create a new food diary entry
   */
  async createEntry(
    userId: string,
    input: CreateFoodDiaryEntryInput,
  ): Promise<FoodDiaryEntry> {
    await this.ensureInitialized();
    const db = await getDbModule();

    const entryId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    // Calculate nutrition if not provided
    let nutrition = input.nutrition || {};
    let nutritionConfidence: "high" | "medium" | "low" = "medium";

    if (input.foodSource === "quick" && input.sourceId) {
      const preset = this.getQuickFoodPreset(input.sourceId);
      if (preset) {
        nutrition = this.calculateNutritionFromPreset(
          preset,
          input.serving,
          input.quantity,
        );
        nutritionConfidence = "high";
      }
    } else if (input.foodSource === "custom" && !input.nutrition) {
      nutritionConfidence = "low";
    }

    // Get astrological context
    const astrologicalContext = await this.captureAstrologicalContext();

    const entry: FoodDiaryEntry = {
      id: entryId,
      userId,
      foodName: input.foodName,
      foodSource: input.foodSource,
      sourceId: input.sourceId,
      brandName: input.brandName,
      date: input.date,
      mealType: input.mealType,
      time: input.time,
      serving: input.serving,
      quantity: input.quantity,
      nutrition,
      nutritionConfidence,
      elementalProperties: input.elementalProperties,
      notes: input.notes,
      tags: input.tags,
      isFavorite: false,
      astrologicalContext,
      createdAt: now,
      updatedAt: now,
    };

    // Try PostgreSQL first
    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO food_diary_entries (
            id, user_id, food_name, food_source, source_id, brand_name,
            date, meal_type, time, serving_amount, serving_unit, serving_grams,
            serving_description, quantity, calories, protein, carbs, fat, fiber,
            sugar, sodium, nutrition_confidence, elemental_fire, elemental_water,
            elemental_earth, elemental_air, notes, tags, is_favorite,
            astrological_context, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
            $27, $28, $29, $30, $31, $32
          )`,
          [
            entryId,
            userId,
            input.foodName,
            input.foodSource,
            input.sourceId || null,
            input.brandName || null,
            input.date,
            input.mealType,
            input.time,
            input.serving.amount,
            input.serving.unit,
            input.serving.grams || null,
            input.serving.description || null,
            input.quantity,
            nutrition.calories || null,
            nutrition.protein || null,
            nutrition.carbs || null,
            nutrition.fat || null,
            nutrition.fiber || null,
            nutrition.sugar || null,
            nutrition.sodium || null,
            nutritionConfidence,
            input.elementalProperties?.Fire || null,
            input.elementalProperties?.Water || null,
            input.elementalProperties?.Earth || null,
            input.elementalProperties?.Air || null,
            input.notes || null,
            input.tags || [],
            false,
            JSON.stringify(astrologicalContext),
            now,
            now,
          ],
        );
        _logger.info("Food diary entry created in PostgreSQL", {
          userId,
          entryId,
        });
      } catch (error) {
        _logger.error(
          "PostgreSQL entry creation failed, using in-memory:",
          error as any,
        );
      }
    }

    // Always update in-memory cache
    this.entries.set(entryId, entry);
    this.addToUserIndex(userId, entryId);
    this.invalidateCache(userId);

    _logger.info("Food diary entry created", {
      userId,
      entryId,
      food: input.foodName,
    });
    return entry;
  }

  /**
   * Get a specific entry by ID
   */
  async getEntry(entryId: string): Promise<FoodDiaryEntry | null> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Try PostgreSQL first
    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT * FROM food_diary_entries WHERE id = $1`,
          [entryId],
        );
        if (result.rows.length > 0) {
          return this.rowToFoodDiaryEntry(result.rows[0]);
        }
      } catch (error) {
        _logger.warn("PostgreSQL query failed, using in-memory:", error as any);
      }
    }

    // Fallback to in-memory
    return this.entries.get(entryId) || null;
  }

  /**
   * Convert database row to FoodDiaryEntry
   */
  private rowToFoodDiaryEntry(row: any): FoodDiaryEntry {
    return {
      id: row.id,
      userId: row.user_id,
      foodName: row.food_name,
      foodSource: row.food_source,
      sourceId: row.source_id,
      brandName: row.brand_name,
      date: new Date(row.date),
      mealType: row.meal_type,
      time: row.time,
      serving: {
        amount: parseFloat(row.serving_amount) || 1,
        unit: row.serving_unit,
        grams: parseFloat(row.serving_grams) || 100,
        description: row.serving_description,
      },
      quantity: parseFloat(row.quantity) || 1,
      nutrition: {
        calories: row.calories ? parseFloat(row.calories) : undefined,
        protein: row.protein ? parseFloat(row.protein) : undefined,
        carbs: row.carbs ? parseFloat(row.carbs) : undefined,
        fat: row.fat ? parseFloat(row.fat) : undefined,
        fiber: row.fiber ? parseFloat(row.fiber) : undefined,
        sugar: row.sugar ? parseFloat(row.sugar) : undefined,
        sodium: row.sodium ? parseFloat(row.sodium) : undefined,
      },
      nutritionConfidence: row.nutrition_confidence,
      elementalProperties: row.elemental_fire
        ? {
            Fire: parseFloat(row.elemental_fire),
            Water: parseFloat(row.elemental_water),
            Earth: parseFloat(row.elemental_earth),
            Air: parseFloat(row.elemental_air),
          }
        : undefined,
      rating: row.rating ? (parseFloat(row.rating) as FoodRating) : undefined,
      moodTags: row.mood_tags || [],
      notes: row.notes,
      wouldEatAgain: row.would_eat_again,
      isFavorite: row.is_favorite,
      tags: row.tags || [],
      astrologicalContext:
        typeof row.astrological_context === "string"
          ? JSON.parse(row.astrological_context)
          : row.astrological_context,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Update an existing entry
   */
  async updateEntry(
    userId: string,
    input: UpdateFoodDiaryEntryInput,
  ): Promise<FoodDiaryEntry | null> {
    const entry = this.entries.get(input.id);
    if (!entry || entry.userId !== userId) {
      return null;
    }

    // Recalculate nutrition if serving/quantity changed
    if (input.serving || input.quantity) {
      const newServing = input.serving || entry.serving;
      const newQuantity = input.quantity ?? entry.quantity;

      if (entry.foodSource === "quick" && entry.sourceId) {
        const preset = this.getQuickFoodPreset(entry.sourceId);
        if (preset) {
          entry.nutrition = this.calculateNutritionFromPreset(
            preset,
            newServing,
            newQuantity,
          );
        }
      }
      entry.serving = newServing;
      entry.quantity = newQuantity;
    }

    // Update other fields
    if (input.rating !== undefined) entry.rating = input.rating;
    if (input.moodTags !== undefined) entry.moodTags = input.moodTags;
    if (input.notes !== undefined) entry.notes = input.notes;
    if (input.wouldEatAgain !== undefined)
      entry.wouldEatAgain = input.wouldEatAgain;
    if (input.isFavorite !== undefined) entry.isFavorite = input.isFavorite;
    if (input.tags !== undefined) entry.tags = input.tags;

    entry.updatedAt = new Date();
    this.entries.set(input.id, entry);
    this.invalidateCache(userId);
    this.saveToStorage();

    _logger.info("Food diary entry updated", { userId, entryId: input.id });
    return entry;
  }

  /**
   * Delete an entry
   */
  async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    const entry = this.entries.get(entryId);
    if (!entry || entry.userId !== userId) {
      return false;
    }

    this.entries.delete(entryId);
    this.removeFromUserIndex(userId, entryId);
    this.invalidateCache(userId);
    this.saveToStorage();

    _logger.info("Food diary entry deleted", { userId, entryId });
    return true;
  }

  /**
   * Rate a food entry
   */
  async rateEntry(
    userId: string,
    entryId: string,
    rating: FoodRating,
    moodTags?: MoodTag[],
  ): Promise<FoodDiaryEntry | null> {
    return this.updateEntry(userId, {
      id: entryId,
      rating,
      moodTags,
    });
  }

  // ============================================================
  // Query Operations
  // ============================================================

  /**
   * Get entries for a user with optional filters
   */
  async getEntries(
    userId: string,
    filters?: FoodDiaryFilters,
  ): Promise<FoodDiaryEntry[]> {
    await this.ensureInitialized();
    const db = await getDbModule();

    // Try PostgreSQL first
    if (db) {
      try {
        let query = `SELECT * FROM food_diary_entries WHERE user_id = $1`;
        const params: any[] = [userId];
        let paramIndex = 2;

        // Build filter conditions
        if (filters?.startDate) {
          query += ` AND date >= $${paramIndex++}`;
          params.push(filters.startDate);
        }
        if (filters?.endDate) {
          query += ` AND date <= $${paramIndex++}`;
          params.push(filters.endDate);
        }
        if (filters?.mealTypes && filters.mealTypes.length > 0) {
          query += ` AND meal_type = ANY($${paramIndex++})`;
          params.push(filters.mealTypes);
        }
        if (filters?.isFavorite !== undefined) {
          query += ` AND is_favorite = $${paramIndex++}`;
          params.push(filters.isFavorite);
        }
        if (filters?.searchQuery) {
          query += ` AND food_name ILIKE $${paramIndex++}`;
          params.push(`%${filters.searchQuery}%`);
        }

        query += ` ORDER BY date DESC, time DESC`;

        const result = await db.executeQuery(query, params);
        return result.rows.map((row: any) => this.rowToFoodDiaryEntry(row));
      } catch (error) {
        _logger.warn("PostgreSQL query failed, using in-memory:", error as any);
      }
    }

    // Fallback to in-memory
    const userEntryIds = this.userEntries.get(userId);
    if (!userEntryIds) return [];

    let entries = Array.from(userEntryIds)
      .map((id) => this.entries.get(id))
      .filter((e): e is FoodDiaryEntry => e !== undefined);

    if (filters) {
      entries = this.applyFilters(entries, filters);
    }

    // Sort by date and time descending
    return entries.sort((a, b) => {
      const dateCompare =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
  }

  /**
   * Get entries for a specific day
   */
  async getDayEntries(userId: string, date: Date): Promise<FoodDiaryEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getEntries(userId, {
      startDate: startOfDay,
      endDate: endOfDay,
    });
  }

  /**
   * Get daily summary for a specific date
   */
  async getDailySummary(
    userId: string,
    date: Date,
  ): Promise<DailyFoodDiarySummary> {
    const cacheKey = `daily_summary_${userId}_${date.toISOString().split("T")[0]}`;
    const cached = userCache.get<DailyFoodDiarySummary>(cacheKey);
    if (cached) return cached;

    const entries = await this.getDayEntries(userId, date);
    const summary = this.buildDailySummary(entries, date);

    userCache.set(cacheKey, summary, this.CACHE_TTL);
    return summary;
  }

  /**
   * Get weekly summary
   */
  async getWeeklySummary(
    userId: string,
    weekStartDate: Date,
  ): Promise<WeeklyFoodDiarySummary> {
    const cacheKey = `weekly_summary_${userId}_${weekStartDate.toISOString().split("T")[0]}`;
    const cached = userCache.get<WeeklyFoodDiarySummary>(cacheKey);
    if (cached) return cached;

    const dailySummaries: DailyFoodDiarySummary[] = [];
    const currentDate = new Date(weekStartDate);

    for (let i = 0; i < 7; i++) {
      const daySummary = await this.getDailySummary(
        userId,
        new Date(currentDate),
      );
      dailySummaries.push(daySummary);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const summary = this.buildWeeklySummary(
      dailySummaries,
      weekStartDate,
      weekEndDate,
    );
    userCache.set(cacheKey, summary, this.CACHE_TTL);
    return summary;
  }

  /**
   * Get statistics for a user
   */
  async getStats(userId: string): Promise<FoodDiaryStats> {
    const entries = await this.getEntries(userId);
    return this.calculateStats(entries);
  }

  // ============================================================
  // Quick Foods & Favorites
  // ============================================================

  /**
   * Get all quick food presets
   */
  getQuickFoodPresets(category?: QuickFoodCategory): QuickFoodPreset[] {
    if (category) {
      return QUICK_FOOD_PRESETS.filter((p) => p.category === category);
    }
    return QUICK_FOOD_PRESETS;
  }

  /**
   * Get a specific quick food preset
   */
  getQuickFoodPreset(id: string): QuickFoodPreset | undefined {
    return QUICK_FOOD_PRESETS.find((p) => p.id === id);
  }

  /**
   * Search foods (quick presets + user favorites)
   */
  async searchFoods(
    userId: string,
    query: string,
    limit = 20,
  ): Promise<FoodSearchResult[]> {
    const results: FoodSearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Search quick presets
    for (const preset of QUICK_FOOD_PRESETS) {
      if (preset.name.toLowerCase().includes(queryLower)) {
        results.push({
          id: preset.id,
          name: preset.name,
          source: "quick",
          category: preset.category,
          nutritionPer100g: preset.nutritionPer100g,
          commonServings: [preset.defaultServing],
          matchScore: preset.name.toLowerCase().startsWith(queryLower)
            ? 1
            : 0.8,
        });
      }
    }

    // Search user favorites
    const userFavorites = this.favorites.get(userId) || [];
    for (const favorite of userFavorites) {
      if (favorite.foodName.toLowerCase().includes(queryLower)) {
        results.push({
          id: favorite.id,
          name: favorite.foodName,
          source: "favorite",
          brandName: favorite.brandName,
          nutritionPer100g: favorite.customNutrition,
          matchScore: favorite.foodName.toLowerCase().startsWith(queryLower)
            ? 0.95
            : 0.75,
          isUserFavorite: true,
          lastEaten: favorite.lastEaten,
        });
      }
    }

    // Sort by match score and limit
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  }

  /**
   * Add a food to favorites
   */
  async addToFavorites(
    userId: string,
    entryId: string,
  ): Promise<UserFoodFavorite | null> {
    const entry = this.entries.get(entryId);
    if (!entry || entry.userId !== userId) return null;

    // Update entry
    entry.isFavorite = true;
    this.entries.set(entryId, entry);

    // Add to favorites list
    const userFavorites = this.favorites.get(userId) || [];
    const existingIdx = userFavorites.findIndex(
      (f) => f.foodName === entry.foodName,
    );

    if (existingIdx >= 0) {
      // Update existing
      userFavorites[existingIdx].timesEaten++;
      userFavorites[existingIdx].lastEaten = entry.date;
      if (entry.rating) {
        const current =
          userFavorites[existingIdx].averageRating || entry.rating;
        userFavorites[existingIdx].averageRating = (current + entry.rating) / 2;
      }
    } else {
      // Add new favorite
      const favorite: UserFoodFavorite = {
        id: `fav_${Date.now()}`,
        userId,
        foodName: entry.foodName,
        foodSource: entry.foodSource,
        sourceId: entry.sourceId,
        brandName: entry.brandName,
        customServing: entry.serving,
        customNutrition: entry.nutrition,
        timesEaten: 1,
        averageRating: entry.rating,
        lastEaten: entry.date,
        createdAt: new Date(),
      };
      userFavorites.push(favorite);
    }

    this.favorites.set(userId, userFavorites);
    this.saveToStorage();
    return userFavorites[
      existingIdx >= 0 ? existingIdx : userFavorites.length - 1
    ];
  }

  /**
   * Get user's favorites
   */
  async getFavorites(userId: string): Promise<UserFoodFavorite[]> {
    return this.favorites.get(userId) || [];
  }

  // ============================================================
  // Insights & Recommendations
  // ============================================================

  /**
   * Generate insights from food diary
   */
  async generateInsights(userId: string): Promise<FoodInsight[]> {
    const entries = await this.getEntries(userId);
    if (entries.length < 5) return []; // Need enough data

    const insights: FoodInsight[] = [];
    const patterns = this.analyzePatterns(entries);
    const nutritionService = getNutritionTrackingService();
    const dailyTargets = nutritionService.getDailyTargets();

    // Check for nutritional gaps
    const recentEntries = entries.slice(0, 21); // Last ~3 weeks
    const avgNutrition = this.calculateAverageNutrition(recentEntries);

    // Protein gap
    if (avgNutrition.protein < dailyTargets.protein * 0.8) {
      insights.push({
        id: `insight_protein_${Date.now()}`,
        type: "nutrition_gap",
        priority: "high",
        title: "Protein Intake Below Target",
        description: `Your average daily protein intake (${Math.round(avgNutrition.protein)}g) is below your target (${dailyTargets.protein}g).`,
        recommendation:
          "Consider adding more lean proteins like chicken, fish, eggs, or legumes to your meals.",
        createdAt: new Date(),
      });
    }

    // Fiber gap
    if (avgNutrition.fiber < dailyTargets.fiber * 0.7) {
      insights.push({
        id: `insight_fiber_${Date.now()}`,
        type: "nutrition_gap",
        priority: "medium",
        title: "Could Use More Fiber",
        description: `Your fiber intake (${Math.round(avgNutrition.fiber)}g) is below the recommended ${dailyTargets.fiber}g.`,
        recommendation:
          "Add more fruits, vegetables, and whole grains to your diet.",
        relatedFoods: ["oatmeal", "berries-mixed", "broccoli", "almonds"],
        createdAt: new Date(),
      });
    }

    // Sodium excess
    if (avgNutrition.sodium > dailyTargets.sodium * 1.2) {
      insights.push({
        id: `insight_sodium_${Date.now()}`,
        type: "excess_warning",
        priority: "medium",
        title: "High Sodium Intake",
        description: `Your average sodium intake (${Math.round(avgNutrition.sodium)}mg) exceeds the recommended limit.`,
        recommendation:
          "Try reducing processed foods and checking labels for sodium content.",
        createdAt: new Date(),
      });
    }

    // Positive patterns - tracking consistency
    if (patterns.topFoods.length >= 5) {
      insights.push({
        id: `insight_variety_${Date.now()}`,
        type: "positive_pattern",
        priority: "low",
        title: "Good Food Variety",
        description: `You're eating a diverse range of foods with ${patterns.topFoods.length} different items tracked.`,
        createdAt: new Date(),
      });
    }

    // High-rated foods pattern
    if (patterns.topRatedFoods.length > 0) {
      const topRated = patterns.topRatedFoods[0];
      insights.push({
        id: `insight_favorite_${Date.now()}`,
        type: "rating_pattern",
        priority: "low",
        title: "Your Top Rated Food",
        description: `${topRated.name} has your highest average rating (${topRated.rating.toFixed(1)} stars).`,
        relatedFoods: [topRated.name],
        createdAt: new Date(),
      });
    }

    return insights;
  }

  // ============================================================
  // Private Helper Methods
  // ============================================================

  private calculateNutritionFromPreset(
    preset: QuickFoodPreset,
    serving: ServingSize,
    quantity: number,
  ): Partial<NutritionalSummary> {
    const multiplier = (serving.grams * quantity) / 100;
    const result: Partial<NutritionalSummary> = {};

    for (const [key, value] of Object.entries(preset.nutritionPer100g)) {
      if (typeof value === "number") {
        result[key as keyof NutritionalSummary] =
          Math.round(value * multiplier * 10) / 10;
      }
    }

    return result;
  }

  private applyFilters(
    entries: FoodDiaryEntry[],
    filters: FoodDiaryFilters,
  ): FoodDiaryEntry[] {
    return entries.filter((entry) => {
      if (filters.startDate && new Date(entry.date) < filters.startDate)
        return false;
      if (filters.endDate && new Date(entry.date) > filters.endDate)
        return false;
      if (filters.mealTypes && !filters.mealTypes.includes(entry.mealType))
        return false;
      if (
        filters.foodSources &&
        !filters.foodSources.includes(entry.foodSource)
      )
        return false;
      if (
        filters.minRating !== undefined &&
        (!entry.rating || entry.rating < filters.minRating)
      )
        return false;
      if (
        filters.maxRating !== undefined &&
        entry.rating &&
        entry.rating > filters.maxRating
      )
        return false;
      if (
        filters.isFavorite !== undefined &&
        entry.isFavorite !== filters.isFavorite
      )
        return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!entry.foodName.toLowerCase().includes(query)) return false;
      }
      if (filters.moodTags && filters.moodTags.length > 0) {
        if (
          !entry.moodTags ||
          !filters.moodTags.some((t) => entry.moodTags?.includes(t))
        )
          return false;
      }
      if (filters.tags && filters.tags.length > 0) {
        if (!entry.tags || !filters.tags.some((t) => entry.tags?.includes(t)))
          return false;
      }
      return true;
    });
  }

  private buildDailySummary(
    entries: FoodDiaryEntry[],
    date: Date,
  ): DailyFoodDiarySummary {
    const summary: DailyFoodDiarySummary = {
      date,
      entries,
      mealBreakdown: {
        breakfast: entries.filter((e) => e.mealType === "breakfast"),
        lunch: entries.filter((e) => e.mealType === "lunch"),
        dinner: entries.filter((e) => e.mealType === "dinner"),
        snack: entries.filter((e) => e.mealType === "snack"),
      },
      totalNutrition: createEmptyNutritionalSummary(),
      goalProgress: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      moodSummary: {} as Record<MoodTag, number>,
      elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    };

    // Aggregate nutrition
    for (const entry of entries) {
      for (const [key, value] of Object.entries(entry.nutrition)) {
        if (typeof value === "number" && key in summary.totalNutrition) {
          (summary.totalNutrition as any)[key] += value;
        }
      }

      // Aggregate mood tags
      if (entry.moodTags) {
        for (const mood of entry.moodTags) {
          summary.moodSummary[mood] = (summary.moodSummary[mood] || 0) + 1;
        }
      }

      // Aggregate elemental properties
      if (entry.elementalProperties) {
        for (const [element, value] of Object.entries(
          entry.elementalProperties,
        )) {
          (summary.elementalBalance as any)[element] += value / entries.length;
        }
      }
    }

    // Calculate goal progress
    const targets = getNutritionTrackingService().getDailyTargets();
    summary.nutritionGoals = targets;
    summary.goalProgress = {
      calories:
        targets.calories > 0
          ? Math.round(
              (summary.totalNutrition.calories / targets.calories) * 100,
            )
          : 0,
      protein:
        targets.protein > 0
          ? Math.round((summary.totalNutrition.protein / targets.protein) * 100)
          : 0,
      carbs:
        targets.carbs > 0
          ? Math.round((summary.totalNutrition.carbs / targets.carbs) * 100)
          : 0,
      fat:
        targets.fat > 0
          ? Math.round((summary.totalNutrition.fat / targets.fat) * 100)
          : 0,
      fiber:
        targets.fiber > 0
          ? Math.round((summary.totalNutrition.fiber / targets.fiber) * 100)
          : 0,
    };

    // Calculate average rating
    const ratedEntries = entries.filter((e) => e.rating !== undefined);
    if (ratedEntries.length > 0) {
      summary.averageRating =
        ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
        ratedEntries.length;
    }

    return summary;
  }

  private buildWeeklySummary(
    dailySummaries: DailyFoodDiarySummary[],
    weekStartDate: Date,
    weekEndDate: Date,
  ): WeeklyFoodDiarySummary {
    const allEntries = dailySummaries.flatMap((d) => d.entries);
    const patterns = this.analyzePatterns(allEntries);

    // Calculate weekly totals and averages
    const weeklyTotals = createEmptyNutritionalSummary();
    const daysWithEntries = dailySummaries.filter(
      (d) => d.entries.length > 0,
    ).length;

    for (const day of dailySummaries) {
      for (const [key, value] of Object.entries(day.totalNutrition)) {
        if (typeof value === "number") {
          (weeklyTotals as any)[key] += value;
        }
      }
    }

    const averageDaily = createEmptyNutritionalSummary();
    if (daysWithEntries > 0) {
      for (const [key, value] of Object.entries(weeklyTotals)) {
        if (typeof value === "number") {
          (averageDaily as any)[key] =
            Math.round((value / daysWithEntries) * 10) / 10;
        }
      }
    }

    const weeklyTargets = getNutritionTrackingService().getWeeklyTargets();

    return {
      weekStartDate,
      weekEndDate,
      dailySummaries,
      totalEntries: allEntries.length,
      averageDailyNutrition: averageDaily,
      weeklyNutritionTotals: weeklyTotals,
      weeklyGoals: weeklyTargets,
      goalCompliance: {
        overall: this.calculateOverallCompliance(weeklyTotals, weeklyTargets),
        byNutrient: this.calculateNutrientCompliance(
          weeklyTotals,
          weeklyTargets,
        ),
        bestDays: this.findBestDays(dailySummaries),
        worstDays: this.findWorstDays(dailySummaries),
      },
      patterns,
      insights: [], // Will be populated separately
    };
  }

  private analyzePatterns(entries: FoodDiaryEntry[]): FoodPatterns {
    const foodCounts: Record<string, { count: number; ratings: number[] }> = {};

    for (const entry of entries) {
      if (!foodCounts[entry.foodName]) {
        foodCounts[entry.foodName] = { count: 0, ratings: [] };
      }
      foodCounts[entry.foodName].count++;
      if (entry.rating) {
        foodCounts[entry.foodName].ratings.push(entry.rating);
      }
    }

    const topFoods = Object.entries(foodCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        averageRating:
          data.ratings.length > 0
            ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
            : undefined,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topRatedFoods = Object.entries(foodCounts)
      .filter(([, data]) => data.ratings.length >= 2)
      .map(([name, data]) => ({
        name,
        rating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
        count: data.count,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Calculate elemental trends
    const dominantElement = this.calculateDominantElement(entries);

    return {
      topFoods,
      topRatedFoods,
      avoidedFoods: [],
      averageMealTimes: this.calculateAverageMealTimes(entries),
      snackingFrequency:
        entries.filter((e) => e.mealType === "snack").length /
        Math.max(this.getUniqueDays(entries), 1),
      proteinTrend: "stable",
      fiberTrend: "stable",
      calorieVariance: 0,
      dominantElement,
      elementalTrends: {
        Fire: "stable",
        Water: "stable",
        Earth: "stable",
        Air: "stable",
      },
      moodFoodCorrelations: [],
    };
  }

  private calculateAverageNutrition(
    entries: FoodDiaryEntry[],
  ): NutritionalSummary {
    const total = createEmptyNutritionalSummary();
    const days = this.getUniqueDays(entries);

    for (const entry of entries) {
      for (const [key, value] of Object.entries(entry.nutrition)) {
        if (typeof value === "number" && key in total) {
          (total as any)[key] += value;
        }
      }
    }

    // Average per day
    if (days > 0) {
      for (const key of Object.keys(total)) {
        (total as any)[key] = (total as any)[key] / days;
      }
    }

    return total;
  }

  private calculateStats(entries: FoodDiaryEntry[]): FoodDiaryStats {
    const uniqueDays = this.getUniqueDays(entries);
    const ratedEntries = entries.filter((e) => e.rating !== undefined);
    const ratingDistribution: Record<number, number> = {};

    for (const entry of ratedEntries) {
      const rating = Math.floor(entry.rating || 0);
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    }

    const targets = getNutritionTrackingService().getDailyTargets();
    const entriesByDay = this.groupEntriesByDay(entries);
    let daysMetCalorieGoal = 0;
    let daysMetProteinGoal = 0;
    let totalCalories = 0;
    let totalProtein = 0;

    for (const dayEntries of Object.values(entriesByDay)) {
      const dayCalories = dayEntries.reduce(
        (sum, e) => sum + (e.nutrition.calories || 0),
        0,
      );
      const dayProtein = dayEntries.reduce(
        (sum, e) => sum + (e.nutrition.protein || 0),
        0,
      );
      totalCalories += dayCalories;
      totalProtein += dayProtein;
      if (
        dayCalories >= targets.calories * 0.9 &&
        dayCalories <= targets.calories * 1.1
      ) {
        daysMetCalorieGoal++;
      }
      if (dayProtein >= targets.protein * 0.9) {
        daysMetProteinGoal++;
      }
    }

    return {
      totalEntries: entries.length,
      totalDaysTracked: uniqueDays,
      averageEntriesPerDay: uniqueDays > 0 ? entries.length / uniqueDays : 0,
      trackingStreak: this.calculateCurrentStreak(entries),
      longestStreak: this.calculateLongestStreak(entries),
      startDate:
        entries.length > 0
          ? new Date(
              Math.min(...entries.map((e) => new Date(e.date).getTime())),
            )
          : new Date(),
      lastEntryDate:
        entries.length > 0
          ? new Date(
              Math.max(...entries.map((e) => new Date(e.date).getTime())),
            )
          : new Date(),
      totalRatedEntries: ratedEntries.length,
      averageRating:
        ratedEntries.length > 0
          ? ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
            ratedEntries.length
          : 0,
      ratingDistribution,
      daysMetCalorieGoal,
      daysMetProteinGoal,
      averageCalories: uniqueDays > 0 ? totalCalories / uniqueDays : 0,
      averageProtein: uniqueDays > 0 ? totalProtein / uniqueDays : 0,
    };
  }

  private getUniqueDays(entries: FoodDiaryEntry[]): number {
    const days = new Set(
      entries.map((e) => new Date(e.date).toISOString().split("T")[0]),
    );
    return days.size;
  }

  private groupEntriesByDay(
    entries: FoodDiaryEntry[],
  ): Record<string, FoodDiaryEntry[]> {
    const grouped: Record<string, FoodDiaryEntry[]> = {};
    for (const entry of entries) {
      const day = new Date(entry.date).toISOString().split("T")[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(entry);
    }
    return grouped;
  }

  private calculateCurrentStreak(entries: FoodDiaryEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedDays = [
      ...new Set(
        entries.map((e) => new Date(e.date).toISOString().split("T")[0]),
      ),
    ]
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expected = expectedDate.toISOString().split("T")[0];

      if (sortedDays[i] === expected || (i === 0 && sortedDays[0] === today)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(entries: FoodDiaryEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedDays = [
      ...new Set(
        entries.map((e) => new Date(e.date).toISOString().split("T")[0]),
      ),
    ].sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diffDays =
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  private calculateDominantElement(
    entries: FoodDiaryEntry[],
  ): keyof { Fire: number; Water: number; Earth: number; Air: number } {
    const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    for (const entry of entries) {
      if (entry.elementalProperties) {
        for (const [element, value] of Object.entries(
          entry.elementalProperties,
        )) {
          totals[element as keyof typeof totals] += value;
        }
      }
    }

    const max = Object.entries(totals).reduce((a, b) => (a[1] > b[1] ? a : b));
    return max[0] as keyof typeof totals;
  }

  private calculateAverageMealTimes(
    entries: FoodDiaryEntry[],
  ): Record<MealType, string> {
    const mealTimes: Record<MealType, number[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    for (const entry of entries) {
      const [hours, minutes] = entry.time.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes;
      mealTimes[entry.mealType].push(totalMinutes);
    }

    const result: Record<MealType, string> = {
      breakfast: "08:00",
      lunch: "12:00",
      dinner: "18:00",
      snack: "15:00",
    };

    for (const [mealType, times] of Object.entries(mealTimes)) {
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const hours = Math.floor(avg / 60);
        const mins = Math.round(avg % 60);
        result[mealType as MealType] =
          `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
      }
    }

    return result;
  }

  private calculateOverallCompliance(
    actual: NutritionalSummary,
    target: NutritionalSummary,
  ): number {
    const nutrients: Array<keyof NutritionalSummary> = [
      "calories",
      "protein",
      "carbs",
      "fat",
      "fiber",
    ];
    let totalCompliance = 0;

    for (const nutrient of nutrients) {
      const actualVal = actual[nutrient] || 0;
      const targetVal = target[nutrient] || 1;
      const compliance = (Math.min(actualVal / targetVal, 1.2) / 1.2) * 100;
      totalCompliance += compliance;
    }

    return Math.round(totalCompliance / nutrients.length);
  }

  private calculateNutrientCompliance(
    actual: NutritionalSummary,
    target: NutritionalSummary,
  ): Record<string, number> {
    const result: Record<string, number> = {};

    for (const key of Object.keys(target) as Array<keyof NutritionalSummary>) {
      const actualVal = actual[key] || 0;
      const targetVal = target[key] || 1;
      result[key] = Math.round((actualVal / targetVal) * 100);
    }

    return result;
  }

  private findBestDays(summaries: DailyFoodDiarySummary[]): Date[] {
    return summaries
      .filter((s) => s.entries.length > 0)
      .sort((a, b) => {
        const aScore = Object.values(a.goalProgress).reduce(
          (sum, v) => sum + Math.min(v, 100),
          0,
        );
        const bScore = Object.values(b.goalProgress).reduce(
          (sum, v) => sum + Math.min(v, 100),
          0,
        );
        return bScore - aScore;
      })
      .slice(0, 2)
      .map((s) => s.date);
  }

  private findWorstDays(summaries: DailyFoodDiarySummary[]): Date[] {
    return summaries
      .filter((s) => s.entries.length > 0)
      .sort((a, b) => {
        const aScore = Object.values(a.goalProgress).reduce(
          (sum, v) => sum + Math.min(v, 100),
          0,
        );
        const bScore = Object.values(b.goalProgress).reduce(
          (sum, v) => sum + Math.min(v, 100),
          0,
        );
        return aScore - bScore;
      })
      .slice(0, 2)
      .map((s) => s.date);
  }

  private async captureAstrologicalContext(): Promise<
    FoodDiaryEntry["astrologicalContext"]
  > {
    // Simplified - in production would call astrology service
    return {
      dominantPlanet: undefined,
      zodiacSign: undefined,
      lunarPhase: undefined,
      planetaryHour: undefined,
    };
  }

  private addToUserIndex(userId: string, entryId: string): void {
    if (!this.userEntries.has(userId)) {
      this.userEntries.set(userId, new Set());
    }
    this.userEntries.get(userId)!.add(entryId);
  }

  private removeFromUserIndex(userId: string, entryId: string): void {
    this.userEntries.get(userId)?.delete(entryId);
  }

  private invalidateCache(userId: string): void {
    // Clear all cached summaries for this user
    userCache.delete(`daily_summary_${userId}`);
    userCache.delete(`weekly_summary_${userId}`);
  }

  private loadFromStorage(): void {
    // In production, would load from database
    // For now, start with empty storage
    _logger.debug("FoodDiaryService initialized");
  }

  private saveToStorage(): void {
    // In production, would persist to database
    // localStorage could be used for client-side persistence
  }
}

// Export singleton instance
export const foodDiaryService = new FoodDiaryService();
export default foodDiaryService;
