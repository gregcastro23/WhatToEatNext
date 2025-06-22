// ===== UNIFIED INGREDIENTS SYSTEM =====
// This file provides a unified interface for accessing ingredients with enhanced alchemical properties
// It acts as an adapter/enhancer for existing ingredient data rather than duplicating it

import type { 
  IngredientMapping, 
  ElementalProperties, 
  ThermodynamicMetrics,
  ThermodynamicProperties,
  AlchemicalProperties 
} from "@/types/alchemy";

import type { 
  UnifiedIngredient 
} from "@/types/unified";
// TODO: Fix import - add what to import from "./unifiedTypes.ts"
import { createElementalProperties } from '../../utils/elemental/elementalUtils';

// Simple alchemical properties interface for this module
// Import ingredient data from their original sources
import { fruits } from '../ingredients/fruits';
import { vegetables } from '../ingredients/vegetables';
import { herbs } from '../ingredients/herbs';
import { spices } from '../ingredients/spices';
import { allGrains as grains } from '../ingredients/grains';
import { allOils as oils } from '../ingredients/oils';
import { vinegars } from '../ingredients/vinegars/vinegars';
import { seasonings } from '../ingredients/seasonings';
import { meats, poultry, seafood, plantBased } from '../ingredients/proteins';

// Combine all protein types
const proteins = {
  ...meats,
  ...poultry,
  ...seafood,
  ...plantBased
};

/**
 * Calculate Kalchm value based on alchemical properties
 * K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 */
function calculateKalchm(alchemical: AlchemicalProperties): number {
  const { Spirit, Essence, Matter, Substance } = alchemical;
  
  // Prevent division by zero or negative values
  const safespirit = Math.max(0.001, Spirit);
  const safeessence = Math.max(0.001, Essence);
  const safematter = Math.max(0.001, Matter);
  const safesubstance = Math.max(0.001, Substance);
  
  return (Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence)) / 
         (Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance));
}

/**
 * Calculate Monica constant based on Kalchm and thermodynamic properties
 * monica = -gregsEnergy / (reactivity * ln(kalchm))
 */
function calculateMonica(
  kalchm: number, 
  thermodynamics: ThermodynamicProperties | ThermodynamicMetrics
): number {
  if (!thermodynamics || kalchm <= 0) return 0;
  
  const { reactivity, gregsEnergy, energy } = thermodynamics as Record<string, any>;
  
  // Use gregsEnergy if available, otherwise use energy
  const energyValue = gregsEnergy !== undefined ? gregsEnergy : (energy || 0);
  
  // Safe calculation of logarithm
  const lnK = Math.log(Math.max(0.001, kalchm));
  
  // Calculate monica value
  if (lnK !== 0 && reactivity !== 0) {
    return -energyValue / (reactivity * lnK);
  }
  
  return 0;
}

/**
 * Enhance existing ingredient with unified properties
 */
function enhanceIngredient(ingredient: IngredientMapping, sourceCategory: string): UnifiedIngredient {
  // Calculate Kalchm and Monica constants
  const alchemicalProperties = ingredient.alchemicalProperties || { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  const kalchm = calculateKalchm(alchemicalProperties as AlchemicalProperties);
  const thermodynamics = {
    heat: 0,
    entropy: 0,
    reactivity: 0,
    energy: 0
  };
  const monica = calculateMonica(kalchm as any, thermodynamics as any);
  
  // Create enhanced unified ingredient
  return {
    // Core properties from original ingredient
    id: ingredient.name, // Use name as ID for now
    name: ingredient.name,
    category: ingredient.category || sourceCategory,
    subCategory: ingredient.subCategory,
    
    // Existing properties with proper type casting
    elementalProperties: ingredient.elementalProperties as ElementalProperties,
    alchemicalProperties: alchemicalProperties as AlchemicalProperties,
    
    // New calculated values
    kalchm,
    monica,
    
    // Additional properties with proper type casting
    qualities: (ingredient.qualities || []) as string[],
    origin: (ingredient.origin || []) as string[],
    
    // Metadata
    nutritionalPropertiesProfile: {
      sourceFile: `ingredients/${sourceCategory}`,
      enhancedAt: new Date()?.toISOString(),
      kalchmCalculated: true
    } as Record<string, unknown>
  };
}

/**
 * Create a unified ingredient collection from a source collection
 */
function createUnifiedCollection(
  sourceCollection: Record<string, IngredientMapping>,
  category: string
): Record<string, UnifiedIngredient> {
  return Object.entries(sourceCollection)?.reduce((result, [key, ingredient]) => {
    result[key] = enhanceIngredient(ingredient, category);
    return result;
  }, {} as Record<string, UnifiedIngredient>);
}

// Apply Pattern TS2322-E: Advanced Type Coercion for Import Conflicts - Force compatibility
export const unifiedFruits = createUnifiedCollection(fruits as unknown as Record<string, IngredientMapping>, 'fruits');
export const unifiedVegetables = createUnifiedCollection(vegetables as unknown as Record<string, IngredientMapping>, 'vegetables');
export const unifiedHerbs = createUnifiedCollection(herbs as unknown as Record<string, IngredientMapping>, 'herbs');
export const unifiedSpices = createUnifiedCollection(spices as unknown as Record<string, IngredientMapping>, 'spices');
export const unifiedGrains = createUnifiedCollection(grains as unknown as Record<string, IngredientMapping>, 'grains');
export const unifiedOils = createUnifiedCollection(oils as unknown as Record<string, IngredientMapping>, 'oils');
export const unifiedVinegars = createUnifiedCollection(vinegars as unknown as Record<string, IngredientMapping>, 'vinegars');
export const unifiedSeasonings = createUnifiedCollection(seasonings as unknown as Record<string, IngredientMapping>, 'seasonings');
export const unifiedProteins = createUnifiedCollection(proteins as unknown as Record<string, IngredientMapping>, 'proteins');

// Combine all unified collections
export const unifiedIngredients: Record<string, UnifiedIngredient> = {
  ...unifiedFruits,
  ...unifiedVegetables,
  ...unifiedHerbs,
  ...unifiedSpices,
  ...unifiedGrains,
  ...unifiedOils,
  ...unifiedVinegars,
  ...unifiedSeasonings,
  ...unifiedProteins
};

// Helper functions for working with unified ingredients

/**
 * Get a unified ingredient by name
 */
export function getUnifiedIngredient(name: string): UnifiedIngredient | undefined {
  // Try direct access first
  if (unifiedIngredients[name]) {
    return unifiedIngredients[name];
  }
  
  // Try case-insensitive search
  const normalizedName = name?.toLowerCase();
  return Object.values(unifiedIngredients)?.find(
    ingredient => ingredient.name?.toLowerCase() === normalizedName
  );
}

/**
 * Get a unified ingredient by ID
 */
export function getIngredientById(id: string): UnifiedIngredient | undefined {
  return getUnifiedIngredient(id);
}

/**
 * Get unified ingredients by category
 */
export function getUnifiedIngredientsByCategory(category: string): UnifiedIngredient[] {
  return Object.values(unifiedIngredients || {}).filter(ingredient => ingredient.category?.toLowerCase() === category?.toLowerCase()
  );
}

/**
 * Get ingredients by category (alias for backward compatibility)
 */
export function getIngredientsByCategory(category: string): UnifiedIngredient[] {
  return getUnifiedIngredientsByCategory(category);
}

/**
 * Get unified ingredients by subcategory
 */
export function getUnifiedIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
  return Object.values(unifiedIngredients || {}).filter(ingredient => ingredient.subcategory?.toLowerCase() === subcategory?.toLowerCase()
  );
}

