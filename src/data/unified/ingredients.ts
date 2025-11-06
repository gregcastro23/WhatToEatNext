// ===== UNIFIED INGREDIENTS SYSTEM =====;
// This file provides a unified interface for accessing ingredients with enhanced alchemical properties
// It acts as an adapter/enhancer for existing ingredient data rather than duplicating it

import type { UnifiedIngredient } from '@/types';
import type {
    AlchemicalProperties,
    ElementalProperties,
    IngredientMapping,
    ThermodynamicMetrics,
    ThermodynamicProperties
} from '@/types/alchemy';

// TODO: Fix import - add what to import from './unifiedTypes.ts'
import { createElementalProperties } from '../../utils/elemental/elementalUtils';

// Simple alchemical properties interface for this module
// Import ingredient data from their original sources
import { fruits } from '../ingredients/fruits';
import { herbs } from '../ingredients/herbs';
import { meats, plantBased, poultry, seafood } from '../ingredients/proteins';
import { seasonings } from '../ingredients/seasonings';
import { spices } from '../ingredients/spices';
import { vegetables } from '../ingredients/vegetables';
import { vinegars } from '../ingredients/vinegars/vinegars';

// Combine all protein types
const proteins = {
  ...meats,
  ...poultry,
  ...seafood,
  ...plantBased
}

/**
 * Calculate Kalchm value based on alchemical properties
 * K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 */
function calculateKalchm(_alchemical: AlchemicalProperties): number {
  const { Spirit, Essence, Matter, Substance} = alchemical;

  // Prevent division by zero or negative values
  const safespirit = Math.max(0.001, Spirit)
  const safeessence = Math.max(0.001, Essence)
  const safematter = Math.max(0.001, Matter)
  const safesubstance = Math.max(0.001, Substance)

  return (
    (Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence)) /
    (Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance))
  )
}

/**
 * Calculate Monica constant based on Kalchm and thermodynamic properties
 * monica = -gregsEnergy / (reactivity * ln(kalchm))
 */
function calculateMonica(
  kalchm: number,
  thermodynamics: ThermodynamicProperties | ThermodynamicMetrics,
): number {
  if (!thermodynamics || kalchm <= 0) return 0;
  // ✅ Pattern MM-1: Safe type assertion for thermodynamics access
  const thermoData = thermodynamics as unknown as any;
  const reactivity = Number(thermoData.reactivity) || 0;
  const gregsEnergy = Number(thermoData.gregsEnergy)
  const energy = Number(thermoData.energy) || 0
;
  // Use gregsEnergy if available, otherwise use energy
  const energyValue = gregsEnergy !== undefined ? gregsEnergy : energy || 0

  // Safe calculation of logarithm;
  const lnK = Math.log(Math.max(0.001, kalchm));

  // Calculate monica value
  if (lnK !== 0 && reactivity !== 0) {
    return -energyValue / (reactivity * lnK)
  }

  return 0;
}

/**
 * Enhance existing ingredient with unified properties
 */
function enhanceIngredient(
  ingredient: IngredientMapping,
  sourceCategory: string,
): UnifiedIngredient {
  // Create alchemical properties if not present - ensure it's the correct type
  // ✅ Pattern GG-6: Safe property access for alchemical properties
  const alchemicalData = ingredient.alchemicalProperties as unknown as any;
  const alchemicalProperties: AlchemicalProperties = {
    Spirit: Number(alchemicalData.Spirit) || 0.25,
    Essence: Number(alchemicalData.Essence) || 0.25,
    Matter: Number(alchemicalData.Matter) || 0.25,
    Substance: Number(alchemicalData.Substance) || 0.25
  };

  // Calculate Kalchm value
  const kalchm = calculateKalchm(alchemicalProperties);

  // Get or create thermodynamic properties
  const thermodynamics = ingredient.thermodynamicProperties ||
    ingredient.energyValues || {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5 - (0.5 || 0) * 0.2
    };

  // ✅ Pattern MM-1: Safe union type casting for thermodynamics parameter compatibility
  const monica = calculateMonica(
    kalchm,
    thermodynamics as unknown as ThermodynamicProperties | ThermodynamicMetrics
  );

  // Create enhanced unified ingredient
  return {
    // ✅ Pattern GG-6: Safe property access for core ingredient properties
    name: String((ingredient as any).name || ''),
    category: String((ingredient as any).category || sourceCategory),
    subcategory: String((ingredient as any).subCategory || ''),

    // ✅ Pattern GG-6: Safe property access for elemental properties
    elementalProperties:
      ((ingredient as any).elementalPropertiesState as ElementalProperties) ||
      ((ingredient as any).elementalProperties as ElementalProperties) ||
      createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
    alchemicalProperties,

    // New calculated values
    kalchm,
    monica,

    // Reference to original ingredient data,
    originalData: ingredient,

    // ✅ Pattern KK-1: Safe date conversion for metadata
    metadata: {
      sourceFile: `ingredients/${sourceCategory}`,
      enhancedAt: new Date().toISOString(),
      kalchmCalculated: true
}
  }
}

