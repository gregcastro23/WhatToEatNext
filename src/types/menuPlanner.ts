/**
 * Menu Planner Type Definitions
 * Comprehensive type definitions for the Weekly Menu Planning system
 *
 * @file src/types/menuPlanner.ts
 * @created 2026-01-10
 */

import type { LunarPhase } from "./alchemy";
import type { Recipe, ElementalProperties } from "./recipe";
import type { PlanetaryPositions, StandardZodiacSign } from "./astrology";

/**
 * Days of the week enumeration
 * Sunday = 0 (standard JS Date convention)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Meal types supported in the menu planner
 */
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/**
 * Planetary day rulers
 * Each day of the week is ruled by a specific planet in traditional astrology
 */
export const PLANETARY_DAY_RULERS: Record<DayOfWeek, string> = {
  0: "Sun", // Sunday
  1: "Moon", // Monday
  2: "Mars", // Tuesday
  3: "Mercury", // Wednesday
  4: "Jupiter", // Thursday
  5: "Venus", // Friday
  6: "Saturn", // Saturday
};

/**
 * Planetary snapshot capturing astrological state at a specific time
 * Used to store the cosmic context for each meal
 */
export interface PlanetarySnapshot {
  dominantPlanet: string;
  zodiacSign: StandardZodiacSign;
  lunarPhase: LunarPhase;
  elementalState: ElementalProperties;
  planetaryPositions?: PlanetaryPositions;
  timestamp: Date;
}

/**
 * Individual meal slot in the weekly menu
 * Represents one meal assignment (breakfast, lunch, dinner, or snack)
 */
export interface MealSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipe?: Recipe;
  servings: number;
  planetarySnapshot: PlanetarySnapshot;
  notes?: string;
  isLocked?: boolean; // Whether this meal is locked from changes
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Nutritional totals for a single day
 * Aggregates nutrition data from all meals in the day
 */
export interface DailyNutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  gregsEnergy: number;
  monicaConstant: number;
  kalchm: number;
  elementalBalance: ElementalProperties;
}

/**
 * Weekly nutritional totals
 * Aggregates nutrition data from all days in the week
 */
export interface WeeklyNutritionTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  averageGregsEnergy: number;
  averageMonica: number;
  averageKalchm: number;
  weeklyElementalBalance: ElementalProperties;
  dailyBreakdown: Record<DayOfWeek, DailyNutritionTotals>;
}

/**
 * Alchemical metrics (thermodynamic calculations)
 * Extended alchemical properties for nutritional analysis
 */
export interface AlchemicalMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  monica: number;
  kalchm: number;
}

/**
 * Macronutrient breakdown
 */
export interface MacronutrientBreakdown {
  protein: number;
  carbs: number;
  fat: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

/**
 * Nutritional goals/targets
 * User-defined nutritional targets for tracking
 */
export interface NutritionalGoals {
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  dailyFiber?: number;
  targetGregsEnergy?: number;
  targetMonica?: number;
  macroRatio?: {
    protein: number; // e.g., 30 for 30%
    carbs: number; // e.g., 40 for 40%
    fat: number; // e.g., 30 for 30%
  };
  elementalTargets?: Partial<ElementalProperties>;
}

/**
 * Nutritional progress tracking
 * Tracks actual vs. goal progress
 */
export interface NutritionalProgress {
  actual: DailyNutritionTotals;
  goals?: NutritionalGoals;
  percentages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  status: "under" | "on-track" | "over";
}

/**
 * Chart data point for visualizations
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

/**
 * Chart configuration for nutritional visualizations
 */
export interface NutritionalChart {
  type: "bar" | "pie" | "line" | "radar";
  title: string;
  data: ChartDataPoint[];
  unit?: string;
  legend?: boolean;
}

/**
 * Grocery item for shopping list
 */
export interface GroceryItem {
  id: string;
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  inPantry: boolean;
  purchased: boolean;
  usedInRecipes: string[]; // Recipe IDs that use this ingredient
  notes?: string;
}

/**
 * Grocery list categories
 */
export type GroceryCategory =
  | "produce"
  | "proteins"
  | "dairy"
  | "grains"
  | "spices"
  | "condiments"
  | "canned"
  | "frozen"
  | "bakery"
  | "beverages"
  | "other";

/**
 * Complete weekly menu structure
 */
export interface WeeklyMenu {
  id: string;
  weekStartDate: Date;
  weekEndDate: Date;
  meals: MealSlot[];
  nutritionalTotals: Record<DayOfWeek, DailyNutritionTotals>;
  groceryList: GroceryItem[];
  savedAsTemplate: boolean;
  templateName?: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Menu template for saving and reusing weekly menus
 */
export interface MenuTemplate {
  id: string;
  name: string;
  description?: string;
  meals: Omit<
    MealSlot,
    "id" | "planetarySnapshot" | "createdAt" | "updatedAt"
  >[];
  tags?: string[];
  author?: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Filters for recipe recommendations within menu planner
 */
export interface MenuPlannerRecipeFilters {
  cuisine?: string[];
  dietaryRestrictions?: string[];
  mealType?: MealType[];
  prepTimeMax?: number;
  elementalPreference?: Partial<ElementalProperties>;
  spiceLevel?: number;
  excludeIngredients?: string[];
}

/**
 * Day-specific recommendation parameters
 * Used to generate meal recommendations aligned with planetary influences
 */
export interface DayRecommendationParams {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  planetarySnapshot: PlanetarySnapshot;
  filters?: MenuPlannerRecipeFilters;
  preferredServings: number;
}

/**
 * Weekly menu statistics and insights
 */
export interface WeeklyMenuStats {
  totalMeals: number;
  totalRecipes: number;
  averageGregsEnergy: number;
  averageMonica: number;
  elementalDistribution: ElementalProperties;
  cuisineDistribution: Record<string, number>;
  dietaryCompliance: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  missingMeals: Array<{
    dayOfWeek: DayOfWeek;
    mealType: MealType;
  }>;
}

/**
 * Export options for grocery list
 */
export type ExportFormat = "pdf" | "email" | "clipboard" | "print";

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat;
  includeNutrition?: boolean;
  includePantryItems?: boolean;
  groupByCategory?: boolean;
  emailAddress?: string;
}

/**
 * Menu planner view mode
 */
export type ViewMode = "week" | "day" | "list";

/**
 * Drag and drop item types
 */
export type DragItemType = "recipe" | "meal-slot";

/**
 * Drag and drop data
 */
export interface DragItem {
  type: DragItemType;
  recipe?: Recipe;
  mealSlot?: MealSlot;
}

/**
 * Calendar navigation
 */
export interface CalendarNavigation {
  currentWeekStart: Date;
  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
  goToCurrentWeek: () => void;
  goToWeek: (date: Date) => void;
}

/**
 * Validation result for menu operations
 */
export interface MenuValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Helper function to get day name from DayOfWeek
 */
export function getDayName(day: DayOfWeek): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day];
}

