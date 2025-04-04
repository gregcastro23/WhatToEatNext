import type { IngredientMapping, ElementalProperties } from '@/types/alchemy';
import { spices } from '../spices';
import { vinegars } from './vinegars';
import { salts } from './salts';
import { peppers } from './peppers';
import { herbs } from '../herbs';
import { aromatics } from './aromatics';

// Combine all seasoning categories
export const seasonings: Record<string, IngredientMapping> = {
  ...spices,
  ...vinegars,
  ...salts,
  ...peppers,
  ...herbs,
  ...aromatics
};

// Export individual categories
export {
  spices,
  vinegars,
  salts,
  peppers,
  herbs,
  aromatics
};

// Types
export type SeasoningCategory = 'spice' | 'vinegar' | 'salt' | 'pepper' | 'herb' | 'aromatic';
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

// Helper functions
export const getSeasoningsByCategory = (category: SeasoningCategory): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => value.category === category)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSeasoningsByIntensity = (intensity: SeasoningIntensity): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => value.qualities?.includes(intensity))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getCompatibleSeasonings = (seasoningName: string): string[] => {
  const seasoning = seasonings[seasoningName];
  if (!seasoning) return [];
  
  return Object.entries(seasonings)
    .filter(([key, value]) => 
      key !== seasoningName && 
      value.affinities?.some((affinity: string) => 
        seasoning.affinities?.includes(affinity)
      )
    )
    .map(([key, _]) => key);
};

export const getSeasoningsByTiming = (timing: CulinaryTiming): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => 
      value.culinaryApplications && 
      Object.values(value.culinaryApplications).some(app => 
        app.timing === timing
      )
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getTraditionalCombinations = (cuisine: string): Record<string, string[]> => {
  const combinations: Record<string, string[]> = {};
  
  Object.entries(seasonings)
    .forEach(([key, value]) => {
      if (value.traditionalCombinations && value.traditionalCombinations.includes(cuisine)) {
        if (!combinations[key]) {
          combinations[key] = [];
        }
        combinations[key].push(...value.traditionalCombinations);
      }
    });
  
  return combinations;
};

export const getSeasoningsByLunarPhase = (phase: string): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => value.astrologicalProfile?.lunarPhaseModifiers?.[phase])
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSeasoningsByElementalBoost = (element: string): Record<string, IngredientMapping> => {
  return Object.entries(seasonings)
    .filter(([_, value]) => 
      value.astrologicalProfile?.lunarPhaseModifiers && 
      Object.values(value.astrologicalProfile.lunarPhaseModifiers)
        .some(modifier => modifier.elementalBoost[element as keyof ElementalProperties])
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
