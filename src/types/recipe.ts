// Note: Validator imports removed to avoid circular dependency with ./validators
// Validators are now only imported where they're actually used
import type { LunarPhase } from "./alchemy";
import type { NutritionalSummary, NutritionalSummaryBase } from "./nutrition";

// Primary elemental properties interface - used throughout the application
export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}

// Basic recipe ingredient interface
export interface RecipeIngredient {
  id?: string;
  name: string;
  amount: number; // Revert to number for calculations
  unit: string;
  category?: string;
  optional?: boolean;
  preparation?: string;
  notes?: string;
  function?: string;
  cookingPoint?: string;
  substitutes?: string[];
  elementalProperties?: ElementalProperties;
  seasonality?: Season | "all" | Season[]; // Match EnhancedRecipe seasonality

  // Astrological associations
  zodiacInfluences?: any[];
  planetaryInfluences?: string[]; // Planet names
  lunarPhaseInfluences?: LunarPhase[];
  [key: string]: unknown;
}

// Unified Recipe interface - consolidates all previous recipe types
export interface Recipe {
  // Core identification
  id: string;
  name: string;
  description?: string;
  cuisine?: string;

  // Ingredients and instructions
  ingredients: RecipeIngredient[];
  instructions: string[];

  // Time and serving information
  timeToMake?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  restTime?: string;
  servingSize?: number;
  numberOfServings?: number;
  yield?: string;

  // Elemental properties (required)
  elementalProperties: ElementalProperties;

  // Meal and cuisine classification
  mealType?: string | string[];
  season?: string | string[];
  course?: string[];
  dishType?: string[];

  // Dietary considerations
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isNutFree?: boolean;
  isLowCarb?: boolean;
  isKeto?: boolean;
  isPaleo?: boolean;
  allergens?: string[];

  // Culinary details
  cookingMethod?: string[];
  cookingTechniques?: string[];
  equipmentNeeded?: string[];
  skillsRequired?: string[];
  spiceLevel?: number | "mild" | "medium" | "hot" | "very hot";

  // Flavor and sensory
  flavorProfile?: {
    primary?: string[];
    accent?: string[];
    base?: string[];
    tasteBalance?: {
      sweet: number;
      salty: number;
      sour: number;
      bitter: number;
      umami: number;
    };
  };
  texturalElements?: string[];
  aromatics?: string[];
  colorProfile?: string[];

  // Cultural context
  origin?: string;
  history?: string;
  traditionalOccasion?: string[];
  regionalVariations?: string[];

  // Pairing and serving
  pairingRecommendations?: {
    wines?: string[];
    beverages?: string[];
    sides?: string[];
    condiments?: string[];
  };

  // Technical details
  cookingTemperature?: Array<{
    value: number;
    unit: "C" | "F";
    technique: string;
  }>;
  internalTemperature?: {
    value: number;
    unit: "C" | "F";
    doneness: string;
  };

  // Enhanced astrological properties
  astrologicalInfluences?: string[];
  zodiacInfluences?: any[];
  lunarPhaseInfluences?: LunarPhase[];
  planetaryInfluences?: {
    favorable: string[];
    unfavorable: string[];
    neutral?: string[];
  };

  // Nutritional information
  nutrition?: NutritionalSummary | NutritionalSummaryBase;

  // Chef's notes and guidance
  preparationNotes?: string;
  technicalTips?: string[];
  chefNotes?: string[];
  commonMistakes?: string[];
  tips?: string[];
  variations?: string[];
  presentationTips?: string[];

  // Sensory indicators
  sensoryIndicators?: {
    visual: string[];
    aroma: string[];
    texture: string[];
    sound: string[];
  };

  // Recipe metadata
  tags?: string[];
  keywords?: string[];
  notes?: string;
  preparation?: string;
  procedure?: string | string[];
  idealTimeOfDay?: string;

  // Multi-component recipes
  componentParts?: Array<{
    name: string;
    ingredients: RecipeIngredient[];
    instructions: string[];
  }>;

