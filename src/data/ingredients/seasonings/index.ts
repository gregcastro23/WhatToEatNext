import type { ElementalProperties } from '@/types/alchemy';
import type { IngredientMapping } from '@/data/ingredients/types';
import { spices } from '../spices';
import { salts } from './salts';
import { peppers } from './peppers';
import { herbs } from '../herbs';
import { aromatics } from './aromatics';

// Combine all seasoning categories, but exclude oils and vinegars
export const seasonings: Record<string, IngredientMapping> = {
  ...spices,
  ...salts,
  ...peppers,
  ...herbs,
  ...aromatics
};

// Export individual categories, excluding oils and vinegars
export {
  spices,
  salts,
  peppers,
  herbs,
  aromatics
};

// Types
export type SeasoningCategory = 'spice' | 'salt' | 'pepper' | 'herb' | 'aromatic';
export type SeasoningIntensity = 'mild' | 'medium' | 'strong' | 'intense';
export type CulinaryTiming = 'beginning' | 'middle' | 'end' | 'finishing' | 'multiple';
export type PreservationMethod = 'drying' | 'salting' | 'fermenting' | 'infusing' | 'smoking';
export type SeasoningAstrologicalProfile = {
  rulingPlanets: string[];
  favorableZodiac: string[];
  elementalAffinity: {
    base: string;
    decanModifiers: {
      first: { element: string; planet: string };
      second: { element: string; planet: string };
      third: { element: string; planet: string };
    };
  };
  lunarPhaseModifiers?: {
    [phase: string]: {
      elementalBoost: Partial<ElementalProperties>;
      preparationTips: string[];
    };
  };
};

// Update salts category to be 'seasoning' with subCategory 'salt'
let updateSaltCategory = (salts: Record<string, IngredientMapping>): Record<string, IngredientMapping> => {
  return Object.entries(salts)
    .reduce((acc, [key, value]) => {
      acc[key] = {
        ...value,
        category: 'seasoning',
        subCategory: 'salt'
      };
      return acc;
    }, {} as Record<string, IngredientMapping>);
};

// Export updated salts
export let categorizedSalts = updateSaltCategory(salts);

// Helper functions
export let getSeasoningsByCategory = (category: SeasoningCategory): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => value.category === category)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getSeasoningsByIntensity = (intensity: SeasoningIntensity): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => value.qualities?.includes(intensity))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getCompatibleSeasonings = (seasoningName: string): string[] => {
  const seasoning = seasonings[seasoningName];
  if (!seasoning) return [];
  
  return Object.entries(seasonings)
    .filter(([key, value]) => 
      key !== seasoningName && 
      Array.isArray(value.affinities) && value.affinities.some((affinity: string) => 
        Array.isArray(seasoning.affinities) && seasoning.affinities.includes(affinity)
      )
    )
    .map(([key, _]) => key);
};

export let getSeasoningsByTiming = (timing: CulinaryTiming): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => 
      value.culinaryApplications && 
      Object.values(value.culinaryApplications).some(app => 
        (app as any)?.timing === timing
      )
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getTraditionalCombinations = (cuisine: string): Record<string, string[]> => {
  const combinations: Record<string, string[]> = {};
  
  Object.entries(seasonings)
    .forEach(([key, value]) => {
      if (Array.isArray(value.traditionalCombinations) && value.traditionalCombinations.includes(cuisine)) {
        if (!combinations[key]) {
          combinations[key] = [];
        }
        combinations[key].push(...value.traditionalCombinations);
      }
    });
  
  return combinations;
};

export let getSeasoningsByLunarPhase = (phase: string): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => value.astrologicalProfile?.lunarPhaseModifiers?.[phase])
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getSeasoningsByElementalBoost = (element: string): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => 
      value.astrologicalProfile?.lunarPhaseModifiers && 
      Object.values(value.astrologicalProfile.lunarPhaseModifiers)
        .some(modifier => (modifier as any)?.elementalBoost?.[element as keyof ElementalProperties])
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
