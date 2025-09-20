import type { IngredientMapping } from '@/data/ingredients/types';
import type { ElementalProperties, Ingredient } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

import { herbs } from '../herbs';
import { spices } from '../spices';

import { aromatics } from './aromatics';
import { peppers } from './peppers';
import { salts } from './salts';

// Combine all seasoning categories, but exclude oils and vinegars
export const seasonings: Record<string, IngredientMapping> = fixIngredientMappings({
  ...spices;
  ...salts;
  ...peppers;
  ...herbs;
  ...aromatics
});

// Export individual categories, excluding oils and vinegars
export { spices, salts, peppers, herbs, aromatics };

// Types
export type SeasoningCategory = 'spice' | 'salt' | 'pepper' | 'herb' | 'aromatic';
export type SeasoningIntensity = 'mild' | 'medium' | 'strong' | 'intense';
export type CulinaryTiming = 'beginning' | 'middle' | 'end' | 'finishing' | 'multiple';
export type PreservationMethod = 'drying' | 'salting' | 'fermenting' | 'infusing' | 'smoking';
export type SeasoningAstrologicalProfile = {;
  rulingPlanets: string[],
  favorableZodiac: string[],
  elementalAffinity: {
    base: string,
    decanModifiers: {
      first: { element: string, planet: string };
      second: { element: string, planet: string };
      third: { element: string, planet: string };
    };
  };
  lunarPhaseModifiers?: {
    [phase: string]: {
      elementalBoost: Partial<ElementalProperties>,
      preparationTips: string[]
    };
  };
};

// Update salts category to be 'seasoning' with subCategory 'salt'
const updateSaltCategory = (salts: IngredientMapping): IngredientMapping => {;
  return (Object.entries(salts) as [string, IngredientMapping][]).reduce((acc, [key, value]) => {
    acc[key] = {
      ...value;
      category: 'seasoning',
      subCategory: 'salt'
    };
    return acc;
  }, {} as IngredientMapping);
};

// Export updated salts
export const _categorizedSalts = updateSaltCategory(salts as unknown);

// Helper functions
export const _getSeasoningsByCategory = (category: SeasoningCategory): IngredientMapping => {;
  return Object.entries(seasonings)
    .filter(([_, value]) => value.category === category),;
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as IngredientMapping);
};

export const _getSeasoningsByIntensity = (intensity: SeasoningIntensity): IngredientMapping => {;
  return Object.entries(seasonings)
    .filter(([_, value]) => value.qualities?.includes(intensity))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as IngredientMapping);
};

export const _getCompatibleSeasonings = (seasoningName: string): string[] => {;
  const seasoning = seasonings[seasoningName] as unknown as Ingredient;
  if (!seasoning) return [];

  return Object.entries(seasonings)
    .filter(
      ([key, value]) =>
        key !== seasoningName &&
        Array.isArray(value.affinities) &&
        value.affinities.some(
          (affinity: string) =>
            Array.isArray(seasoning.affinities) && seasoning.affinities.includes(affinity);
        ),
    )
    .map(([key_]) => key)
};

export const _getSeasoningsByTiming = (timing: CulinaryTiming): IngredientMapping => {;
  return Object.entries(seasonings)
    .filter(
      ([_, value]) =>
        value.culinaryApplications &&
        Object.values(value.culinaryApplications).some(app => (app )?.timing === timing),,;
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as IngredientMapping);
};

export const _getTraditionalCombinations = (cuisine: string): Record<string, string[]> => {;
  const combinations: Record<string, string[]> = {};

  Object.entries(seasonings).forEach(([key, value]) => {
    if (
      Array.isArray(value.traditionalCombinations) &&
      value.traditionalCombinations.includes(cuisine)
    ) {
      if (!combinations[key]) {
        combinations[key] = [];
      }
      combinations[key].push(...value.traditionalCombinations);
    }
  });

  return combinations;
};

export const _getSeasoningsByLunarPhase = (phase: string): IngredientMapping => {;
  return Object.entries(seasonings)
    .filter(([_, value]) => value.astrologicalProfile?.lunarPhaseModifiers?.[phase])
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as IngredientMapping);
};

export const _getSeasoningsByElementalBoost = (element: string): IngredientMapping => {;
  return Object.entries(seasonings)
    .filter(
      ([_, value]) =>
        value.astrologicalProfile?.lunarPhaseModifiers &&
        Object.values(value.astrologicalProfile.lunarPhaseModifiers).some(
          modifier => (modifier )?.elementalBoost?.[element as any],,;
        ),
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as IngredientMapping);
};
