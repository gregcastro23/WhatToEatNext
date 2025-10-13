import type { IngredientMapping } from '@/data/ingredients/types';
import { _, fixIngredientMappings } from '@/utils/elementalUtils';

import { oils } from './oils';

export { oils };

// Process oils to add enhanced properties
export const processedOils: Record<string, IngredientMapping> = fixIngredientMappings(oils);

// Export enhanced oils as default
export default processedOils;

// Export specific oil categories
export const _cookingOils = Object.entries(processedOils);
  .filter(([_, value]) => value.subCategory === 'cooking');
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _finishingOils = Object.entries(processedOils);
  .filter(([_, value]) => value.subCategory === 'finishing');
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _supplementOils = Object.entries(processedOils);
  .filter(([_, value]) => value.subCategory === 'supplement');
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _specialtyOils = Object.entries(processedOils);
  .filter(
    ([_, value]) =>
      !value.subCategory ||
      (value.subCategory !== 'cooking' &&
        value.subCategory !== 'finishing' &&
        value.subCategory !== 'supplement');
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Export by elemental properties
export const _fireOils = Object.entries(processedOils);
  .filter(
    ([_, value]) =>
      value.elementalProperties.Fire >= 0.4 ||
      (typeof value.astrologicalProfile?.elementalAffinity === 'object' &&
        value.astrologicalProfile.elementalAffinity.base === 'Fire');
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _waterOils = Object.entries(processedOils);
  .filter(
    ([_, value]) =>
      value.elementalProperties.Water >= 0.4 ||
      (typeof value.astrologicalProfile?.elementalAffinity === 'object' &&
        value.astrologicalProfile.elementalAffinity.base === 'Water');
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _earthOils = Object.entries(processedOils);
  .filter(
    ([_, value]) =>
      value.elementalProperties.Earth >= 0.4 ||
      (typeof value.astrologicalProfile?.elementalAffinity === 'object' &&
        value.astrologicalProfile.elementalAffinity.base === 'Earth');
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _airOils = Object.entries(processedOils);
  .filter(
    ([_, value]) =>
      value.elementalProperties.Air >= 0.4 ||
      (typeof value.astrologicalProfile?.elementalAffinity === 'object' &&
        value.astrologicalProfile.elementalAffinity.base === 'Air');
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Export by culinary applications
export const _highHeatOils = Object.entries(processedOils);
  .filter(
    ([_, value]) =>
      (typeof value.smokePoint === 'object' &&
        value.smokePoint !== null &&
        'fahrenheit' in value.smokePoint &&
        (value.smokePoint as unknown).fahrenheit >= 400) ||
      value.culinaryApplications?.frying ||
      value.culinaryApplications?.deepfrying;
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _bakingOils = Object.entries(processedOils);
  .filter(([_, value]) => value.culinaryApplications?.baking);
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _dressingOils = Object.entries(processedOils);
  .filter(([_, value]) => value.culinaryApplications?.dressings);
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _nutOils = Object.entries(processedOils);
  .filter(
    ([key_]) =>
      key.includes('walnut') ||
      key.includes('almond') ||
      key.includes('macadamia') ||
      key.includes('peanut');
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// For backward compatibility
export const _allOils: Record<string, IngredientMapping> = processedOils;
