/**
 * Food Diary Type Definitions
 * Comprehensive types for food tracking, ratings, and nutritional analysis
 *
 * @file src/types/foodDiary.ts
 * @created 2026-02-02
 */

import type { MealType } from "./menuPlanner";
import type { NutritionalSummary, NutritionalProfile } from "./nutrition";
import type { ElementalProperties } from "./alchemy";
import type { StandardZodiacSign } from "./astrology";

/**
 * Food entry source type - where the food data comes from
 */
export type FoodSource =
  | "recipe" // From app recipes
  | "custom" // User-entered custom food
  | "barcode" // Scanned barcode (future)
  | "search" // FDC database search
  | "quick" // Quick-add common foods
  | "favorite"; // From user favorites

/**
 * Rating for food entries (1-5 stars with half-star increments)
 */
export type FoodRating = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

/**
 * Mood/energy tags for food entries
 */
export type MoodTag =
  | "energized"
  | "satisfied"
  | "bloated"
  | "tired"
  | "focused"
  | "sluggish"
  | "content"
  | "hungry_after"
  | "craving_more";

/**
 * Quick food presets for common snacks and simple foods
 */
export interface QuickFoodPreset {
  id: string;
  name: string;
  category: QuickFoodCategory;
  defaultServing: ServingSize;
  nutritionPer100g: Partial<NutritionalSummary>;
  elementalProperties?: ElementalProperties;
  commonBrands?: string[];
  icon?: string;
}

/**
 * Quick food categories
 */
export type QuickFoodCategory =
  | "fruits"
  | "vegetables"
  | "proteins"
  | "dairy"
  | "grains"
  | "snacks"
  | "beverages"
  | "sweets"
  | "nuts_seeds"
  | "condiments"
  | "prepared_foods";

/**
 * Serving size configuration
 */
export interface ServingSize {
  amount: number;
  unit: ServingUnit;
  grams: number; // Equivalent weight in grams
  description?: string; // e.g., "1 medium apple", "1 cup"
}

/**
 * Common serving units
 */
export type ServingUnit =
  | "g"
  | "oz"
  | "cup"
  | "tbsp"
  | "tsp"
  | "piece"
  | "slice"
  | "serving"
  | "ml"
  | "fl_oz";

/**
 * Individual food diary entry
 */
export interface FoodDiaryEntry {
  id: string;
  userId: string;

  // Food identification
  foodName: string;
  foodSource: FoodSource;
  sourceId?: string; // Recipe ID, FDC ID, or preset ID
  brandName?: string;

  // Timing
  date: Date;
  mealType: MealType;
  time: string; // HH:mm format

  // Portion
  serving: ServingSize;
  quantity: number; // Number of servings

  // Nutrition (calculated based on serving and quantity)
  nutrition: Partial<NutritionalSummary>;
  nutritionConfidence: "high" | "medium" | "low"; // How confident we are in the nutrition data

  // Elemental/Alchemical (optional)
  elementalProperties?: ElementalProperties;
  alchemicalProperties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };

  // User feedback
  rating?: FoodRating;
  moodTags?: MoodTag[];
  notes?: string;
  wouldEatAgain?: boolean;

  // Astrological context (captured at entry time)
  astrologicalContext?: {
    dominantPlanet?: string;
    zodiacSign?: StandardZodiacSign;
    lunarPhase?: string;
    planetaryHour?: string;
  };

  // Metadata
  isFavorite: boolean;
  tags?: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Food diary entry creation input (without computed fields)
 */
export interface CreateFoodDiaryEntryInput {
  foodName: string;
  foodSource: FoodSource;
  sourceId?: string;
  brandName?: string;
  date: Date;
  mealType: MealType;
  time: string;
  serving: ServingSize;
  quantity: number;
  nutrition?: Partial<NutritionalSummary>;
  elementalProperties?: ElementalProperties;
  notes?: string;
  tags?: string[];
}

/**
 * Food diary entry update input
 */
export interface UpdateFoodDiaryEntryInput {
  id: string;
  quantity?: number;
  serving?: ServingSize;
  rating?: FoodRating;
  moodTags?: MoodTag[];
  notes?: string;
  wouldEatAgain?: boolean;
  isFavorite?: boolean;
  tags?: string[];
}

