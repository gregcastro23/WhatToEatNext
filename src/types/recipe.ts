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
import { VALID_SEASONS } from '@/constants/seasonalConstants';
import type { Recipe as IndexRecipe, Ingredient as IndexIngredient } from './index';
import { 
  Season, 
  ZodiacSign,
  LunarPhase,
  ThermodynamicProperties,
  CookingMethod
} from './alchemy';
import type { RecipeIngredient as ImportedRecipeIngredient } from './recipeIngredient';

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
  amount: number; // Keep as number for calculations
  unit: string;
  category?: string;
  optional?: boolean;
  preparation?: string;
  notes?: string;
  elementalProperties?: ElementalProperties;
  seasonality?: string[];
  
  // Astrological associations
  zodiacInfluences?: ZodiacSign[];
  planetaryInfluences?: string[]; // Planet names
  lunarPhaseInfluences?: LunarPhase[];
}

// Core Recipe interface - this is the primary interface used across components
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
  season?: string | string[];
  
  // UI-specific properties
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  
  // Enhanced astrological properties
  astrologicalInfluences?: string[];
  zodiacInfluences?: ZodiacSign[];
  lunarPhaseInfluences?: LunarPhase[];
  planetaryInfluences?: {
    favorable: string[];   // Planet names that enhance this recipe
    unfavorable: string[]; // Planet names that diminish this recipe
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
  [key: string]: any;
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

// Validation utilities
export const validateElementalProperties = (properties?: ElementalProperties): boolean => {
  if (!properties) return false;
  
  const requiredElements = ['Fire', 'Water', 'Earth', 'Air'] as const;
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

export const validateSeason = (season: string): boolean => {
  const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
  return validSeasons.includes(season.toLowerCase());
};

export const validateSeasonality = (seasonality: string[]): boolean => {
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
  if (!validateElementalProperties(ingredient.elementalProperties)) return false;
  
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
  
  // Add astrological associations
  zodiacInfluences?: ZodiacSign[];
  planetaryInfluences?: string[]; // Planet names
  lunarPhaseInfluences?: LunarPhase[];
}

// Extended recipe with optional description
export interface RecipeExtended {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredientExt[];
  instructions: string[];
  timeToMake: string;
  numberOfServings: number;
  elementalProperties: ElementalProperties;
  season?: string[];
  mealType?: string[];
  cuisine?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Inherited properties from RecipeIngredientExt (excluding 'amount' and 'unit')
  category?: string;
  optional?: boolean;
  preparation?: string;
  zodiacInfluences?: ZodiacSign[];
  lunarPhaseInfluences?: LunarPhase[];
  
  // Enhanced astrological properties
  astrologicalInfluences?: string[];
  planetaryInfluences?: {
    favorable: string[];   // Planet names that enhance this recipe
    unfavorable: string[]; // Planet names that diminish this recipe
  };
  
  alchemicalScores?: {
    elementalScore: number;
    zodiacalScore: number;
    lunarScore: number;
    planetaryScore: number;
    seasonalScore: number;
  };
  
  [key: string]: any;
}

export interface ScoredRecipeExtended extends RecipeExtended {
  score: number;
}

export type TimeOfDay = 'morning' | 'noon' | 'evening' | 'night';

// Enhanced Recipe interface with culinary details
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
  
  // Technique Details
  cookingMethod: string[]; // Primary cooking methods used
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
    ingredients: any[];    // Ingredients specific to this component
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
  
  // Seasonal & Astrological Information
  season: string[];        // Seasons when optimal
  seasonalIngredients: string[]; // Ingredients that are seasonal
  
  // Enhanced astrological properties
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  
  astrologicalInfluences: string[];
  zodiacInfluences: ZodiacSign[];
  lunarPhaseInfluences: LunarPhase[];
  planetaryInfluences: {
    favorable: string[];   // Planet names that enhance this recipe
    unfavorable: string[]; // Planet names that diminish this recipe
    neutral: string[];     // Planet names with minimal effect
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

export interface RecipeProps {
  recipe: Recipe;
  // Add these props to the interface if they're needed
  score?: number;
  elements?: ElementalProperties;
  dominantElements?: [string, number][];
} 