/**
 * Helper function to get short day name
 */
export function getShortDayName(day: DayOfWeek): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[day];
}

/**
 * Helper function to get planetary ruler characteristics
 */
export function getPlanetaryDayCharacteristics(day: DayOfWeek): {
  planet: string;
  description: string;
  mealGuidance: string;
} {
  const characteristics = {
    0: {
      planet: "Sun",
      description: "Energizing, vitality-boosting",
      mealGuidance:
        "Focus on energizing, vitality-boosting meals with bold flavors",
    },
    1: {
      planet: "Moon",
      description: "Comforting, nourishing",
      mealGuidance: "Emphasize comforting, nourishing, fluid foods",
    },
    2: {
      planet: "Mars",
      description: "Spicy, protein-rich",
      mealGuidance: "Choose spicy, protein-rich, energizing dishes",
    },
    3: {
      planet: "Mercury",
      description: "Complex, varied",
      mealGuidance: "Select complex, varied, mentally stimulating meals",
    },
    4: {
      planet: "Jupiter",
      description: "Abundant, expansive",
      mealGuidance: "Plan abundant, expansive, celebratory dishes",
    },
    5: {
      planet: "Venus",
      description: "Indulgent, beautiful",
      mealGuidance:
        "Indulge in beautiful, sensual, aesthetically pleasing meals",
    },
    6: {
      planet: "Saturn",
      description: "Grounding, traditional",
      mealGuidance: "Choose grounding, traditional, structured dishes",
    },
  };

  return characteristics[day as keyof typeof characteristics];
}

/**
 * Helper function to get meal type characteristics
 */
export function getMealTypeCharacteristics(mealType: MealType): {
  energy: string;
  elementalFocus: string;
  guidance: string;
} {
  const characteristics = {
    breakfast: {
      energy: "Cardinal (initiating)",
      elementalFocus: "Fire & Air (lighter elements)",
      guidance: "Light, energizing, easy to digest",
    },
    lunch: {
      energy: "Fixed (sustaining)",
      elementalFocus: "Balanced elements",
      guidance: "Sustaining, balanced, moderate portions",
    },
    dinner: {
      energy: "Mutable (transforming)",
      elementalFocus: "Earth & Water (heavier elements)",
      guidance: "Nourishing, grounding, satisfying",
    },
    snack: {
      energy: "Flexible",
      elementalFocus: "Based on daily balance needs",
      guidance: "Flexible, fills gaps in daily nutrition",
    },
  };

  return characteristics[mealType];
}

/**
 * Helper to calculate week start date (Sunday) from any date
 */
export function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Helper to calculate week end date (Saturday) from week start
 */
export function getWeekEndDate(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
}

/**
 * Helper to format date for display
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Helper to check if two dates are in the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const week1Start = getWeekStartDate(date1);
  const week2Start = getWeekStartDate(date2);
  return week1Start.getTime() === week2Start.getTime();
}