  // Substitutions and alternatives
  substitutions?: Array<{ original: string; alternatives: string[] }>;
  tools?: string[];

  // Seasonal considerations
  seasonalIngredients?: string[];

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Scoring (for recommendations)
  score?: number;
  alchemicalScores?: {
    _elementalScore: number;
    _zodiacalScore: number;
    _lunarScore: number;
    _planetaryScore: number;
    _seasonalScore: number;
  };

  // 6-Metric SMES Grid
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
  isEnvironmentalMatch?: boolean;
  environmentalMatchDetails?: string;
  optimal_cooking_window?: OptimalCookingWindow;

  monicaOptimization?: {
    originalMonica: number | null;
    optimizedMonica: number;
    optimizationScore: number;
    temperatureAdjustments: number[];
    timingAdjustments: number[];
    intensityModifications: string[];
    planetaryTimingRecommendations: string[];
  };
  seasonalAdaptation?: {
    currentSeason: Season;
    seasonalScore: number;
    seasonalIngredientSubstitutions: Array<{
      original: string;
      seasonal: string;
      reason: string;
      seasonalScore: number;
    }>;
    seasonalCookingMethodAdjustments: Array<{
      method: string;
      adjustment: string;
      reason: string;
    }>;
  };
  cuisineIntegration?: {
    authenticity: number;
    fusionPotential: number;
    culturalNotes: string[];
    traditionalVariations: string[];
    modernAdaptations: string[];
  };
  nutritionalOptimization?: {
    alchemicalNutrition: {
      spiritNutrients: string[];
      essenceNutrients: string[];
      matterNutrients: string[];
      substanceNutrients: string[];
    };
    elementalNutrition: ElementalProperties;
    kalchmNutritionalBalance: number;
    monicaNutritionalHarmony: number;
  };

  // Allow additional dynamic properties for extensibility
  [key: string]: unknown;
}

export interface OptimalCookingWindow {
  date: string;
  mansion: string;
  food_type: string;
  start_time: string;
}

// Legacy interface for backward compatibility - now extends unified Recipe
export interface ScoredRecipe extends Recipe {
  score: number; // Required for this interface
}

// Validation utilities
export const validateElementalProperties = (
  properties?: ElementalProperties,
): boolean => {
  if (!properties) return false;
  const requiredElements = ["Fire", "Water", "Earth", "Air"] as const;
  if (
    !requiredElements.every(
      (element) => typeof properties[element] === "number",
    )
  ) {
    return false;
  }

  const total = Object.values(properties).reduce(
    (sum: number, val: number) => sum + val,
    0,
  );
  return Math.abs(total - 1) < 0.01;
};

export const _validateRecipe = (recipe: Partial<Recipe>): boolean => {
  if (!recipe) return false;
  if (!recipe.name || !recipe.id) return false;
  return true;
};

import type { Season } from "@/constants/seasons"; // Add this import
import { VALID_SEASONS } from "@/constants/seasons";

// ...

export const validateSeason = (season: string | Season): boolean => {
  return VALID_SEASONS.includes(season.toLowerCase() as Season);
};

export const validateSeasonality = (seasonality: Season | "all" | Season[]): boolean => {
  if (typeof seasonality === "string") {
    return validateSeason(seasonality);
  } else if (Array.isArray(seasonality)) {
    return seasonality.every((season) => validateSeason(season));
  }
  return false;
};

export const validateIngredient = (
  ingredient: Partial<RecipeIngredient>,
): boolean => {
  if (!ingredient) return false;
  // Required properties
  if (!ingredient.name || typeof ingredient.name !== "string") return false;
  if (typeof ingredient.amount !== "number") return false;
  if (!ingredient.unit || typeof ingredient.unit !== "string") return false;
  // Validate elemental properties
  if (!validateElementalProperties(ingredient.elementalProperties))
    return false;

  // Validate seasonality if present
  if (ingredient.seasonality && !validateSeasonality(ingredient.seasonality))
    return false;

  return true;
};

