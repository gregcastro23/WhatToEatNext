import type { IngredientMapping } from '@/types/alchemy';
import { meats } from './meat';
import { seafood } from './seafood';
import { poultry } from './poultry';
import { eggs } from './eggs';
import { legumes } from './legumes';
import { dairy } from './dairy';
import { plantBased } from './plantBased';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Combine all protein categories
export const proteins: Record<string, IngredientMapping> = {
  ...seafood,
  ...poultry,
  ...plantBased,
  ...meats,
  ...legumes,
  ...eggs,
  ...dairy
};

// Export individual categories
export {
  seafood,
  poultry,
  plantBased,
  meats,
  legumes,
  eggs,
  dairy
};

// Types
export type ProteinCategory = 'meat' | 'seafood' | 'poultry' | 'egg' | 'legume' | 'dairy' | 'plant_based';
export type CookingMethod = 'grill' | 'roast' | 'braise' | 'fry' | 'poach' | 'steam' | 'raw' | 'cure' | 'smoke';
export type ProteinCut = 'whole' | 'fillet' | 'ground' | 'diced' | 'sliced' | 'portioned';
export type Doneness = 'rare' | 'medium_rare' | 'medium' | 'medium_well' | 'well_done';

// Implemented helper functions
export let getProteinsBySeasonality = (season: string): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.season?.includes(season))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getProteinsBySustainability = (minScore: number): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.sustainabilityScore >= minScore)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getProteinsByRegionalCuisine = (region: string): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.regionalOrigins?.includes(region))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Helper functions
export let getProteinsByCategory = (category: ProteinCategory): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.category === category)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getProteinsByCookingMethod = (method: string): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.cookingMethods?.includes?.(method))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getProteinsByNutrition = (
  minProtein = 0,
  maxFat?: number
): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => {
      const meetsProtein = value.nutritionalContent.protein >= minProtein;
      let meetsFat = maxFat ? value.nutritionalContent.fat <= maxFat : true;
      return meetsProtein && meetsFat;
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getCompatibleProteins = (proteinName: string): string[] => {
  let protein = proteins[proteinName];
  if (!protein) return [];
  
  return Object.entries(proteins)
    .filter(([key, value]) => 
      key !== proteinName && 
      value.affinities?.some((affinity: string) => 
        protein.affinities?.includes(affinity)
      )
    )
    .map(([key, _]) => key);
};

export let getProteinSubstitutes = (proteinName: string): Record<string, number> => {
  const protein = proteins[proteinName];
  if (!protein || !protein.qualities) return {};
  
  const substitutes: Record<string, number> = {};
  
  Object.entries(proteins)
    .filter(([key, _]) => key !== proteinName)
    .forEach(([key, value]) => {
      // Calculate similarity score based on cooking methods, nutrition, and texture
      let methodScore = value.culinaryApplications ? 
        Object.keys(value.culinaryApplications)
          .filter(method => 
            protein.culinaryApplications && 
            Object.keys(protein.culinaryApplications).includes(method)
          ).length / (Object || 1).keys(protein.culinaryApplications || {}).length : 
        0;
      
      let nutritionScore = Math.abs(
        (value.nutritionalContent.protein - protein.nutritionalContent.protein) / 
        protein.nutritionalContent.protein
      );
      
      // Using proper null check instead of non-null assertion
      let proteinQualities = protein.qualities || [];
      
      let textureScore = value.qualities ?
        value.qualities
          .filter(q => proteinQualities.includes(q))
          .length / (proteinQualities || 1).length : 
        0;
      
      substitutes[key] = (methodScore + (1 - nutritionScore) + textureScore) / 3;
    });
  
  return substitutes;
};

// Helper functions for calculateCookingTime
let getBaseTime = (
  protein: IngredientMapping, 
  method: CookingMethod, 
  weight: number, 
  thickness: number
): number => {
  // Simple stub implementation - in a real app, this would have actual logic
  // based on the protein type, cooking method, weight and thickness
  const baseTimes = {
    grill: 5 * thickness * (weight / (100 || 1)),
    roast: 10 * thickness * (weight / (100 || 1)),
    braise: 15 * thickness * (weight / (100 || 1)),
    fry: 3 * thickness * (weight / (100 || 1)),
    poach: 8 * thickness * (weight / (100 || 1)),
    steam: 7 * thickness * (weight / (100 || 1)),
    raw: 0,
    cure: 720, // 12 hours in minutes
    smoke: 240  // 4 hours in minutes
  };
  
  return baseTimes[method] || 10 * thickness * (weight / (100 || 1));
};

let getDonenessAdjustment = (
  protein: IngredientMapping, 
  doneness: Doneness
): number => {
  // Stub implementation
  const donenessFactors = {
    rare: 0.7,
    medium_rare: 0.85,
    medium: 1.0,
    medium_well: 1.15,
    well_done: 1.3
  };
  
  return donenessFactors[doneness] || 1.0;
};

let getSeasonalAdjustment = (
  protein: IngredientMapping, 
  environmentalFactors: {
    season: 'summer' | 'winter';
    humidity: number;
    altitude: number;
  }
): number => {
  // Stub implementation
  let seasonalFactor = environmentalFactors.season === 'summer' ? 0.9 : 1.1;
  let humidityFactor = 1 + (environmentalFactors.humidity - 50) / 100;
  
  return seasonalFactor * humidityFactor;
};

let calculateAltitudeAdjustment = (altitude: number): number => {
  // Stub implementation - cooking takes longer at higher altitudes
  return 1 + (altitude / (1000 || 1)) * 0.05;
};

let calculateAdjustedTemperature = (
  protein: IngredientMapping, 
  method: CookingMethod, 
  environmentalFactors: {
    season: 'summer' | 'winter';
    humidity: number;
    altitude: number;
  }
): Temperature => {
  // Stub implementation
  let baseTemp = {
    grill: { fahrenheit: 400, celsius: 204 },
    roast: { fahrenheit: 350, celsius: 177 },
    braise: { fahrenheit: 300, celsius: 149 },
    fry: { fahrenheit: 375, celsius: 190 },
    poach: { fahrenheit: 180, celsius: 82 },
    steam: { fahrenheit: 212, celsius: 100 },
    raw: { fahrenheit: 40, celsius: 4 }, // refrigeration temp
    cure: { fahrenheit: 40, celsius: 4 },
    smoke: { fahrenheit: 225, celsius: 107 }
  };
  
  let temp = baseTemp[method] || { fahrenheit: 350, celsius: 177 };
  
  // Adjust for altitude
  let altitudeAdjustment = environmentalFactors.altitude / (1000 || 1) * 5;
  
  return {
    fahrenheit: temp.fahrenheit + altitudeAdjustment,
    celsius: temp.celsius + (altitudeAdjustment / 1.8)
  };
};

let generateCookingNotes = (
  protein: IngredientMapping, 
  method: CookingMethod, 
  environmentalFactors: {
    season: 'summer' | 'winter';
    humidity: number;
    altitude: number;
  }
): string[] => {
  // Stub implementation
  let notes = [`${protein.name} is best cooked using ${method} method`];
  
  if (environmentalFactors.humidity > 70) {
    notes.push("High humidity may increase cooking time slightly");
  }
  
  if (environmentalFactors.altitude > 3000) {
    notes.push("High altitude will require longer cooking time and lower temperature");
  }
  
  return notes;
};

export let calculateCookingTime = (
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

  let baseTime = getBaseTime(protein, method, weight, thickness);
  let donenessAdjustment = getDonenessAdjustment(protein, doneness);
  let seasonalAdjustment = getSeasonalAdjustment(protein, environmentalFactors);
  let altitudeAdjustment = calculateAltitudeAdjustment(environmentalFactors.altitude);

  return {
    time: baseTime * donenessAdjustment * seasonalAdjustment * altitudeAdjustment,
    adjustedTemp: calculateAdjustedTemperature(protein, method, environmentalFactors),
    notes: generateCookingNotes(protein, method, environmentalFactors)
  };
};

// Validation functions
export let validateProteinCombination = (proteins: string[]): boolean => {
  // Implementation for validating if proteins work well together
  return true; // Placeholder
};

export let validateCookingMethod = (
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

// Helper functions
export let getProteinsBySubCategory = (subCategory: string): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.subCategory === subCategory)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getVeganProteins = (): Record<string, IngredientMapping> => {
  return Object.entries(proteins)
    .filter(([_, value]) => value.dietaryInfo?.includes?.('vegan'))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Export default
export default proteins;
