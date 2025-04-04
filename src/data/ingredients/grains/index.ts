import { wholeGrains } from './wholeGrains';
import { refinedGrains } from './refinedGrains';
import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Fix the raw grains object with proper ingredient mapping structure
const rawGrains = {
  'whole': wholeGrains,
  'refined': refinedGrains,
};

// Apply the fix to ensure all required properties exist
export const grains: Record<string, IngredientMapping> = fixIngredientMappings(rawGrains);

// Keep the preparation methods as a separate object
export const grainPreparationMethods = {
  'basic_cooking': {
    'boiling': {
      method: 'covered pot',
      water_ratio: 'varies by grain',
      tips: [
        'salt water before adding grain',
        'do not stir frequently',
        'let rest after cooking'
      ]
    },
    'steaming': {
      method: 'steam basket or rice cooker',
      benefits: [
        'retains nutrients',
        'prevents sticking',
        'consistent results'
      ]
    }
  },
  'soaking': {
    'whole_grains': {
      duration: '8-12 hours',
      benefits: [
        'reduces cooking time',
        'improves digestibility',
        'activates nutrients'
      ],
      method: 'room temperature water'
    },
    'quick_method': {
      duration: '1-2 hours',
      benefits: [
        'shorter prep time',
        'some improvement in cooking'
      ],
      method: 'hot water (not boiling)'
    }
  },
  'storage': {
    'whole_grains': {
      container: 'airtight',
      location: 'cool, dry place',
      duration: '6 months to 1 year',
      tips: [
        'check for moisture',
        'protect from light',
        'label with date'
      ]
    },
    'refined_grains': {
      container: 'airtight',
      location: 'room temperature',
      duration: '1-2 years',
      tips: [
        'protect from insects',
        'keep dry',
        'check periodically'
      ]
    }
  }
};

export {
  wholeGrains,
  refinedGrains
};

export default grains;