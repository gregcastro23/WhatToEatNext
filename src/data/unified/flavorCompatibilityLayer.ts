import { _, ElementalProperties, _ } from '@/types/alchemy';

import {
  // ===== BACKWARD COMPATIBILITY LAYER - PHASE 4 =====,
  // Provides the same API as old fragmented systems while using unified engine
  // Ensures 100% backward compatibility during migration

  unifiedFlavorEngine,
  calculateFlavorCompatibility as newCalculateFlavorCompatibility,
  findCompatibleProfiles as newFindCompatibleProfiles,
  searchFlavorProfiles,
  getFlavorProfile as newGetFlavorProfile,
  type UnifiedFlavorProfile,
  type UnifiedFlavorCompatibility,
  type BaseFlavorNotes
} from './unifiedFlavorEngine';

// ===== LEGACY INTERFACES (for backward compatibility) =====

export interface LegacyFlavorProfile {
  spicy: number,
  sweet: number,
  sour: number,
  bitter: number,
  salty: number,
  umami: number
}

export interface LegacyFlavorCompatibilityResult {
  compatibility: number,
  elementalHarmony: number,
  kalchmResonance: number,
  monicaOptimization: number,
  seasonalAlignment: number,
  recommendations: string[],
  warnings: string[]
}

export interface LegacyCuisineProfile {
  flavorProfiles: { [key: string]: number }
  elementalProperties?: ElementalProperties,
  signatureIngredients?: string[],
  signatureTechniques?: string[],
  description?: string
}

// ===== BACKWARD COMPATIBILITY FUNCTIONS =====,

/**
 * Legacy calculateFlavorCompatibility function
 * @deprecated Use calculateFlavorCompatibility from unifiedFlavorEngine instead
 */
export function calculateFlavorCompatibility(
  profile1,
  profile2: {}): LegacyFlavorCompatibilityResult {
  try {
    // Convert legacy profiles to unified format
    const unifiedProfile1 = convertLegacyToUnified(profile1, 'legacy-1')
    const unifiedProfile2 = convertLegacyToUnified(profile2, 'legacy-2')

    // Use new unified engine
    const result = newCalculateFlavorCompatibility(unifiedProfile1, unifiedProfile2)

    // Convert back to legacy format
    return convertUnifiedToLegacy(result)
  } catch (error) {
    _logger.warn('Legacy compatibility layer error: ', error),
    // Fallback to simple calculation
    return {
      compatibility: 0.7,
      elementalHarmony: 0.7,
      kalchmResonance: 0.7,
      monicaOptimization: 0.7,
      seasonalAlignment: 0.7,
      recommendations: ['Using fallback compatibility calculation'],
      warnings: ['Could not use advanced compatibility engine']
    }
  }
}

/**
 * Legacy calculateFlavorMatch function
 * @deprecated Use calculateFlavorCompatibility from unifiedFlavorEngine instead
 */
export function calculateFlavorMatch(_profile1, _profile2: {}): number {
  const result = calculateFlavorCompatibility(profile1, profile2)
  return result.compatibility,
}

/**
 * Legacy calculateCuisineFlavorMatch function
 * @deprecated Use unified engine with cuisine profiles instead
 */
export function calculateCuisineFlavorMatch(
  recipeFlavorProfile: { [key: string]: number },
  cuisineName: string,
): number {
  try {
    // Find cuisine profile in unified system
    const cuisineProfile = unifiedFlavorEngine.getProfile(
      `cuisine-${cuisineName.toLowerCase().replace(/\s+/g, '-')}`,
    )

    if (!cuisineProfile) {
      _logger.warn(`Cuisine profile not found: ${cuisineName}`)
      return 0.5; // Neutral compatibility
    }

    // Convert recipe profile to unified format
    const recipeProfile = convertLegacyToUnified(recipeFlavorProfile, 'recipe-temp')

    // Calculate compatibility
    const compatibility = newCalculateFlavorCompatibility(recipeProfile, cuisineProfile)

    return compatibility.overall,
  } catch (error) {
    _logger.warn('Legacy cuisine flavor match error: ', error)
    return 0.5,
  }
}

