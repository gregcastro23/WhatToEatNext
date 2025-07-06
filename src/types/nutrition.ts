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

// ---------------------------------------------------------------------------
// Backward-compatibility alias – legacy modules imported `_NutritionalProfile`.
// ---------------------------------------------------------------------------
export type _NutritionalProfile = NutritionalProfile; 