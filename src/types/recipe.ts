import type { 
  ElementalProperties as AlchemyElementalProps, 
  Recipe as AlchemyRecipe, 
  Ingredient as AlchemyIngredient 
} from './alchemy';
import { 
  validateRecipe as validateAlchemyRecipe, 
  validateIngredient as validateAlchemyIngredient, 
  validateElementalProperties as validateAlchemyElementalProps 
} from './validators';
import { VALID_SEASONS } from '../constants/seasonalConstants';
import type { Recipe as IndexRecipe, Ingredient as IndexIngredient } from './index';
import type { RecipeIngredient as ImportedRecipeIngredient } from './recipeIngredient';

// Import standardized enums
import {
  Element,
  ZodiacSign,
  PlanetName,
  Season,
  LunarPhase,
  CookingMethod
} from './constants';

import { ElementalProperties } from './elemental';
import { MoonPhase } from './shared';
import { Ingredient as BaseIngredient } from './alchemy';

// Primary elemental properties interface - standardized
export interface ElementalProperties {
  [Element.Fire]: number;
  [Element.Water]: number;
  [Element.Earth]: number;
  [Element.Air]: number;
  [key: string]: number; // Allow indexing with string
}

// Basic recipe ingredient interface - updated with enums
export interface RecipeIngredient {
  id?: string;
  name: string;
  amount?: number | string;
  unit?: string;
  elementalProperties?: ElementalProperties;
  category?: string;
  substitutes?: string[];
  notes?: string;
  isOptional?: boolean;
  seasonality?: string[] | Record<string, boolean>;
  allergens?: string[];
  zodiacAffinity?: ZodiacSign[];
  moonPhaseAffinity?: MoonPhase[];
  alchemicalProperties?: Record<string, number>;
  // Legacy compatibility fields
  element?: string;
  astrologicalProfile?: {
    elementalAffinity?: {
      base?: string;
      secondary?: string;
    };
    rulingPlanets?: string[];
    zodiacAffinity?: string[];
  };
}

// Core Recipe interface - updated with enums
export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  timeToMake: string;
  servingSize: number; // Standardized from numberOfServings
  elementalProperties: ElementalProperties;
  mealType?: string | string[];
  season?: Season | Season[];
  cookingMethod?: CookingMethod; // Standardized
  
  // UI-specific properties
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  
  // Enhanced astrological properties with standardized enums
  astrologicalInfluences?: string[];
  zodiacInfluences?: ZodiacSign[];
  lunarPhaseInfluences?: LunarPhase[];
  planetaryInfluences?: {
    favorable: PlanetName[];   // Planet names that enhance this recipe
    unfavorable: PlanetName[]; // Planet names that diminish this recipe
  };
  
  // Support for nutrition data
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    vitamins?: string[];
    minerals?: string[];
  };
  
  // Additional standardized fields
  substitutions?: { original: string; alternatives: string[] }[];
  tools?: string[]; // Required cooking tools/equipment
  spiceLevel?: number | 'mild' | 'medium' | 'hot' | 'very hot'; // Indicator of spiciness
  preparationNotes?: string; // Special notes about preparation
  technicalTips?: string[]; // Technical cooking tips
  
  // Timestamp properties
  createdAt?: string;
  updatedAt?: string;
  
  // Allow additional properties
  [key: string]: unknown;
}

// Scored recipe extends the base Recipe interface with a score property
export interface ScoredRecipe extends Recipe {
  score: number;
  // Add alchemical score breakdowns
  alchemicalScores?: {
    elementalScore: number;
    zodiacalScore: number;
    lunarScore: number;
    planetaryScore: number;
    seasonalScore: number;
  };
}

// Updated validation utilities
export const validateElementalProperties = (properties?: ElementalProperties): boolean => {
  if (!properties) return false;
  
  const requiredElements = [Element.Fire, Element.Water, Element.Earth, Element.Air] as const;
  if (!requiredElements.every(element => typeof properties[element] === 'number')) {
    return false;
  }
  
  const total = Object.values(properties).reduce((sum: number, val: number) => sum + val, 0);
  return Math.abs(total - 1) < 0.01;
};