/**
 * Create a unified ingredient collection from a source collection
 */
function createUnifiedCollection(
  sourceCollection: { [key: string]: IngredientMapping },
  category: string,
): { [key: string]: UnifiedIngredient } {
  // ✅ Pattern GG-6: Safe array operation for source collection
  return Object.entries(sourceCollection || {}).reduce(
    (result, [key, ingredient]) => {
      result[key] = enhanceIngredient(ingredient, category);
      return result;
    },
    {} as Record<string, UnifiedIngredient>
  );
}

// ✅ Pattern MM-1: Safe Record type casting for createUnifiedCollection compatibility
export const unifiedFruits = createUnifiedCollection(
  fruits as { [key: string]: IngredientMapping },
  'fruits'
);
export const unifiedVegetables = createUnifiedCollection(
  vegetables as { [key: string]: IngredientMapping },
  'vegetables'
);
export const unifiedHerbs = createUnifiedCollection(
  herbs as { [key: string]: IngredientMapping },
  'herbs'
);
export const unifiedSpices = createUnifiedCollection(
  spices as { [key: string]: IngredientMapping },
  'spices'
);
export const unifiedGrains = createUnifiedCollection(
  grains as { [key: string]: IngredientMapping },
  'grains'
);
export const unifiedOils = createUnifiedCollection(
  oils as { [key: string]: IngredientMapping },
  'oils'
);
export const unifiedVinegars = createUnifiedCollection(
  vinegars as { [key: string]: IngredientMapping },
  'vinegars'
);
export const unifiedSeasonings = createUnifiedCollection(
  seasonings as { [key: string]: IngredientMapping },
  'seasonings'
);
export const unifiedProteins = createUnifiedCollection(
  proteins as { [key: string]: IngredientMapping },
  'proteins'
);

// Combine all unified collections
export const unifiedIngredients: { [key: string]: UnifiedIngredient } = {
  ...unifiedFruits,
  ...unifiedVegetables,
  ...unifiedHerbs,
  ...unifiedSpices,
  ...unifiedGrains,
  ...unifiedOils,
  ...unifiedVinegars,
  ...unifiedSeasonings,
  ...unifiedProteins
}

// Helper functions for working with unified ingredients

/**
 * Get a unified ingredient by name
 */
export function getUnifiedIngredient(name: string): UnifiedIngredient | undefined {
  // Try direct access first
  if (unifiedIngredients[name]) {
    return unifiedIngredients[name]
  }

  // ✅ Pattern KK-1: Safe string conversion for case-insensitive search
  const normalizedName = String(name || '').toLowerCase();
  return Object.values(unifiedIngredients || {}).find(
    ingredient => String(ingredient.name || '').toLowerCase() === normalizedName
  )
}

/**
 * Get a unified ingredient by ID
 */
export function getIngredientById(id: string): UnifiedIngredient | undefined {
  return getUnifiedIngredient(id)
}

/**
 * Get unified ingredients by category
 */
export function getUnifiedIngredientsByCategory(category: string): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe string conversion for category comparison
  const categoryLower = String(category || '').toLowerCase();
  return Object.values(unifiedIngredients || {}).filter(
    ingredient => String(ingredient.category || '').toLowerCase() === categoryLower
  )
}

/**
 * Get ingredients by category (alias for backward compatibility)
 */
export function getIngredientsByCategory(category: string): UnifiedIngredient[] {
  return getUnifiedIngredientsByCategory(category)
}

