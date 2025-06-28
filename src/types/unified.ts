// Unified types for the application
import type { ElementalProperties, AlchemicalProperties } from './alchemy';
import type { Season, Element } from './shared';

// UnifiedIngredient is now defined in '@/data/unified/unifiedTypes'.
// Please import from there instead of this file.

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
