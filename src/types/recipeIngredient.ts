import { Ingredient, ElementalProperties } from './index';

/**
 * Comprehensive recipe ingredient type that covers all use cases
 * in the application
 */
export interface RecipeIngredient extends Ingredient {
  id?: string;
  amount: number;
  unit: string;
  optional?: boolean;
  preparation?: string;
  notes?: string;
  astrologicalProfile?: {
    elementalAffinity: {
      base: string;
      secondary?: string;
    };
    rulingPlanets: string[];
    zodiacAffinity?: string[];
  };
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
export function validateIngredient(ingredient: unknown): boolean {
  if (!ingredient || typeof ingredient !== 'object') {
    return false;
  }
  
  // Required properties
  if (!ingredient.name || typeof ingredient.name !== 'string') {
    return false;
  }
  
  if (typeof ingredient.amount !== 'number') {
    return false;
  }
  
  if (!ingredient.unit || typeof ingredient.unit !== 'string') {
    return false;
  }
  
  // Optional elemental properties
  if (ingredient.elementalProperties) {
    const props = ingredient.elementalProperties;
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    if (!requiredElements.every(element => typeof props[element] === 'number')) {
      return false;
    }
  }
  
  return true;
} 