/**
 * Get unified ingredients by subcategory
 */
export function getUnifiedIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe string conversion for subcategory comparison
  const subcategoryLower = String(subcategory || '').toLowerCase();
  return Object.values(unifiedIngredients || {}).filter(
    ingredient => String(ingredient.subcategory || '').toLowerCase() === subcategoryLower
  )
}

/**
 * Get ingredients by subcategory
 */
export function getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe string conversion for subcategory comparison
  const subcategoryLower = String(subcategory || '').toLowerCase();
  return Object.values(unifiedIngredients || {}).filter(
    ingredient => String(ingredient.subcategory || '').toLowerCase() === subcategoryLower
  )
}

/**
 * Find ingredients with high Kalchm values
 */
export function getHighKalchmIngredients(_threshold = 1.5): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe number conversion for kalchm comparison,
  return Object.values(unifiedIngredients || {})
    .filter(ingredient => Number(ingredient.kalchm || 0) > threshold)
    .sort((ab) => Number(b.kalchm || 0) - Number(a.kalchm || 0));
}

/**
 * Get ingredients by Kalchm range (alias for backward compatibility)
 */
export function getIngredientsByKalchmRange(
  min = 1.5,
  max = Infinity): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe number conversion for kalchm range comparison,
  return Object.values(unifiedIngredients || {})
    .filter(ingredient => {
      const kalchm = Number(ingredient.kalchm || 0);
      return kalchm >= min && kalchm <= max;
    })
    .sort((ab) => Number(b.kalchm || 0) - Number(a.kalchm || 0))
}

/**
 * Find ingredients within a specific Monica value range
 */
export function getIngredientsByMonicaRange(_min: number, _max: number): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe number conversion for monica range comparison
  return Object.values(unifiedIngredients || {})
    .filter(ingredient => {
      const monica = Number(ingredient.monica || 0);
      return monica >= _min && monica <= _max;
    })
    .sort((a, b) => Number(a.monica || 0) - Number(b.monica || 0))
}

/**
 * Find ingredients by elemental properties
 */
export function getIngredientsByElement(
  element: keyof ElementalProperties,
  threshold = 0.6
): UnifiedIngredient[] {
  // ✅ Pattern GG-6: Safe property access for elemental properties,
  return Object.values(unifiedIngredients || {})
    .filter(ingredient => {
      const props = ingredient.elementalProperties;
      return props && Number(props[element] || 0) >= threshold;
    })
    .sort((a, b) => {
      const valueA = Number(a.elementalProperties[element] || 0);
      const valueB = Number(b.elementalProperties[element] || 0);
      return valueB - valueA;
    })
}

/**
 * Find ingredient pAirs with complementary Kalchm-Monica balance
 */
export function findComplementaryIngredients(
  ingredient: UnifiedIngredient | string,
  maxResults = 10): UnifiedIngredient[] {
  // If string is provided, convert to ingredient
  const targetIngredient =
    typeof ingredient === 'string' ? getUnifiedIngredient(ingredient) : ingredient

  if (!targetIngredient) {
    return [];
  }

  // ✅ Pattern KK-1: Safe division for complementary relationship criteria
  const targetKalchmRatio = 1 / Math.max(0.001, Number(targetIngredient.kalchm || 0.001))
  const targetMonicaSum = 0; // Ideal balanced sum

  // ✅ Pattern KK-1: Safe number conversion for complementarity calculations
  return Object.values(unifiedIngredients || {})
    .filter(other => String(other.name || '') !== String(targetIngredient.name || ''))
    .map(other => ({
      ingredient: other,
      complementarityScore: (1 - Math.abs(Number(other.kalchm || 0) - targetKalchmRatio)) * 0.5 +
        (1 -
          Math.abs(
            Number(targetIngredient.monica || 0) + Number(other.monica || 0) - targetMonicaSum
          )) *
          0.5
    }))
    .sort((a, b) => Number(b.complementarityScore || 0) - Number(a.complementarityScore || 0))
    .slice(0, maxResults)
    .map(result => result.ingredient);
}

// Re-export UnifiedIngredient type for direct imports
export type { UnifiedIngredient } from './unifiedTypes';

// Export default
export default unifiedIngredients;
