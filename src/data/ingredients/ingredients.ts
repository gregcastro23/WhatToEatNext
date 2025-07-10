// Consolidated ingredients export file - Fixed for TS2308 conflicts
// Use explicit re-exports instead of wildcard exports to avoid naming conflicts

// Re-export specific types from types module
export type { 
  Ingredient,
  CookingMethod,
  ElementalProperties,
  AlchemicalProperties,
  ThermodynamicProperties
} from './types';

// Re-export specific data from index module (avoiding conflicts)
export { 
  VALID_CATEGORIES,
  DEFAULT_ELEMENTAL_PROPERTIES,
  getAllIngredientsByCategory,
  getAllVegetables,
  getAllProteins,
  getAllHerbs,
  getAllSpices,
  getAllGrains
} from './index';

// Re-export specific ingredient categories with explicit names
export { fruits } from './fruits';
export { enhancedVegetables as vegetables } from './vegetables';
export { herbs } from './herbs';
export { spices } from './spices';
export { allGrains as grains } from './grains';
export { allOils as oils } from './oils';
export { seasonings } from './seasonings';
export { vinegars } from './vinegars/vinegars';
export { meats, poultry, seafood, plantBased } from './proteins/index';

// Re-export flavor profiles
export * from './flavorProfiles';
export * from './elementalProperties';

// Re-export the main index as default
import * as ingredientData from './index';
export default ingredientData;

import { ElementalProperties, IngredientCategory, AlchemicalProperties , Season, zodiacElements } from '../../types/alchemy';
import { 
  calculateAlchemicalNumber,
  calculateAlchemicalNumberCompatibility,
  deriveAlchemicalFromElemental
} from '../unified/alchemicalCalculations';
import { calculateElementalCompatibility } from '../../utils/elemental/elementalUtils';

/**
 * Calculate compatibility score between two ingredients
 * 
 * @description Calculates a compatibility score based on elemental
 * properties, traditional pairings, A# (alchemical number) alignment,
 * and flavor harmony principles
 * 
 * @param ingredient1 - First ingredient
 * @param ingredient2 - Second ingredient
 * @returns Compatibility score (0-1)
 * 
 * @usage Internal utility for compatibility analysis
 */
function calculateIngredientCompatibility(ingredient1: Ingredient, ingredient2: Ingredient): number {
  let score = 0;
  let factors = 0;

  // Elemental compatibility (weight: 0.3)
  const elementalScore = calculateElementalCompatibility(
    ingredient1.elementalProperties,
    ingredient2.elementalProperties
  );
  score += elementalScore * 0.3;
  factors += 0.3;

  // A# (Alchemical Number) alignment (weight: 0.25)
  const alchemicalScore = calculateIngredientAlchemicalAlignment(ingredient1, ingredient2);
  score += alchemicalScore * 0.25;
  factors += 0.25;

  // Traditional pairing compatibility (weight: 0.25)
  const pairingScore = calculatePairingCompatibility(ingredient1, ingredient2);
  if (pairingScore !== null) {
    score += pairingScore * 0.25;
    factors += 0.25;
  }

  // Category compatibility (weight: 0.15)
  const categoryScore = calculateCategoryCompatibility(ingredient1.category, ingredient2.category);
  score += categoryScore * 0.15;
  factors += 0.15;

  // Quality compatibility (weight: 0.05)
  const qualityScore = calculateQualityCompatibility(
    ingredient1.qualities || [],
    ingredient2.qualities || []
  );
  score += qualityScore * 0.05;
  factors += 0.05;

  return factors > 0 ? score / factors : 0;
}

/**
 * Calculate A# (Alchemical Number) alignment between two ingredients
 * 
 * @description Evaluates alchemical complexity compatibility using A# values
 * 
 * @param ingredient1 - First ingredient
 * @param ingredient2 - Second ingredient
 * @returns A# alignment score (0-1)
 */