export const validateRecipe = (recipe: Partial<Recipe>): boolean => {
  if (!recipe) return false;
  if (!recipe.name || !recipe.id) return false;
  return true;
}

export const validateSeason = (season: string | Season): boolean => {
  if (Object.values(Season).includes(season as Season)) {
    return true;
  }
  const validSeasons = Object.values(Season);
  return validSeasons.includes(season.toLowerCase() as Season);
};

export const validateSeasonality = (seasonality: (string | Season)[]): boolean => {
  if (!Array.isArray(seasonality)) return false;
  return seasonality.every(season => validateSeason(season));
};

export const validateIngredient = (ingredient: Partial<RecipeIngredient>): boolean => {
  if (!ingredient) return false;

  // Required properties
  if (!ingredient.name || typeof ingredient.name !== 'string') return false;
  if (typeof ingredient.amount !== 'number') return false;
  if (!ingredient.unit || typeof ingredient.unit !== 'string') return false;
  
  // Validate elemental properties
  if (ingredient.elementalProperties && !validateElementalProperties(ingredient.elementalProperties)) return false;
  
  // Validate seasonality if present
  if (ingredient.seasonality && !validateSeasonality(ingredient.seasonality)) return false;

  return true;
};

// Re-export validators with descriptive names
export const validateElementalPropertiesExt = validateAlchemyElementalProps;
export const validateIngredientExt = validateAlchemyIngredient;
export const validateRecipeExt = validateAlchemyRecipe;

// Simpler ingredient extension for specific cases
export interface RecipeIngredientExt {
  name: string;
  amount: number;
  unit: string;
  category?: string;
  id?: string;
  optional?: boolean;
  preparation?: string;
  
  // Add astrological associations with standardized enums
  zodiacInfluences?: ZodiacSign[];
  planetaryInfluences?: PlanetName[]; // Planet names
  lunarPhaseInfluences?: LunarPhase[];
}

// Extended recipe with optional description - updated with enums
export interface RecipeExtended {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredientExt[];
  instructions: string[];
  timeToMake: string;
  numberOfServings: number;
  elementalProperties: ElementalProperties;
  season?: Season[];
  mealType?: string[];
  cuisine?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
  cookingMethod?: CookingMethod; // Standardized
  
  // Inherited properties from RecipeIngredientExt (excluding 'amount' and 'unit')
  category?: string;
  optional?: boolean;
  preparation?: string;
  zodiacInfluences?: ZodiacSign[];
  lunarPhaseInfluences?: LunarPhase[];
  
  // Enhanced astrological properties with standardized enums
  astrologicalInfluences?: string[];
  planetaryInfluences?: {
    favorable: PlanetName[];   // Planet names that enhance this recipe
    unfavorable: PlanetName[]; // Planet names that diminish this recipe
  };
  
  alchemicalScores?: {
    elementalScore: number;
    zodiacalScore: number;
    lunarScore: number;
    planetaryScore: number;
    seasonalScore: number;
  };
  
  [key: string]: unknown;
}

export interface ScoredRecipeExtended extends RecipeExtended {
  score: number;
}

export type TimeOfDay = 'morning' | 'noon' | 'evening' | 'night';

// Enhanced Recipe interface with culinary details - updated with enums
export interface RecipeDetail {
  // Basic Information
  id: string;
  name: string;
  description: string;
  cuisine: string;
  
  // Time & Serving
  prepTime: string;        // e.g., "20 minutes"
  cookTime: string;        // e.g., "45 minutes"
  totalTime?: string;      // Optional calculated total
  restTime?: string;       // For recipes that need resting/marinating
  numberOfServings: number;
  yield?: string;          // For recipes that produce specific amounts
  
  // Culinary Classifications
  course: string[];        // e.g., ["appetizer", "main", "dessert"]
  mealType: string[];      // e.g., ["breakfast", "lunch", "dinner"]
  dishType: string[];      // e.g., ["soup", "stew", "salad", "sandwich"]
  
  // Technique Details - updated with enums
  cookingMethod: CookingMethod[]; // Primary cooking methods used
  cookingTechniques: string[]; // Specific techniques employed
  equipmentNeeded: string[]; // Required kitchen equipment
  skillsRequired: string[]; // e.g., "knife skills", "sauce making"
  
