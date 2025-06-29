// Unified types for the application
import type { ElementalProperties, AlchemicalProperties } from './alchemy';
import type { Season, Element } from './shared';

// NOTE: UnifiedIngredient is defined in '@/data/unified/unifiedTypes'. Import from there.

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