// Note: Validator re-exports removed to avoid circular dependency with ./validators
// Import validators directly from ./validators where needed

// Legacy interfaces for backward compatibility - all now extend unified Recipe
export interface RecipeExtended extends Recipe {
  // All properties are now inherited from unified Recipe interface
}

export interface ScoredRecipeExtended extends Recipe {
  score: number; // Required for this interface
}

export type TimeOfDay = "morning" | "noon" | "evening" | "night";

// Enhanced Recipe interface with culinary details
export interface RecipeDetail {
  // Basic Information;
  id: string;
  name: string;
  description: string;
  cuisine: string;

  // Time & Serving
  prepTime: string; // e.g., '20 minutes',
  cookTime: string; // e.g., '45 minutes',
  totalTime?: string; // Optional calculated total
  restTime?: string; // For recipes that need resting/marinating
  numberOfServings: number;
  yield?: string; // For recipes that produce specific amounts

  // Culinary Classifications
  course: string[]; // e.g., ['appetizer', 'main', 'dessert'],
  mealType: string[]; // e.g., ['breakfast', 'lunch', 'dinner'],
  dishType: string[]; // e.g., ['soup', 'stew', 'salad', 'sandwich'],

  // Technique Details
  cookingMethod: string[]; // Primary cooking methods used,
  cookingTechniques: string[]; // Specific techniques employed,
  equipmentNeeded: string[]; // Required kitchen equipment,
  skillsRequired: string[]; // e.g., 'knife skills', 'sauce making',

  // Ingredients (enhanced)
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
    preparation: string; // e.g., 'finely diced', 'julienned',
    optional: boolean;
    substitutes?: string[]; // Possible substitutions
    notes?: string; // Special notes about the ingredient
    category: string; // e.g., 'protein', 'vegetable', 'spice',
    function?: string; // Culinary function: 'base', 'seasoning', 'garnish'
    cookingPoint?: string; // When to add this ingredient
  }>;

  // Recipe Structure
  componentParts?: Array<{
    // For complex recipes with multiple elements
    name: string; // e.g., 'sauce', 'filling', 'dough',
    ingredients: unknown[]; // Ingredients specific to this component,
    instructions: string[]; // Instructions specific to this component
  }>;

  instructions: string[]; // Main instructions,
  instructionSections?: Array<{
    // For recipes with distinct preparation phases
    title: string;
    _steps: string[];
  }>;

  // Flavor Profile & Culinary Theory
  flavorProfile: {
    primary: string[]; // Primary flavors,
    accent: string[]; // Accent flavors,
    base: string[]; // Base notes,
    tasteBalance: {
      // Assessed proportions of five basic tastes
      sweet: number; // 0-10 scale,
      salty: number;
      sour: number;
      bitter: number;
      umami: number;
    };
  };
  texturalElements: string[]; // e.g., 'crispy', 'creamy', 'chewy',
  aromatics?: string[]; // Key aromatic components,
  colorProfile: string[]; // Dominant colors,

  // Cultural & Historical Context
  origin: string; // Specific region of origin,
  history?: string; // Brief history of the dish
  traditionalOccasion?: string[]; // Traditional occasions for serving
  regionalVariations?: string[]; // Notable regional variations

  // Pairing Suggestions
  pairingRecommendations?: {
    wines?: string[];
    beverages?: string[];
    sides?: string[];
    condiments?: string[];
  };

  // Technical Culinary Details
  cookingTemperature?: Array<{
    value: number;
    unit: "C" | "F";
    technique: string; // e.g., 'roast', 'simmer'
  }>;

  internalTemperature?: {
    // For proteins
    value: number;
    unit: "C" | "F";
    doneness: string; // e.g., 'rare', 'medium', 'well-done'
  };
  // Nutrition (expanded)
  nutrition: {
    calories: number;
    servingSize: string; // Defined serving,
    macronutrients: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    micronutrients?: {
      vitamins: Record<string, number>;
      minerals: Record<string, number>;
    };
  };
  // Dietary Considerations
  _dietaryClassifications: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isNutFree: boolean;
    isLowCarb: boolean;
    isKeto: boolean;
    isPaleo: boolean;
    _containsAlcohol: boolean;
    allergens: string[];
  };
  // Seasonal & Astrological Information
  season: string[]; // Seasons when optimal,
  seasonalIngredients: string[]; // Ingredients that are seasonal,

  // Enhanced astrological properties
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  astrologicalInfluences: string[];
  zodiacInfluences: any[];
  lunarPhaseInfluences: LunarPhase[];
  planetaryInfluences: {
    favorable: string[]; // Planet names that enhance this recipe,
    unfavorable: string[]; // Planet names that diminish this recipe,
    neutral: string[]; // Planet names with minimal effect
  };

  // Chef's Notes
  chefNotes?: string[]; // Special notes from the chef
  commonMistakes?: string[]; // Mistakes to avoid
  tips?: string[]; // Professional tips
  variations?: string[]; // Possible variations

  // Visual & Sensory
  presentationTips?: string[]; // How to plate or present
  sensoryIndicators?: {
    // How to know when done
    visual: string[];
    aroma: string[];
    texture: string[];
    sound: string[];
  };
  // Tags & Metadata
  tags: string[]; // Searchable tags,
  keywords: string[]; // SEO keywords,

  // Timestamp properties
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeProps {
  recipe: Recipe;
  // Add these props to the interface if they're needed
  score?: number;
  elements?: ElementalProperties;
  dominantElements?: Array<[string, number]>;
}

