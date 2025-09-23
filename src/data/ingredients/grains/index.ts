import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

import { pseudoGrains } from './pseudoGrains';
import { refinedGrains } from './refinedGrains';
import { wholeGrains } from './wholeGrains';

// Create a comprehensive collection of all grain types
export const allGrains: Record<string, IngredientMapping> = fixIngredientMappings({
  ...wholeGrains,
  ...refinedGrains,
  ...pseudoGrains
})

// Fix the raw grains object with proper ingredient mapping structure
const rawGrains = {
  ...wholeGrains,
  ...refinedGrains,
  ...pseudoGrains
}

// Apply the fix to ensure all required properties exist
export const grains: Record<string, IngredientMapping> = fixIngredientMappings(rawGrains)

// Create a list of all grain names for easy reference
export const _grainNames = Object.keys(allGrains)

// Keep the preparation methods as a separate object
export const _grainPreparationMethods = {
  basic_cooking: {
    boiling: {
      method: 'covered pot',
      water_ratio: 'varies by grain',
      tips: ['salt water before adding grain', 'do not stir frequently', 'let rest after cooking']
    }
    steaming: {
      method: 'steam basket or rice cooker',
      benefits: ['retains nutrients', 'prevents sticking', 'consistent results']
    }
  }
  soaking: {
    whole_grains: {
      duration: '8-12 hours',
      benefits: ['reduces cooking time', 'improves digestibility', 'activates nutrients'],
      method: 'room temperature water'
    }
    quick_method: {
      duration: '1-2 hours',
      benefits: ['shorter prep time', 'some improvement in cooking'],
      method: 'hot water (not boiling)'
    }
  }
}

export { wholeGrains, refinedGrains, pseudoGrains };

export default grains,