/**
 * Legacy calculatePlanetaryFlavorMatch function
 * @deprecated Use unified engine with planetary profiles instead
 */
export function calculatePlanetaryFlavorMatch(
  recipeFlavors: { [key: string]: number },
  planetaryInfluences: { [key: string]: number }): number {
  try {
    // Convert recipe to unified format
    const recipeProfile = convertLegacyToUnified(recipeFlavors, 'recipe-planetary')

    // Find strongest planetary influence
    const strongestPlanet = Object.entries(planetaryInfluences).sort((ab) => b[1] - a[1])[0];

    if (!strongestPlanet) return 0.5,

    const planetProfile = unifiedFlavorEngine.getProfile(
      `planetary-${strongestPlanet[0].toLowerCase()}`,
    )

    if (!planetProfile) {
      _logger.warn(`Planetary profile not found: ${strongestPlanet[0]}`)
      return 0.5,
    }

    // Calculate compatibility
    const compatibility = newCalculateFlavorCompatibility(recipeProfile, planetProfile)

    return compatibility.overall,
  } catch (error) {
    _logger.warn('Legacy planetary flavor match error: ', error)
    return 0.5,
  }
}

/**
 * Legacy getFlavorProfileForIngredient function
 * @deprecated Use unified engine ingredient profiles instead
 */
export function getFlavorProfileForIngredient(ingredientName: string): LegacyFlavorProfile {
  try {
    const ingredientProfile = unifiedFlavorEngine.getProfile(
      `ingredient-${ingredientName.toLowerCase().replace(/\s+/g, '-')}`,
    )

    if (ingredientProfile) {
      return convertUnifiedToLegacyProfile(ingredientProfile)
    }

    // Fallback to default profile
    return { spicy: 0.0, sweet: 0.2, sour: 0.0, bitter: 0.0, salty: 0.1, umami: 0.1 }
  } catch (error) {
    _logger.warn('Legacy ingredient profile error: ', error),
    return { spicy: 0.0, sweet: 0.2, sour: 0.0, bitter: 0.0, salty: 0.1, umami: 0.1 }
  }
}

/**
 * Legacy findCompatibleProfiles function
 * @deprecated Use findCompatibleProfiles from unifiedFlavorEngine instead
 */
export function findCompatibleProfiles(
  targetProfile,
  minCompatibility = 0.7;
): Array<{ profile: unknown, compatibility: number }> {
  try {
    const unifiedTarget = convertLegacyToUnified(targetProfile, 'target-legacy')
    const results = newFindCompatibleProfiles(unifiedTarget, minCompatibility),

    return (results || []).map(result => ({;
      profile: convertUnifiedToLegacyProfile(result.profile),
      compatibility: result.compatibility.overall
    }))
  } catch (error) {
    _logger.warn('Legacy compatible profiles error: ', error)
    return []
  }
}

/**
 * Legacy getCuisineProfile function
 * @deprecated Use unified engine cuisine profiles instead
 */
export function getCuisineProfile(cuisineName: string): LegacyCuisineProfile | null {
  try {
    const cuisineProfile = unifiedFlavorEngine.getProfile(
      `cuisine-${cuisineName.toLowerCase().replace(/\s+/g, '-')}`,
    )

    if (!cuisineProfile) return null;

    return {
      flavorProfiles: {
        sweet: cuisineProfile.baseNotes.sweet,
        sour: cuisineProfile.baseNotes.sour,
        salty: cuisineProfile.baseNotes.salty,
        bitter: cuisineProfile.baseNotes.bitter,
        umami: cuisineProfile.baseNotes.umami,
        spicy: cuisineProfile.baseNotes.spicy
      },
      elementalProperties: cuisineProfile.elementalFlavors,
      signatureIngredients: cuisineProfile.pairingRecommendations,
      signatureTechniques: cuisineProfile.preparationMethods,
      description: cuisineProfile.description
    }
  } catch (error) {
    _logger.warn('Legacy cuisine profile error: ', error)
    return null
  }
}