// ========== MISSING TYPES FOR TS2305 FIXES ==========

// RecipeSearchCriteria (causing error in LegacyRecipeAdapter.ts)
export interface RecipeSearchCriteria {
  cuisine?: string[];
  mealType?: string[];
  season?: string[];
  dietaryRestrictions?: string[];
  cookingMethods?: string[];
  prepTimeRange?: {
    min?: number;
    max?: number;
  };
  servings?: {
    min?: number;
    max?: number;
  };
  spiceLevel?: string[];
  skillLevel?: string[];
  elements?: ElementalProperties;
  keywords?: string[];
  tags?: string[];
}

// ingredient (lowercase - likely a simple ingredient type)
export interface ingredient {
  id: string;
  name: string;
  category: string;
  nutritionalProfile?: NutritionalSummary;
  servingSize?: number;
  elementalProperties?: ElementalProperties;
}

// IngredientMapping (re-export from alchemy, likely needed here too)
export interface IngredientMapping {
  [key: string]: ingredient;
}

// nutritionInfo (causing error in recipeMatching.ts)
export interface nutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  servingSize?: string;
  allergens?: string[];
}

// RecipeFilters (causing error in recipeFilters.ts)
export interface RecipeFilters {
  cuisine?: string[];
  mealType?: string[];
  season?: string[];
  cookingMethod?: string[];
  dietaryRestrictions?: string[];
  spiceLevel?: string[];
  prepTime?: {
    min?: number;
    max?: number;
  };
  difficulty?: string[];
  elements?: {
    Fire?: number;
    Water?: number;
    Earth?: number;
    Air?: number;
  };
  includeIngredients?: string[];
  excludeIngredients?: string[];
  zodiacSigns?: string[];
  lunarPhases?: string[];
}

// Export aliases for compatibility
export type Ingredient = ingredient; // Capitalized version
export type RecipeData = RecipeDetail; // Alias for compatibility

export type RecipeIdentifier = string;
export type RecipeSeason = Season | string;

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sodium?: number;
  fiber?: number;
  vitamins?: string[];
  minerals?: string[];
  macronutrients?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  micronutrients?: {
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
  };
}

export interface RecipePlanetaryInfluences {
  favorable: string[];
  unfavorable: string[];
  neutral?: string[];
}
