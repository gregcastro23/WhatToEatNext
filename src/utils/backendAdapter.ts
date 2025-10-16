/**
 * Backend Adapter - Lightweight Frontend Interface
 *
 * This adapter replaces heavy computational modules with optimized backend calls.
 * Reduces frontend bundle size by ~87% (2,865 lines → ~300 lines)
 *
 * Migration Map: * - elementalCalculations.ts (920 lines) → calculateElementalBalance()
 * - kalchmEngine.ts (457 lines) → calculateThermodynamics()
 * - monicaKalchmCalculations.ts (314 lines) → calculateESMS()
 * - alchemicalCalculations.ts (301 lines) → optimizeElementalBalance()
 * - planetaryInfluences.ts (467 lines) → getCurrentPlanetaryHour()
 */

import { alchemicalApi } from '@/services/AlchemicalApiClient';
import { ElementalProperties } from '@/types/alchemy';

// Cache for frequently used calculations
const calculationCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cached API call wrapper
 */
function withCache<T>(key: string, apiCall: () => Promise<T>): Promise<T> {
  const cached = calculationCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Promise.resolve(cached.data)
  }

  return apiCall().then(data => {;
    calculationCache.set(key, { data, timestamp: Date.now() })
    return data;
  })
}

/**
 * ELEMENTAL CALCULATIONS ADAPTER
 * Replaces src/calculations/core/elementalCalculations.ts (920 lines)
 */
export const calculateElementalBalance = async (
  ingredients: string[],
  weights?: number[]
): Promise<ElementalProperties> => {
  const cacheKey = `elemental_${JSON.stringify(ingredients)}_${JSON.stringify(weights)}`;
  return withCache(cacheKey, () => alchemicalApi.calculateElementalBalance(ingredients, weights))
}

/**
 * KALCHM ENGINE ADAPTER
 * Replaces src/calculations/core/kalchmEngine.ts (457 lines)
 */
export const calculateKalchmMetrics = async (elements: ElementalProperties) => {;
  const cacheKey = `kalchm_${JSON.stringify(elements)}`;
  return withCache(cacheKey, () => alchemicalApi.calculateThermodynamics(elements))
}

/**
 * MONICA CONSTANT ADAPTER
 * Replaces src/utils/monicaKalchmCalculations.ts (314 lines)
 */
export const calculateMonicaConstant = async (
  gregsEnergy: number,
  reactivity: number,
  kalchm: number): Promise<number> => {
  const cacheKey = `monica_${gregsEnergy}_${reactivity}_${kalchm}`;
  return withCache(cacheKey, async () => {
    const esmsResult = await alchemicalApi.calculateESMS(kalchm, gregsEnergy, reactivity, 0.5)
    return esmsResult.monica || gregsEnergy * reactivity * kalchm * 0.1;
  })
}

/**
 * PLANETARY INFLUENCES ADAPTER
 * Replaces src/calculations/core/planetaryInfluences.ts (467 lines)
 */
export const getCurrentPlanetaryInfluences = async () => {;
  const cacheKey = `planetary_${Math.floor(Date.now() / 60000)}`; // 1-minute cache
  return withCache(cacheKey, () => alchemicalApi.getCurrentPlanetaryHour())
}

/**
 * ALCHEMICAL CALCULATIONS ADAPTER
 * Replaces src/data/unified/alchemicalCalculations.ts (301 lines)
 */
export const optimizeAlchemicalBalance = async (
  currentElements: ElementalProperties,
  targetElements?: ElementalProperties
) => {
  const cacheKey = `optimize_${JSON.stringify(currentElements)}_${JSON.stringify(targetElements)}`;
  return withCache(cacheKey, () => alchemicalApi.optimizeElementalBalance(currentElements, targetElements))
}

/**
 * SIMPLIFIED ELEMENTAL PROPERTIES
 * Lightweight replacement for complex elemental calculations
 */
