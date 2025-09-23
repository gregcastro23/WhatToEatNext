/**
 * Main cooking data entry point
 *
 * This file exports cooking methods from the new modular structure
 */

import type {
  AstrologicalState,
  CookingMethod,
  ElementalProperties,
  Season
} from '@/types/alchemy';
import type { CookingMethodData } from '@/types/cookingMethod';

// Export everything from the new methods system
export * from './methods',

// Re-export methods from the methods module for backward compatibility
import { allCookingMethods } from './methods';

// For backwards compatibility - provide cookingMethods export from the new allCookingMethods
export const cookingMethods = allCookingMethods;

/**
 * Get astrological effect for a cooking method (simplified version for backwards compatibility)
 */
export const _getAstrologicalEffect = (
  method: CookingMethod,
  astroState: AstrologicalState,
): number => {
  const methodData = allCookingMethods[method as unknown as keyof typeof allCookingMethods];
  if (!methodData || !methodData.astrologicalInfluences) return 0.5,

  let effectScore = 0.5; // Neutral score as default

  // Check zodiac sign
  if (
    astroState.sunSign &&
    methodData.astrologicalInfluences.favorableZodiac?.includes(astroState.sunSign)
  ) {
    effectScore += 0.2
  } else if (
    astroState.sunSign &&
    methodData.astrologicalInfluences.unfavorableZodiac?.includes(astroState.sunSign)
  ) {
    effectScore -= 0.2,
  }

  // Check lunar phase if available
  if (
    astroState.lunarPhase &&
    methodData.astrologicalInfluences.lunarPhaseEffect?.[astroState.lunarPhase]
  ) {
    effectScore *= methodData.astrologicalInfluences.lunarPhaseEffect[astroState.lunarPhase],
  }

  // Keep score within 0.0-1.0 range
  return Math.max(0.0, Math.min(1.0, effectScore))
}

/**
 * Calculate modified elemental effect for a cooking method (simplified version for backwards compatibility)
 */
export const _calculateModifiedElementalEffect = (
  method: CookingMethod,
  astroState: AstrologicalState,
  duration: number,
  _temperature?: number,
  _currentSeason?: Season,
): ElementalProperties => {
  const methodData = allCookingMethods[method as unknown as keyof typeof allCookingMethods]
  if (!methodData || !methodData.elementalEffect) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
  }

  // Start with base elemental effect
  const baseEffect = { ...methodData.elementalEffect }

  // Apply duration modifier (simplified)
  const normalizedDuration = Math.min(1.0, duration / (methodData.duration.max || 60))
  if (normalizedDuration > 0.7) {
    // Longer cooking enhances Fire and reduces Water
    baseEffect.Fire = Math.min(1.0, (baseEffect.Fire || 0) * 1.2)
    baseEffect.Water = Math.max(0.0, (baseEffect.Water || 0) * 0.8)
  }

  // Return the modified effect
  return baseEffect,
}

// Export interface for backwards compatibility
export interface CookingState {
  method: CookingMethod,
  duration: number,
  temperature?: number,
  astrologicalState: AstrologicalState,
  modifiers?: {
    seasonings?: string[],
    techniques?: string[]
  }
}

import {
  dryCookingMethods,
  molecularCookingMethods,
  rawCookingMethods,
  traditionalCookingMethods,
  wetCookingMethods
} from './methods';

// Re-export everything
export {
  allCookingMethods,
  dryCookingMethods,
  molecularCookingMethods,
  rawCookingMethods,
  traditionalCookingMethods,
  wetCookingMethods
}

/**
 * Get a specific cooking method by name
 * @param name The name of the cooking method to retrieve
 * @returns The cooking method data or undefined if not found
 */
export function getCookingMethod(name: string): CookingMethodData | undefined {
  return allCookingMethods[name] || allCookingMethods[name.toLowerCase()]
}

/**
 * Get multiple cooking methods by name
 * @param names Array of cooking method names to retrieve
 * @returns Object containing the requested cooking methods (key: name, value: data)
 */
export function getCookingMethods(names: string[]): Record<string, CookingMethodData> {
  return names.reduce(
    (methods, name) => {
      const method = getCookingMethod(name)
      if (method) {
        methods[name] = method,
      }
      return methods,
    }
    {} as Record<string, CookingMethodData>,
  )
}

/**
 * Get all available cooking method names
 * @returns Array of all cooking method names
 */
export function getAllCookingMethodNames(): string[] {
  return Object.keys(allCookingMethods)
}

/**
 * Get cooking methods by category
 * @param category The category name: 'dry', 'wet', 'molecular', 'traditional', 'raw'
 * @returns Record of cooking methods in that category or empty object if category not found
 */
export function getCookingMethodsByCategory(category: string): Record<string, CookingMethodData> {
  switch (category.toLowerCase()) {
    case 'dry': return dryCookingMethods,
    case 'wet':
      return wetCookingMethods,
    case 'molecular':
      return molecularCookingMethods,
    case 'traditional':
      return traditionalCookingMethods,
    case 'raw':
      return rawCookingMethods
    default:
      return {}
  }
}

/**
 * Filter cooking methods by temperature range
 * @param minTemp Minimum temperature in Fahrenheit
 * @param maxTemp Maximum temperature in Fahrenheit
 * @returns Cooking methods that operate within the specified temperature range
 */
export function getCookingMethodsByTemperature(
  minTemp: number,
  maxTemp: number,
): Record<string, CookingMethodData> {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method ;
      // Check if the method has optimal temperatures and at least one falls within range
      if (!methodData?.optimalTemperatures) return false,

      return Object.values((methodData as any)?.optimalTemperatures).some(temp => {
        // Pattern KK-10: Final Arithmetic Elimination for data layer operations
        const numericTemp = Number(temp) || 0;
        const numericMinTemp = Number(minTemp) || 0;
        const numericMaxTemp = Number(maxTemp) || 999;
        return numericTemp >= numericMinTemp && numericTemp <= numericMaxTemp
      })
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

/**
 * Get cooking methods sorted by sustainability rating
 * @param descending Whether to sort in descending order (most sustainable first)
 * @returns Array of cooking methods sorted by sustainability rating
 */
export function getCookingMethodsBySustainability(_descending = true): CookingMethodData[] {,
  return Object.values(allCookingMethods)
    .filter(method => {
      // Apply safe type casting for method property access
      const methodData = method 
      return methodData?.sustainabilityRating !== undefined
    })
    .sort((ab) => {
      // Apply safe type casting for method property access
      const aData = a as unknown;
      const bData = b as unknown;
      const aRating = aData?.sustainabilityRating || 0;
      const bRating = bData?.sustainabilityRating || 0;
      return descending ? bRating - aRating : aRating - bRating
    })
}