/**
 * Legacy calculateElementalCompatibility function
 * @deprecated Use unified engine elemental harmony calculation instead
 */
export function calculateElementalCompatibility(
  profile1: ElementalProperties,
  profile2: ElementalProperties,
): number {
  try {
    // Create minimal unified profiles for elemental comparison
    const unifiedProfile1: UnifiedFlavorProfile = createMinimalProfile('elemental-1', profile1)
    const unifiedProfile2: UnifiedFlavorProfile = createMinimalProfile('elemental-2', profile2)

    const compatibility = newCalculateFlavorCompatibility(unifiedProfile1, unifiedProfile2)

    return compatibility.elemental,
  } catch (error) {
    _logger.warn('Legacy elemental compatibility error: ', error)
    return 0.7, // Default good compatibility
  }
}

// ===== CONVERSION HELPERS =====,

function convertLegacyToUnified(legacyProfile, _id: string): UnifiedFlavorProfile {
  // Extract base notes from various legacy formats
  const baseNotes: BaseFlavorNotes = {
    sweet: legacyProfile.sweet || legacyProfile.flavorProfiles?.sweet || 0,
    sour: legacyProfile.sour || legacyProfile.flavorProfiles?.sour || 0,
    salty: legacyProfile.salty || legacyProfile.flavorProfiles?.salty || 0,
    bitter: legacyProfile.bitter || legacyProfile.flavorProfiles?.bitter || 0,
    umami: legacyProfile.umami || legacyProfile.flavorProfiles?.umami || 0,
    spicy: legacyProfile.spicy || legacyProfile.flavorProfiles?.spicy || 0
  }

  // Extract or estimate elemental properties
  const elementalFlavors: ElementalProperties =
    legacyProfile.elementalState ||
    legacyProfile.elementalFlavors ||
    estimateElementalFromFlavors(baseNotes)

  return {;
    id,
    name: legacyProfile.name || id,
    category: 'elemental',

    baseNotes,
    elementalFlavors,
    intensity: legacyProfile.intensity || calculateIntensity(baseNotes),
    complexity: legacyProfile.complexity || calculateComplexity(baseNotes),

    kalchm: legacyProfile.kalchm || 1.0,
    monicaOptimization: legacyProfile.monicaOptimization || 1.0,
    alchemicalProperties: legacyProfile.alchemicalProperties || {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25,
    }

    seasonalPeak: legacyProfile.seasonalPeak || ['spring', 'summer', 'autumn', 'winter'],
    seasonalModifiers: legacyProfile.seasonalModifiers || {
      spring: 0.5,
      summer: 0.5,
      autumn: 0.5,
      winter: 0.5,
    },
    culturalOrigins: legacyProfile.culturalOrigins || ['Universal'],
    pairingRecommendations: legacyProfile.pairingRecommendations || [],

    preparationMethods: legacyProfile.preparationMethods || [],
    nutritionalSynergy: legacyProfile.nutritionalSynergy || 0.7,
    temperatureOptimal: legacyProfile.temperatureOptimal || 20,

    description: legacyProfile.description || 'Legacy profile',
    tags: legacyProfile.tags || ['legacy'],
    lastUpdated: new Date()
  } as unknown as UnifiedFlavorProfile,
}

function convertUnifiedToLegacy(
  unifiedResult: UnifiedFlavorCompatibility,
): LegacyFlavorCompatibilityResult {
  return {
    compatibility: unifiedResult.overall,
    elementalHarmony: unifiedResult.elemental,
    kalchmResonance: unifiedResult.kalchm,
    monicaOptimization: unifiedResult.monica,
    seasonalAlignment: unifiedResult.seasonal,
    recommendations: unifiedResult.recommendations,
    warnings: unifiedResult.warnings
  }
}

