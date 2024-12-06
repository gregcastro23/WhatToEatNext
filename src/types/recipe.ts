import type { ElementalProperties, ZodiacSign } from './alchemy';

export interface Recipe {
  elementalProperties: ElementalProperties;
  cuisine: string;
  sunSign: ZodiacSign;
  name: string;
  description: string;
  // ... other recipe properties
}

export interface ScoredRecipe extends Recipe {
  mealType: string;
  astroPower: number;
  elementalHarmony: number;
  totalScore: number;
}