  // Ingredients (enhanced)
  ingredients: {
    name: string;
    amount: string;
    unit: string;
    preparation: string;   // e.g., "finely diced", "julienned"
    optional: boolean;
    substitutes?: string[]; // Possible substitutions
    notes?: string;        // Special notes about the ingredient
    category: string;      // e.g., "protein", "vegetable", "spice"
    function?: string;     // Culinary function: "base", "seasoning", "garnish"
    cookingPoint?: string; // When to add this ingredient
  }[];
  
  // Recipe Structure
  componentParts?: {       // For complex recipes with multiple elements
    name: string;          // e.g., "sauce", "filling", "dough"
    ingredients: unknown[];    // Ingredients specific to this component
    instructions: string[]; // Instructions specific to this component
  }[];
  
  instructions: string[];  // Main instructions
  instructionSections?: { // For recipes with distinct preparation phases
    title: string;
    steps: string[];
  }[];
  
  // Flavor Profile & Culinary Theory
  flavorProfile: {
    primary: string[];     // Primary flavors
    accent: string[];      // Accent flavors
    base: string[];        // Base notes
    tasteBalance: {        // Assessed proportions of five basic tastes
      sweet: number;       // 0-10 scale
      salty: number;
      sour: number;
      bitter: number;
      umami: number;
    }
  };
  
  texturalElements: string[]; // e.g., "crispy", "creamy", "chewy"
  aromatics: string[];     // Key aromatic components
  colorProfile: string[];  // Dominant colors
  
  // Cultural & Historical Context
  origin: string;          // Specific region of origin
  history?: string;        // Brief history of the dish
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
  cookingTemperature?: {
    value: number;
    unit: 'C' | 'F';
    technique: string;     // e.g., "roast", "simmer"
  }[];
  
  internalTemperature?: {  // For proteins
    value: number;
    unit: 'C' | 'F';
    doneness: string;      // e.g., "rare", "medium", "well-done"
  };
  
  // Nutrition (expanded)
  nutrition: {
    calories: number;
    servingSize: string;   // Defined serving
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
  dietaryClassifications: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isNutFree: boolean;
    isLowCarb: boolean;
    isKeto: boolean;
    isPaleo: boolean;
    containsAlcohol: boolean;
    allergens: string[];
  };
  
  // Seasonal & Astrological Information - updated with enums
  season: Season[];        // Seasons when optimal
  seasonalIngredients: string[]; // Ingredients that are seasonal
  
  // Enhanced astrological properties
  elementalProperties: {
    [Element.Fire]: number;
    [Element.Water]: number;
    [Element.Earth]: number;
    [Element.Air]: number;
  };
  
  astrologicalInfluences: string[];
  zodiacInfluences: ZodiacSign[];
  lunarPhaseInfluences: LunarPhase[];
  planetaryInfluences: {
    favorable: PlanetName[];   // Planet names that enhance this recipe
    unfavorable: PlanetName[]; // Planet names that diminish this recipe
    neutral: PlanetName[];     // Planet names with minimal effect
  };
  
  // Chef's Notes
  chefNotes?: string[];    // Special notes from the chef
  commonMistakes?: string[]; // Mistakes to avoid
  tips?: string[];         // Professional tips
  variations?: string[];   // Possible variations
  
  // Visual & Sensory
  presentationTips?: string[]; // How to plate or present
  sensoryIndicators?: {    // How to know when done
    visual: string[];
    aroma: string[];
    texture: string[];
    sound: string[];
  };
  
  // Tags & Metadata
  tags: string[];          // Searchable tags
  keywords: string[];      // SEO keywords
  
  // Timestamp properties
  createdAt?: string;
  updatedAt?: string;
}

// Interface for recipe props
export interface RecipeProps {
  recipe: Recipe;
  // Add these props to the interface if they're needed
  score?: number;
  elements?: ElementalProperties;
  dominantElements?: [Element, number][];
}

// The Ingredient interface used in legacy code
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  note: string;
}