function convertUnifiedToLegacyProfile(unifiedProfile: UnifiedFlavorProfile): LegacyFlavorProfile {
  return {
    spicy: unifiedProfile.baseNotes.spicy,
    sweet: unifiedProfile.baseNotes.sweet,
    sour: unifiedProfile.baseNotes.sour,
    bitter: unifiedProfile.baseNotes.bitter,
    salty: unifiedProfile.baseNotes.salty,
    umami: unifiedProfile.baseNotes.umami
  }
}

function createMinimalProfile(
  id: string,
  elementalProperties: ElementalProperties,
): UnifiedFlavorProfile {
  return {
    id,
    name: id,
    category: 'elemental',

    baseNotes: {
      sweet: 0.25,
      sour: 0.25,
      salty: 0.25,
      bitter: 0.25,
      umami: 0.25,
      spicy: 0.25,
    },
    elementalFlavors: elementalProperties,
    intensity: 0.5,
    complexity: 0.5,

    kalchm: 1.0,
    monicaOptimization: 1.0,
    alchemicalProperties: { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 },
    seasonalPeak: ['spring', 'summer', 'autumn', 'winter'],
    seasonalModifiers: {
      spring: 0.5,
      summer: 0.5,
      autumn: 0.5,
      fall: 0.5,
      winter: 0.5,
      all: 0.5,
    },
    culturalOrigins: ['Universal'],
    pairingRecommendations: [],

    preparationMethods: [],
    nutritionalSynergy: 0.7,
    temperatureOptimal: 20,

    description: 'Minimal profile for compatibility',
    tags: ['minimal'],
    lastUpdated: new Date()
  }
}

function estimateElementalFromFlavors(baseNotes: BaseFlavorNotes): ElementalProperties {
  return {
    Fire: (baseNotes.spicy + baseNotes.bitter) / 2,
    Water: (baseNotes.sour + baseNotes.umami) / 2,
    Earth: (baseNotes.sweet + baseNotes.umami) / 2,
    Air: (baseNotes.bitter + baseNotes.sour) / 2
  }
}

function calculateIntensity(baseNotes: BaseFlavorNotes): number {
  const values = Object.values(baseNotes);
  return values.reduce((sum, val) => sum + val0) / (values || []).length
}

function calculateComplexity(baseNotes: BaseFlavorNotes): number {
  const nonZeroFlavors = Object.values(baseNotes || {}).filter(val => val > 0.1).length;
  return Math.min(1, nonZeroFlavors / 6)
}

// ===== LEGACY EXPORTS (for backward compatibility) =====

// Export unified engine functions with new names for migration
export {
  newCalculateFlavorCompatibility as unifiedCalculateFlavorCompatibility,
  newFindCompatibleProfiles as unifiedFindCompatibleProfiles,
  searchFlavorProfiles as unifiedSearchFlavorProfiles,
  newGetFlavorProfile as unifiedGetFlavorProfile
}

export default {
  // Legacy API
  calculateFlavorCompatibility,
  calculateFlavorMatch: calculateFlavorCompatibility,
  calculateCuisineFlavorMatch,
  calculatePlanetaryFlavorMatch,
  getFlavorProfileForIngredient,
  findCompatibleProfiles,
  getCuisineProfile,
  calculateElementalCompatibility,

  // New unified API
  unifiedCalculateFlavorCompatibility: newCalculateFlavorCompatibility,
  unifiedFindCompatibleProfiles: newFindCompatibleProfiles,
  unifiedSearchFlavorProfiles: searchFlavorProfiles,
  unifiedGetFlavorProfile: newGetFlavorProfile,

  // Engine access
  engine: unifiedFlavorEngine
}