/**
 * Get ingredients by subcategory
 */
export function getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
  return Object.values(unifiedIngredients || {}).filter(ingredient => ingredient.subcategory?.toLowerCase() === subcategory?.toLowerCase()
  );
}

/**
 * Find ingredients with high Kalchm values
 */
export function getHighKalchmIngredients(threshold = 1.5): UnifiedIngredient[] {
  return Object.values(unifiedIngredients)
    .filter(ingredient => ingredient.kalchm > threshold)
    .sort((a, b) => b.kalchm - a.kalchm);
}

/**
 * Get ingredients by Kalchm range (alias for backward compatibility)
 */
export function getIngredientsByKalchmRange(min: number = 1.5, max: number = Infinity): UnifiedIngredient[] {
  return Object.values(unifiedIngredients)
    .filter(ingredient => ingredient.kalchm >= min && ingredient.kalchm <= max)
    .sort((a, b) => b.kalchm - a.kalchm);
}

/**
 * Find ingredients within a specific Monica value range
 */
export function getIngredientsByMonicaRange(min: number, max: number): UnifiedIngredient[] {
  return Object.values(unifiedIngredients)
    .filter(ingredient => ingredient.monica >= min && ingredient.monica <= max)
    .sort((a, b) => a.monica - b.monica);
}

/**
 * Find ingredients by elemental properties
 */
export function getIngredientsByElement(element: keyof ElementalProperties, threshold = 0.6): UnifiedIngredient[] {
  return Object.values(unifiedIngredients)
    .filter(ingredient => {
      const props = ingredient.elementalPropertiesState;
      return props && props[element] >= threshold;
    })
    .sort((a, b) => b?.elementalState?.[element] - a?.elementalState?.[element]);
}

/**
 * Find ingredient pairs with complementary Kalchm-Monica balance
 */
export function findComplementaryIngredients(
  ingredient: UnifiedIngredient | string,
  maxResults: number = 10
): UnifiedIngredient[] {
  // If string is provided, convert to ingredient
  const targetIngredient = typeof ingredient === 'string' 
    ? getUnifiedIngredient(ingredient) 
    : ingredient;
    
  if (!targetIngredient) {
    return [];
  }
  
  // Define complementary relationship criteria
  const targetKalchmRatio = 1 / (targetIngredient.kalchm || 1);
  const targetMonicaSum = 0; // Ideal balanced sum
  
  return Object.values(unifiedIngredients)
    .filter(other => other.name !== targetIngredient.name)
    .map(other => ({
      ingredient: other,
      complementarityScore: (
        (1 - Math.abs((other.kalchm || 1) - targetKalchmRatio)) * 0.5 +
        (1 - Math.abs(((targetIngredient.monica || 0) + (other.monica || 0)) - targetMonicaSum)) * 0.5
      )
    }))
    .sort((a, b) => b.complementarityScore - a.complementarityScore)
    .slice(0, maxResults)
    .map(result => result.ingredient);
}

// Re-export UnifiedIngredient type for direct imports
export type { UnifiedIngredient } from "@/types/unified";

// Export default
export default unifiedIngredients; 