export interface Substitution {
  ingredient: string;
  substitute: string;
  note: string;
}

export interface TimeToMake {
  prep: number;
  cook: number;
  total: number;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// Legacy Recipe interface - kept for backward compatibility
export interface LegacyRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  timeToMake: TimeToMake;
  servings: number;
  fire: number;
  water: number;
  earth: number;
  air: number;
  spirit: number;
  nutrition: Nutrition;
  substitutions: Substitution[];
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  cuisine: string;
  season: string;
  tags: string[];
  imageUrl: string;
  source: string;
}

export interface RawDish {
  id?: string;
  name?: string;
  description?: string;
  ingredients?: (string | { [key: string]: any })[];
  instructions?: string[];
  timeToMake?: { prep?: number; cook?: number; total?: number };
  servings?: number;
  fire?: number;
  water?: number;
  earth?: number;
  air?: number;
  spirit?: number;
  nutrition?: { [key: string]: number };
  substitutions?: any[];
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isNutFree?: boolean;
  cuisine?: string;
  season?: string;
  tags?: string[];
  imageUrl?: string;
  source?: string;
  [key: string]: any; // Allow for additional properties
}

export interface ErrorResult {
  error: true;
  message: string;
}

export type RecipeResult = Recipe | ErrorResult;

export function isErrorResult(result: RecipeResult): result is ErrorResult {
  return (result as ErrorResult).error === true;
}

export function isRecipe(result: RecipeResult): result is Recipe {
  return !isErrorResult(result);
}

/**
 * Type guard to check if an object is a RecipeIngredient
 */
export function isRecipeIngredient(obj: unknown): obj is RecipeIngredient {
  if (!obj || typeof obj !== 'object') return false;
  
  // A RecipeIngredient must at least have a name
  return 'name' in obj && typeof (obj as RecipeIngredient).name === 'string';
}

/**
 * Converter to transform a BaseIngredient to a RecipeIngredient
 */
export function baseIngredientToRecipeIngredient(
  baseIngredient: BaseIngredient, 
  amount?: number | string,
  unit?: string
): RecipeIngredient {
  return {
    name: baseIngredient.name,
    amount: amount,
    unit: unit,
    elementalProperties: baseIngredient.elementalProperties,
    category: baseIngredient.category,
    substitutes: baseIngredient.substitutes,
    notes: baseIngredient.notes,
    isOptional: baseIngredient.isOptional,
    seasonality: baseIngredient.seasonality,
    allergens: baseIngredient.allergens,
    zodiacAffinity: baseIngredient.zodiacAffinity as ZodiacSign[],
    moonPhaseAffinity: baseIngredient.moonPhaseAffinity as MoonPhase[],
    alchemicalProperties: baseIngredient.alchemicalProperties
  };
}

// Add standardized Recipe interface
/**
 * Standardized Recipe interface to be used throughout the codebase.
 */
export interface StandardizedRecipe {
  id?: string;
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  totalTime?: number; // in minutes
  servings?: number;
  cuisine?: string | string[];
  tags?: string[];
  elementalProperties?: ElementalProperties;
  seasonality?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  authorId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  imageUrl?: string;
  description?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    [key: string]: number | undefined;
  };
  alchemicalProperties?: {
    spirit?: number;
    essence?: number;
    matter?: number;
    substance?: number;
    [key: string]: number | undefined;
  };
  zodiacAffinity?: Record<ZodiacSign, number>;
  moonPhaseAffinity?: Record<MoonPhase, number>;
}

/**
 * Type guard to check if an object is a StandardizedRecipe
 */
export function isStandardizedRecipe(obj: unknown): obj is StandardizedRecipe {
  if (!obj || typeof obj !== 'object') return false;
  
  const recipe = obj as StandardizedRecipe;
  
  // Basic required properties
  if (!('name' in obj && typeof recipe.name === 'string')) return false;
  if (!('ingredients' in obj && Array.isArray(recipe.ingredients))) return false;
  if (!('instructions' in obj && Array.isArray(recipe.instructions))) return false;
  
  // Validate ingredients are RecipeIngredients
  return recipe.ingredients.every(ingredient => isRecipeIngredient(ingredient));
} 