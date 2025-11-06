import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';
import { vinegars } from './vinegars';

export { vinegars };
export default vinegars;

// Export specific vinegar categories
// Don't re-import vinegars - use the one already imported
export const processedVinegars: Record<string, IngredientMapping> = fixIngredientMappings(vinegars);

export const _wineVinegars: Record<string, IngredientMapping> = Object.entries(processedVinegars)
  .filter(([_, value]) => value.subCategory === 'wine')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _fruitVinegars: Record<string, IngredientMapping> = Object.entries(processedVinegars)
  .filter(([_, value]) => value.subCategory === 'fruit')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _grainVinegars: Record<string, IngredientMapping> = Object.entries(processedVinegars)
  .filter(([_, value]) => value.subCategory === 'grain')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _specialtyVinegars: Record<string, IngredientMapping> = Object.entries(
  processedVinegars,
)
  .filter(
    ([_, value]) =>
      value.subCategory === 'specialty' ||
      (value.subCategory !== 'wine' &&
        value.subCategory !== 'fruit' &&
        value.subCategory !== 'grain')
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
