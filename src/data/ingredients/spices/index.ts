import type { IngredientMapping } from '@/types/alchemy';
import { wholeSpices } from './wholeSpices';
import { groundSpices } from './groundSpices';
import { spiceBlends } from './spiceBlends';
import { CuisineType } from '@/types/alchemy';

// Combine all spice categories
export const spices: Record<string, IngredientMapping> = {
  ...wholeSpices,
  ...groundSpices,
  ...spiceBlends,
  'cumin': {
    // ... previous properties remain
    culinary_traditions: {
      [CuisineType.INDIAN]: {
        name: 'jeera',
        usage: ['tadka', 'garam masala', 'curry'],
        preparation: 'whole roasted, ground, or tempered in oil',
        pairings: ['coriander', 'turmeric', 'cardamom'],
        cultural_notes: 'One of the most important spices in Indian cuisine',
        medicinal_use: 'Aids digestion, used in Ayurveda'
      },
      [CuisineType.MIDDLE_EASTERN]: {
        name: 'kamoun',
        usage: ['kushary', 'falafel', 'shawarma'],
        preparation: 'ground, often toasted',
        pairings: ['chickpeas', 'lamb', 'rice'],
        cultural_notes: 'Essential in many spice blends'
      }
    }
  }
};

// Export individual categories
export {
  wholeSpices,
  groundSpices,
  spiceBlends
};

// Helper functions
export const getSpicesBySubCategory = (subCategory: string): Record<string, IngredientMapping> => {
  return Object.entries(spices)
    .filter(([_, value]) => value.subCategory === subCategory)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSpicesByOrigin = (origin: string): Record<string, IngredientMapping> => {
  return Object.entries(spices)
    .filter(([_, value]) => 
      Array.isArray(value.origin) 
        ? value.origin.includes(origin)
        : value.origin === origin
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSpicesByElementalProperty = (element: string, minStrength: number = 0.3): Record<string, IngredientMapping> => {
  return Object.entries(spices)
    .filter(([_, value]) => 
      value.elementalProperties[element] >= minStrength
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSpiceBlendComponents = (blendName: string): string[] => {
  const blend = spiceBlends[blendName];
  return blend ? blend.baseIngredients : [];
};

export const getCompatibleSpices = (spiceName: string): string[] => {
  const spice = spices[spiceName];
  if (!spice) return [];
  
  return Object.entries(spices)
    .filter(([key, value]) => 
      key !== spiceName && 
      value.affinities?.some(affinity => 
        spice.affinities?.includes(affinity)
      )
    )
    .map(([key, _]) => key);
};

export const getSubstitutions = (spiceName: string): string[] => {
  const spice = spices[spiceName];
  if (!spice) return [];

  return Object.entries(spices)
    .filter(([key, value]) => 
      key !== spiceName &&
      value.qualities.some(quality => 
        spice.qualities.includes(quality)
      ) &&
      value.elementalProperties[Object.keys(spice.elementalProperties)[0]] >= 0.3
    )
    .map(([key, _]) => key);
};

export const getSpicesByPreparationMethod = (method: string): Record<string, IngredientMapping> => {
  return Object.entries(spices)
    .filter(([_, value]) => 
      value.preparation && 
      Object.keys(value.preparation).includes(method)
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getTraditionalBlends = (region: string): Record<string, IngredientMapping> => {
  return Object.entries(spiceBlends)
    .filter(([_, value]) => 
      value.origin === region || 
      value.regionalVariations?.[region]
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSpiceConversionRatio = (fromSpice: string, toSpice: string): string | null => {
  const source = spices[fromSpice];
  const target = spices[toSpice];
  
  if (!source || !target || !source.conversionRatio || !target.conversionRatio) {
    return null;
  }
}
