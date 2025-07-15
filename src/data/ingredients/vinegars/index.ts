import { vinegars } from './vinegars';
import { fixIngredientMappings } from '@/utils/elementalUtils';
import type { IngredientMapping } from '@/data/ingredients/types';

export { vinegars };
export default vinegars;

// Export specific vinegar categories
// Don't re-import vinegars - use the one already imported
export const processedVinegars: Record<string, IngredientMapping> = fixIngredientMappings(vinegars);

export const wineVinegars: Record<string, IngredientMapping> = Object.entries(processedVinegars)
  .filter(([_, value]) => (value as IngredientMapping).subCategory === 'wine')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const fruitVinegars: Record<string, IngredientMapping> = Object.entries(processedVinegars)
  .filter(([_, value]) => (value as IngredientMapping).subCategory === 'fruit')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const grainVinegars: Record<string, IngredientMapping> = Object.entries(processedVinegars)
  .filter(([_, value]) => (value as IngredientMapping).subCategory === 'grain')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const specialtyVinegars: Record<string, IngredientMapping> = Object.entries(processedVinegars)
  .filter(([_, value]) => (value as IngredientMapping).subCategory === 'specialty' || 
    ((value as IngredientMapping).subCategory !== 'wine' && (value as IngredientMapping).subCategory !== 'fruit' && (value as IngredientMapping).subCategory !== 'grain'))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}); 