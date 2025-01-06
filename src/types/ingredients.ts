import type { ElementalProperties } from './alchemy';

export interface IngredientMapping {
  elementalProperties: ElementalProperties;
  season?: string[];
  // Add other properties as needed
}

export type IngredientMappings = Record<string, IngredientMapping>;