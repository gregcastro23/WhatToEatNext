/**
 * Centralized Nutrition Type Definitions
 * This file contains all nutrition-related type definitions
 */

/**
 * Represents a nutritional profile for food items.
 * This interface defines the structure of nutritional data used throughout the application.
 */
export interface NutritionalProfile {
  // Macronutrients
  calories?: number;
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    [key: string]: number | undefined;
  };
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;

  // Vitamins
  vitamins?: Record<string, number> | string[];

  // Minerals
  minerals?: Record<string, number> | string[];

  // Phytonutrients and other nutritional components
  phytonutrients?: Record<string, number>;

  // Allow for additional nutrition categories
  [key: string]: unknown;
}

/**
 * Simplified nutrition data structure used by filter services
 */
export interface NutritionData {
  protein_g?: number;
  fiber_g?: number;
  vitamins?: string[];
  minerals?: string[];
  vitamin_density?: number;
  calories?: number;
  carbs?: number;
  fats?: number;
  sodium?: number;
  sugar?: number;
}

/**
 * Interface for Food Data Central API food items
 */
export interface FoodDataCentralFood {
  foodNutrients: Array<{
    nutrientNumber: string;
    nutrientName?: string;
    value?: number;
  }>;
  [key: string]: string | number | boolean | object | null | undefined;
}

/**
 * Nutritional filter parameters for ingredient filtering
 */
export interface NutritionalFilter {
  minProtein?: number;
  maxProtein?: number;
  minFiber?: number;
  maxFiber?: number;
  minCalories?: number;
  maxCalories?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minFat?: number;
  maxFat?: number;
  vitamins?: string[];
  minerals?: string[];
  highProtein?: boolean;
  lowCarb?: boolean;
  lowFat?: boolean;
}

// ============================================================
// Comprehensive Nutrition Types for Nutrition-First Architecture
// ============================================================

export interface NutritionalSummaryBase {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Complete nutritional summary for a meal, day, or week.
 * Based on USDA FoodData Central and FDA Daily Value standards.
 */
export interface NutritionalSummary extends NutritionalSummaryBase {
  fiber: number;
  sugar: number;
  addedSugar?: number;

  // Fat breakdown
  saturatedFat: number;
  transFat: number;
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  omega3?: number;
  omega6?: number;
  cholesterol: number;

  // Vitamins (fat-soluble)
  vitaminA: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;

  // Vitamins (water-soluble)
  vitaminC: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  pantothenicAcid?: number;
  vitaminB6: number;
  biotin?: number;
  folate: number;
  vitaminB12: number;
  choline?: number;

  // Minerals (major)
  calcium: number;
  phosphorus: number;
  magnesium: number;
  sodium: number;
  potassium: number;
  chloride?: number;

  // Minerals (trace)
  iron: number;
  zinc: number;
  copper?: number;
  manganese?: number;
  selenium?: number;
  iodine?: number;
  chromium?: number;
  molybdenum?: number;
  fluoride?: number;

  // Additional
  alcohol?: number;
  caffeine?: number;
  water?: number;
}

/**
 * Creates a NutritionalSummary with all required fields zeroed out.
 */
export function createEmptyNutritionalSummary(): NutritionalSummary {
  return {
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
  };
}

/**
 * Nutrient range with min/max/optimal targets
 */
export interface NutrientRange {
  min: number;
  max: number;
  optimal?: number;
  unit: string;
}

/**
 * Nutritional targets based on RDA, user goals, and health conditions
 */
export interface NutritionalTargets {
  daily: NutritionalSummary;
  weekly: NutritionalSummary;
  ranges: Partial<Record<keyof NutritionalSummary, NutrientRange>>;
  priorities: NutrientPriority[];
}

/**
 * Nutrient priority for optimization
 */
export interface NutrientPriority {
  nutrient: keyof NutritionalSummary;
  importance: NutrientImportance;
  reason?: string;
  targetDirection?: "increase" | "decrease" | "maintain";
}

/**
 * User profile for personalized nutrition targets
 */
export interface UserNutritionProfile {
  age: number;
  sex: "male" | "female" | "other";
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
  primaryGoal: NutritionGoal;
  targetWeight?: number;
  targetDate?: Date;
  dietaryRestrictions: DietaryRestriction[];
  allergies: string[];
  dislikes: string[];
  healthConditions?: HealthCondition[];
  focusNutrients?: Array<keyof NutritionalSummary>;
  targets?: NutritionalTargets;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthCondition {
  condition: string;
  severity?: "mild" | "moderate" | "severe";
  managementApproach?: string;
}

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type NutritionGoal =
  | "maintain"
  | "lose_weight"
  | "gain_weight"
  | "gain_muscle"
  | "athletic_performance";

/**
 * Nutrient deficiency or excess entry
 */
export interface ComplianceDeficiency {
  nutrient: keyof NutritionalSummary;
  actual: number;
  target: number;
  delta: number;
  severity: "mild" | "moderate" | "severe";
}

/**
 * Daily nutrition result with compliance analysis
 */
export interface DailyNutritionResult {
  date: Date;
  meals: Array<{
    recipeName: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    nutrition: NutritionalSummary;
  }>;
  totals: NutritionalSummary;
  goals: NutritionalSummary;
  compliance: {
    overall: number;
    byNutrient: Record<string, number>;
    deficiencies: ComplianceDeficiency[];
    excesses: ComplianceDeficiency[];
    suggestions: string[];
  };
}

/**
 * Weekly nutrition result with trends
 */
export interface WeeklyNutritionResult {
  weekStartDate: Date;
  weekEndDate: Date;
  days: DailyNutritionResult[];
  weeklyTotals: NutritionalSummary;
  weeklyGoals: NutritionalSummary;
  weeklyCompliance: {
    overall: number;
    byNutrient: Record<string, number>;
    deficiencies: ComplianceDeficiency[];
    excesses: ComplianceDeficiency[];
  };
  variety: {
    uniqueIngredients: number;
    uniqueRecipes: number;
    cuisineDiversity: number;
    colorDiversity: number;
  };
}

/**
 * Compliance severity levels
 */
export type ComplianceSeverity =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "critical";

export function getComplianceSeverity(score: number): ComplianceSeverity {
  if (score >= 0.9) return "excellent";
  if (score >= 0.75) return "good";
  if (score >= 0.6) return "fair";
  if (score >= 0.4) return "poor";
  return "critical";
}

export type NutrientImportance = "critical" | "high" | "medium" | "low";

export enum DietaryRestriction {
  VEGETARIAN = "Vegetarian",
  VEGAN = "Vegan",
  GLUTEN_FREE = "Gluten Free",
  DAIRY_FREE = "Dairy Free",
  KETO = "Keto",
  PALEO = "Paleo",
  LOW_CARB = "Low Carb",
  LOW_SODIUM = "Low Sodium",
  LOW_SUGAR = "Low Sugar",
  KOSHER = "Kosher",
  HALAL = "Halal",
}
