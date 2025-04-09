import type { IngredientMapping } from '@/types/alchemy';
import { meats } from './meats';
import { seafood } from './seafood';
import { poultry } from './poultry';
import { eggs } from './eggs';
import { legumes } from './legumes';
import { dairy } from './dairy';
import { plantBased } from './plantBased';

// Combine all protein categories
export const proteins: Record<string, IngredientMapping> = {
  ...meats,
  ...seafood,
  ...poultry,
  ...eggs,
  ...legumes,
  ...dairy,
  ...plantBased
};

// Export individual categories
export {
  meats,
  seafood,
  poultry,
  eggs,
  legumes,
  dairy,
  plantBased
};

// Types
export type ProteinCategory = 'meat' | 'seafood' | 'poultry' | 'egg' | 'legume' | 'dairy' | 'plant_based';
export type CookingMethod = 'grill' | 'roast' | 'braise' | 'fry' | 'poach' | 'steam' | 'raw' | 'cure' | 'smoke';
export type ProteinCut = 'whole' | 'fillet' | 'ground' | 'diced' | 'sliced' | 'portioned';
export type Doneness = 'rare' | 'medium_rare' | 'medium' | 'medium_well' | 'well_done';

// Implemented helper functions
export const getProteinsBySeasonality = (season: string): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.season?.includes(season))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getProteinsBySustainability = (minScore: number): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.sustainabilityScore >= minScore)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getProteinsByRegionalCuisine = (region: string): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.regionalOrigins?.includes(region))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Helper functions
export const getProteinsByCategory = (category: ProteinCategory): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.category === category)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getProteinsByCookingMethod = (method: CookingMethod): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => 
      value.culinaryApplications && 
      Object.keys(value.culinaryApplications).includes(method)
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getProteinsByNutrition = (
  minProtein: number = 0,
  maxFat?: number
): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => {
      const meetsProtein = value.nutritionalContent.protein >= minProtein;
      const meetsFat = maxFat ? value.nutritionalContent.fat <= maxFat : true;
      return meetsProtein && meetsFat;
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getCompatibleProteins = (proteinName: string): string[] => {
  const protein = proteins[proteinName];
  if (!protein) return [];
  
  return Object.entries(proteins)
    .filter(([key, value]) => 
      key !== proteinName && 
      value.affinities?.some(affinity => 
        protein.affinities?.includes(affinity)
      )
    )
    .map(([key, _]) => key);
};

export const getProteinSubstitutes = (proteinName: string): Record<string, number> => {
  const protein = proteins[proteinName];
  if (!protein) return {};
  
  const substitutes: Record<string, number> = {};
  
  Object.entries(proteins)
    .filter(([key, _]) => key !== proteinName)
    .forEach(([key, value]) => {
      // Calculate similarity score based on cooking methods, nutrition, and texture
      const methodScore = value.culinaryApplications ? 
        Object.keys(value.culinaryApplications)
          .filter(method => 
            protein.culinaryApplications && 
            Object.keys(protein.culinaryApplications).includes(method)
          ).length / 
        Object.keys(protein.culinaryApplications || {}).length : 
        0;
      
      const nutritionScore = Math.abs(
        (value.nutritionalContent.protein - protein.nutritionalContent.protein) / 
        protein.nutritionalContent.protein
      );
      
      const textureScore = value.qualities
        .filter(q => protein.qualities.includes(q))
        .length / protein.qualities.length;
      
      substitutes[key] = (methodScore + (1 - nutritionScore) + textureScore) / 3;
    });
  
  return substitutes;
};

export const calculateCookingTime = (
  proteinName: string,
  method: CookingMethod,
  weight: number,
  thickness: number,
  doneness: Doneness,
  environmentalFactors: {
    season: 'summer' | 'winter';
    humidity: number;
    altitude: number;
  }
): {
  time: number;
  adjustedTemp: Temperature;
  notes: string[];
} => {
  const protein = proteins[proteinName];
  if (!protein) throw new Error('Protein not found');

  const baseTime = getBaseTime(protein, method, weight, thickness);
  const donenessAdjustment = getDonenessAdjustment(protein, doneness);
  const seasonalAdjustment = getSeasonalAdjustment(protein, environmentalFactors);
  const altitudeAdjustment = calculateAltitudeAdjustment(environmentalFactors.altitude);

  return {
    time: baseTime * donenessAdjustment * seasonalAdjustment * altitudeAdjustment,
    adjustedTemp: calculateAdjustedTemperature(protein, method, environmentalFactors),
    notes: generateCookingNotes(protein, method, environmentalFactors)
  };
};

// Validation functions
export const validateProteinCombination = (proteins: string[]): boolean => {
  // Implementation for validating if proteins work well together
  return true; // Placeholder
};

export const validateCookingMethod = (
  proteinName: string,
  method: CookingMethod,
  cut: ProteinCut
): boolean => {
  // Implementation for validating if cooking method is appropriate
  return true; // Placeholder
};

// Extended Type Definitions
export type Temperature = {
  fahrenheit: number;
  celsius: number;
};

export type TemperatureRange = {
  min: Temperature;
  max: Temperature;
  ideal: Temperature;
};

export interface CookingProfile {
  method: CookingMethod;
  temperature: TemperatureRange;
  internalTemp: {
    rare?: Temperature;
    medium_rare: Temperature;
    medium: Temperature;
    medium_well: Temperature;
    well_done: Temperature;
  };
  restingTime: {
    minimum: number; // minutes
    recommended: number;
    maximum: number;
  };
  carryoverCooking: {
    expectedRise: Temperature;
    restingConditions: string[];
  };
}

export interface SafetyThresholds {
  minimum: Temperature;
  holdingTemp: Temperature;
  dangerZone: {
    min: Temperature;
    max: Temperature;
  };
  maximumRestTime: number; // minutes at room temperature
}

export interface SeasonalAdjustment {
  summer: {
    cookingTemp: Temperature;
    timeAdjustment: number; // percentage
    methodPreference: CookingMethod[];
  };
  winter: {
    cookingTemp: Temperature;
    timeAdjustment: number;
    methodPreference: CookingMethod[];
  };
  humidity: {
    high: {
      timeAdjustment: number;
      notes: string[];
    };
    low: {
      timeAdjustment: number;
      notes: string[];
    };
  };
}

// Export default
export default proteins;
