// Ingredient types
import type { ElementalProperties } from './alchemy';
import type { Season } from './shared';

export interface IngredientCategory {
  id: string;
  name: string;
  description: string;
  elementalAffinity: ElementalProperties;
}

export interface IngredientRecommendation {
  ingredient: {
    id: string;
    name: string;
    category: string;
    elementalProperties: ElementalProperties;
  };
  matchScore: number;
  reason: string;
  category: string;
}

export { Season, type ElementalProperties };
