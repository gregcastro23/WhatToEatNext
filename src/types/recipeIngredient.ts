import type { ElementalProperties } from '@/types/alchemy';

/**
 * Comprehensive recipe ingredient type that covers all use cases
 * in the application
 */
export interface RecipeIngredient {
  // Core properties (required)
  id?: string;
  name: string;
  amount: number;
  unit: string;
  
  // Categorization
  category?: string;
  subCategory?: string;
  
  // Preparation details
  preparation?: string;
  optional?: boolean;
  substitutes?: string[];
  notes?: string;
  
  // Nutritional information
  nutritionalProfile?: {
    calories?: number;
    macros?: {
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugars?: number;
    };
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
    phytonutrients?: Record<string, number>;
  };
  
  // Astrological and alchemical properties
  elementalProperties?: ElementalProperties;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    favorableZodiac?: string[];
    elementalAffinity?: string | {
      base: string;
      secondary?: string;
    };
  };
  
  // Seasonal availability
  season?: string[];
  
  // Flavor characteristics
  flavorProfile?: {
    spicy?: number;
    sweet?: number;
    sour?: number;
    bitter?: number;
    salty?: number;
    umami?: number;
  };
  
  // Additional properties
  [key: string]: any;
}

/**
 * Simplified ingredient interface for basic recipe displays
 */
export interface SimpleIngredient {
  id?: string;
  name: string;
  amount: number;
  unit: string;
}

/**
 * Validates an ingredient object against the RecipeIngredient interface
 */
export function validateIngredient(ingredient: any): boolean {
  if (!ingredient) return false;
  
  // Required properties
  if (!ingredient.name || typeof ingredient.name !== 'string') return false;
  if (typeof ingredient.amount !== 'number') return false;
  if (!ingredient.unit || typeof ingredient.unit !== 'string') return false;
  
  // Validate elemental properties if present
  if (ingredient.elementalProperties) {
    const props = ingredient.elementalProperties;
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    if (!requiredElements.every(element => typeof props[element] === 'number')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a default RecipeIngredient with the minimum required properties
 */
export function createDefaultIngredient(name: string): RecipeIngredient {
  return {
    name,
    amount: 1,
    unit: 'unit',
    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  };
} 