/**
 * Daily food diary summary
 */
export interface DailyFoodDiarySummary {
  date: Date;
  entries: FoodDiaryEntry[];
  mealBreakdown: {
    breakfast: FoodDiaryEntry[];
    lunch: FoodDiaryEntry[];
    dinner: FoodDiaryEntry[];
    snack: FoodDiaryEntry[];
  };
  totalNutrition: NutritionalSummary;
  nutritionGoals?: NutritionalSummary;
  goalProgress: {
    calories: number; // Percentage 0-100+
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  averageRating?: number;
  moodSummary: Record<MoodTag, number>;
  elementalBalance: ElementalProperties;
  alchemicalMetrics?: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy: number;
    monica: number;
    kalchm: number;
  };
}

/**
 * Weekly food diary summary
 */
export interface WeeklyFoodDiarySummary {
  weekStartDate: Date;
  weekEndDate: Date;
  dailySummaries: DailyFoodDiarySummary[];
  totalEntries: number;
  averageDailyNutrition: NutritionalSummary;
  weeklyNutritionTotals: NutritionalSummary;
  weeklyGoals?: NutritionalSummary;
  goalCompliance: {
    overall: number; // 0-100
    byNutrient: Record<string, number>;
    bestDays: Date[];
    worstDays: Date[];
  };
  patterns: FoodPatterns;
  insights: FoodInsight[];
}

/**
 * Identified food patterns from diary
 */
export interface FoodPatterns {
  // Most common foods
  topFoods: Array<{ name: string; count: number; averageRating?: number }>;
  topRatedFoods: Array<{ name: string; rating: number; count: number }>;
  avoidedFoods: Array<{ name: string; lastEaten: Date; reason?: string }>;

  // Timing patterns
  averageMealTimes: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  snackingFrequency: number; // Average snacks per day

  // Nutritional patterns
  proteinTrend: "increasing" | "stable" | "decreasing";
  fiberTrend: "increasing" | "stable" | "decreasing";
  calorieVariance: number; // Standard deviation

  // Elemental patterns
  dominantElement: keyof ElementalProperties;
  elementalTrends: Record<keyof ElementalProperties, "increasing" | "stable" | "decreasing">;

  // Mood correlations
  moodFoodCorrelations: Array<{
    mood: MoodTag;
    foods: string[];
    correlation: number; // -1 to 1
  }>;
}

/**
 * AI-generated food insight
 */
export interface FoodInsight {
  id: string;
  type: InsightType;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  recommendation?: string;
  relatedFoods?: string[];
  data?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Types of food insights
 */
export type InsightType =
  | "nutrition_gap" // Missing nutrients
  | "excess_warning" // Too much of something
  | "positive_pattern" // Good habits detected
  | "improvement_opportunity" // Suggestion for improvement
  | "variety_suggestion" // Eat more variety
  | "timing_suggestion" // Meal timing advice
  | "elemental_balance" // Elemental harmony tips
  | "rating_pattern" // Patterns in food ratings
  | "goal_progress"; // Goal achievement updates

/**
 * Food search result from database
 */
export interface FoodSearchResult {
  id: string;
  name: string;
  source: FoodSource;
  category?: string;
  brandName?: string;
  nutritionPer100g?: Partial<NutritionalSummary>;
  commonServings?: ServingSize[];
  matchScore: number;
  isUserFavorite?: boolean;
  lastEaten?: Date;
}

/**
 * User's food favorites
 */
export interface UserFoodFavorite {
  id: string;
  userId: string;
  foodName: string;
  foodSource: FoodSource;
  sourceId?: string;
  brandName?: string;
  customServing?: ServingSize;
  customNutrition?: Partial<NutritionalSummary>;
  timesEaten: number;
  averageRating?: number;
  lastEaten?: Date;
  tags?: string[];
  createdAt: Date;
}

/**
 * Food diary filters for querying
 */
export interface FoodDiaryFilters {
  startDate?: Date;
  endDate?: Date;
  mealTypes?: MealType[];
  foodSources?: FoodSource[];
  minRating?: FoodRating;
  maxRating?: FoodRating;
  moodTags?: MoodTag[];
  searchQuery?: string;
  isFavorite?: boolean;
  tags?: string[];
}

/**
 * Food diary statistics
 */
export interface FoodDiaryStats {
  totalEntries: number;
  totalDaysTracked: number;
  averageEntriesPerDay: number;
  trackingStreak: number; // Consecutive days
  longestStreak: number;
  startDate: Date;
  lastEntryDate: Date;

