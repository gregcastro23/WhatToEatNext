// Unified types for the application
import type { ElementalProperties, AlchemicalProperties } from './alchemy';
import type { Season, Element } from './shared';

export interface UnifiedIngredient {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  elementalProperties: ElementalProperties;
  alchemicalProperties?: AlchemicalProperties;
  
  // Kalchm and Monica properties for alchemical calculations
  kalchm?: number;      // K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
  monica?: number;      // Monica constant for ingredient optimization
  elementalState?: ElementalProperties; // Additional elemental state property
  nutritionalPropertiesProfile?: Record<string, unknown>; // Enhanced nutritional properties
  
  nutritionalProfile?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
  };
  season?: Season[];
  qualities?: string[];
  description?: string;
  cookingMethods?: string[];
  flavorProfile?: {
    sweet?: number;
    sour?: number;
    salty?: number;
    bitter?: number;
    umami?: number;
    spicy?: number;
  };
  origin?: string[];
  sustainabilityScore?: number;
  storageInstructions?: string;
  preparationTips?: string[];
}

export interface UnifiedRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: Array<{
    ingredient: UnifiedIngredient;
    amount: string;
    preparation?: string;
  }>;
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  mealType: string[];
  elementalProperties: ElementalProperties;
  nutritionalProfile: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags?: string[];
}

export type { UnifiedIngredient as default };