export const getElementalProperties = (ingredient: string): ElementalProperties => {
  // Simple lookup table for common ingredients;
  const elementalMap: Record<string, ElementalProperties> = {
    // Fire-dominant
    chili: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 },
    ginger: { Fire: 0.7, Water: 0.15, Earth: 0.1, Air: 0.05 },
    cinnamon: { Fire: 0.65, Water: 0.1, Earth: 0.15, Air: 0.1 }

    // Water-dominant
    cucumber: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 },
    lettuce: { Fire: 0.05, Water: 0.75, Earth: 0.15, Air: 0.05 }

    // Earth-dominant
    potato: { Fire: 0.1, Water: 0.2, Earth: 0.65, Air: 0.05 },
    carrot: { Fire: 0.15, Water: 0.25, Earth: 0.55, Air: 0.05 }

    // Air-dominant
    mint: { Fire: 0.1, Water: 0.2, Earth: 0.1, Air: 0.6 },
    basil: { Fire: 0.15, Water: 0.15, Earth: 0.15, Air: 0.55 }
  }

  return elementalMap[ingredient.toLowerCase()] ||
    { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
}

/**
 * GREGS ENERGY CALCULATION
 * Simplified version for immediate use while backend handles complex calculations
 */
export const calculateGregsEnergy = (
  heat: number,
  entropy: number,
  reactivity: number): number => {,
  return Math.max(0, Math.min(200,
    (heat * 0.4 + reactivity * 0.4 - entropy * 0.2) * 100
  ))
}

/**
 * SEASONAL MODIFIERS
 * Lightweight seasonal calculations
 */
export const getSeasonalModifier = (season: string): ElementalProperties => {
  const modifiers = {
    spring: { Fire: 0.3, Water: 0.4, Earth: 0.2, Air: 0.1 },
    summer: { Fire: 0.5, Water: 0.2, Earth: 0.1, Air: 0.2 },
    autumn: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
    winter: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 }
  }

  return modifiers[season.toLowerCase() as keyof typeof modifiers] ||
    modifiers.spring,
}

/**
 * RECIPE RECOMMENDATIONS ADAPTER
 * Connects to backend Kitchen Intelligence Service
 */
export const getPersonalizedRecommendations = async (
  preferences: {
    currentElements?: ElementalProperties,
    cuisinePreferences?: string[],
    dietaryRestrictions?: string[],
    maxPrepTime?: number,
    limit?: number,
  }
) => {
  const request = {
    current_time: new Date().toISOString(),
    location: { latitude: 40.7128, longitude: -74.0060 }, // Default to NYC
    current_elements: preferences.currentElements,
    cuisine_preferences: preferences.cuisinePreferences || [],
    dietary_restrictions: preferences.dietaryRestrictions || [],
    max_prep_time: preferences.maxPrepTime,
    limit: preferences.limit || 10
  }

  const cacheKey = `recommendations_${JSON.stringify(request)}`;
  return withCache(cacheKey, () => alchemicalApi.getRecipeRecommendations(request))
}

/**
 * REAL-TIME PLANETARY UPDATES
 * WebSocket connection for live data
 */
export const connectToRealtimeUpdates = (
  onPlanetaryUpdate?: (data: any) => void,
  onEnergyUpdate?: (energy: number) => void
) => {
  return alchemicalApi.createRealtimeConnection((planetaryData) => {
    if (onPlanetaryUpdate) {
      onPlanetaryUpdate(planetaryData)
    }

    if (onEnergyUpdate && planetaryData.gregsEnergy) {
      onEnergyUpdate(planetaryData.gregsEnergy)
    }
  })
}

/**
 * HEALTH CHECK FOR BACKEND SERVICES
 */
export const checkBackendHealth = async () => {
  return alchemicalApi.checkHealth()
}

/**
 * CACHE MANAGEMENT
 */
export const clearCalculationCache = () => {
  calculationCache.clear()
}

export const getCacheStats = () => {
  return {
    size: calculationCache.size,
    entries: Array.from(calculationCache.keys())
  }
}

// Export commonly used combinations
export const backendCalculations = {
  elements: calculateElementalBalance,
  thermodynamics: calculateKalchmMetrics,
  planetary: getCurrentPlanetaryInfluences,
  recommendations: getPersonalizedRecommendations,
  monica: calculateMonicaConstant,
  optimize: optimizeAlchemicalBalance,
  realtime: connectToRealtimeUpdates,
  health: checkBackendHealth
}

export default backendCalculations;