  // Rating stats
  totalRatedEntries: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;

  // Nutrition achievements
  daysMetCalorieGoal: number;
  daysMetProteinGoal: number;
  averageCalories: number;
  averageProtein: number;
}

/**
 * Food recommendation based on diary analysis
 */
export interface FoodRecommendation {
  id: string;
  type: "try_new" | "repeat_favorite" | "fill_gap" | "balanced_choice";
  food: FoodSearchResult | QuickFoodPreset;
  reason: string;
  confidence: number;
  nutritionalBenefit?: string;
  elementalBenefit?: string;
  basedOn?: {
    pattern?: string;
    nutrientGap?: string;
    userPreference?: string;
  };
}

/**
 * Helper to create an empty daily summary
 */
export function createEmptyDailySummary(date: Date): DailyFoodDiarySummary {
  return {
    date,
    entries: [],
    mealBreakdown: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    },
    totalNutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      vitaminA: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminK: 0,
      vitaminC: 0,
      thiamin: 0,
      riboflavin: 0,
      niacin: 0,
      vitaminB6: 0,
      folate: 0,
      vitaminB12: 0,
      calcium: 0,
      phosphorus: 0,
      magnesium: 0,
      sodium: 0,
      potassium: 0,
      iron: 0,
      zinc: 0,
    },
    goalProgress: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
    moodSummary: {} as Record<MoodTag, number>,
    elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  };
}

/**
 * Helper to calculate nutrition from serving and quantity
 */
export function calculateEntryNutrition(
  nutritionPer100g: Partial<NutritionalSummary>,
  serving: ServingSize,
  quantity: number
): Partial<NutritionalSummary> {
  const multiplier = (serving.grams * quantity) / 100;
  const result: Partial<NutritionalSummary> = {};

  for (const [key, value] of Object.entries(nutritionPer100g)) {
    if (typeof value === "number") {
      result[key as keyof NutritionalSummary] = Math.round(value * multiplier * 10) / 10;
    }
  }

  return result;
}

/**
 * Common serving size presets
 */
export const COMMON_SERVINGS: Record<string, ServingSize[]> = {
  general: [
    { amount: 100, unit: "g", grams: 100, description: "100 grams" },
    { amount: 1, unit: "cup", grams: 240, description: "1 cup" },
    { amount: 1, unit: "serving", grams: 150, description: "1 serving" },
  ],
  fruits: [
    { amount: 1, unit: "piece", grams: 150, description: "1 medium fruit" },
    { amount: 1, unit: "cup", grams: 150, description: "1 cup chopped" },
  ],
  vegetables: [
    { amount: 1, unit: "cup", grams: 100, description: "1 cup raw" },
    { amount: 1, unit: "cup", grams: 150, description: "1 cup cooked" },
  ],
  proteins: [
    { amount: 3, unit: "oz", grams: 85, description: "3 oz (palm-sized)" },
    { amount: 4, unit: "oz", grams: 113, description: "4 oz serving" },
    { amount: 6, unit: "oz", grams: 170, description: "6 oz serving" },
  ],
  dairy: [
    { amount: 1, unit: "cup", grams: 245, description: "1 cup milk/yogurt" },
    { amount: 1, unit: "oz", grams: 28, description: "1 oz cheese" },
  ],
  grains: [
    { amount: 1, unit: "slice", grams: 30, description: "1 slice bread" },
    { amount: 0.5, unit: "cup", grams: 100, description: "1/2 cup cooked" },
  ],
  snacks: [
    { amount: 1, unit: "oz", grams: 28, description: "1 oz (small handful)" },
    { amount: 1, unit: "serving", grams: 30, description: "1 serving" },
  ],
  beverages: [
    { amount: 8, unit: "fl_oz", grams: 240, description: "8 fl oz (1 cup)" },
    { amount: 12, unit: "fl_oz", grams: 355, description: "12 fl oz (1 can)" },
  ],
};