function calculateIngredientAlchemicalAlignment(ingredient1: Ingredient, ingredient2: Ingredient): number {
  try {
    // Derive alchemical properties from elemental properties
    const alchemical1 = deriveAlchemicalFromElemental(ingredient1.elementalProperties);
    const alchemical2 = deriveAlchemicalFromElemental(ingredient2.elementalProperties);
    
    // Calculate A# for both ingredients
    const a1 = calculateAlchemicalNumber(alchemical1);
    const a2 = calculateAlchemicalNumber(alchemical2);
    
    // Calculate compatibility score
    const compatibility = calculateAlchemicalNumberCompatibility(alchemical1, alchemical2);
    
    // Bonus for similar complexity levels (A# values within 2 points)
    const complexityBonus = Math.abs(a1 - a2) <= 2 ? 0.1 : 0;
    
    return Math.max(0, Math.min(1, compatibility + complexityBonus));
  } catch (error) {
    console.warn('A# alignment calculation failed for ingredients:', ingredient1.name, ingredient2.name, error);
    return 0.5; // Default neutral score
  }
}

/**
 * Calculate pairing compatibility between two ingredients
 * Based on traditional culinary pairings and flavor harmony
 */
function calculatePairingCompatibility(ingredient1: Ingredient, ingredient2: Ingredient): number | null {
  // For now, return null to indicate no pairing data available
  // This can be enhanced with actual pairing data in the future
  return null;
}

/**
 * Calculate category compatibility between ingredient categories
 */
function calculateCategoryCompatibility(category1: IngredientCategory, category2: IngredientCategory): number {
  // Define category compatibility matrix
  const compatibilityMatrix: Record<IngredientCategory, Record<IngredientCategory, number>> = {
    vegetables: {
      vegetables: 0.9,
      fruits: 0.7,
      herbs: 0.8,
      spices: 0.6,
      grains: 0.7,
      proteins: 0.8,
      oils: 0.6,
      seasonings: 0.7,
      vinegars: 0.6
    },
    fruits: {
      vegetables: 0.7,
      fruits: 0.8,
      herbs: 0.6,
      spices: 0.5,
      grains: 0.6,
      proteins: 0.5,
      oils: 0.7,
      seasonings: 0.6,
      vinegars: 0.5
    },
    herbs: {
      vegetables: 0.8,
      fruits: 0.6,
      herbs: 0.9,
      spices: 0.8,
      grains: 0.7,
      proteins: 0.8,
      oils: 0.7,
      seasonings: 0.8,
      vinegars: 0.7
    },
    spices: {
      vegetables: 0.6,
      fruits: 0.5,
      herbs: 0.8,
      spices: 0.9,
      grains: 0.6,
      proteins: 0.7,
      oils: 0.8,
      seasonings: 0.9,
      vinegars: 0.8
    },
    grains: {
      vegetables: 0.7,
      fruits: 0.6,
      herbs: 0.7,
      spices: 0.6,
      grains: 0.8,
      proteins: 0.8,
      oils: 0.7,
      seasonings: 0.7,
      vinegars: 0.6
    },
    proteins: {
      vegetables: 0.8,
      fruits: 0.5,
      herbs: 0.8,
      spices: 0.7,
      grains: 0.8,
      proteins: 0.7,
      oils: 0.8,
      seasonings: 0.8,
      vinegars: 0.7
    },
    oils: {
      vegetables: 0.6,
      fruits: 0.7,
      herbs: 0.7,
      spices: 0.8,
      grains: 0.7,
      proteins: 0.8,
      oils: 0.8,
      seasonings: 0.8,
      vinegars: 0.7
    },
    seasonings: {
      vegetables: 0.7,
      fruits: 0.6,
      herbs: 0.8,
      spices: 0.9,
      grains: 0.7,
      proteins: 0.8,
      oils: 0.8,
      seasonings: 0.9,
      vinegars: 0.8
    },
    vinegars: {
      vegetables: 0.6,
      fruits: 0.5,
      herbs: 0.7,
      spices: 0.8,
      grains: 0.6,
      proteins: 0.7,
      oils: 0.7,
      seasonings: 0.8,
      vinegars: 0.8
    }
  };

  return compatibilityMatrix[category1]?.[category2] || 0.5;
}

/**
 * Calculate quality compatibility between ingredient qualities
 */
function calculateQualityCompatibility(qualities1: string[], qualities2: string[]): number {
  if (!qualities1.length || !qualities2.length) return 0.5;
  
  const commonQualities = qualities1.filter(q => qualities2.includes(q));
  const totalQualities = new Set([...qualities1, ...qualities2]).size;
  
  return commonQualities.length / totalQualities;
} 