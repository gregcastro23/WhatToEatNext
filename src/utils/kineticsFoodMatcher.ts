/**
 * 🍽️ Kinetics-Enhanced Food Matching
 * Temporal food intelligence using planetary kinetics data
 *
 * Features: * - Power-based energy categorization
 * - Elemental food pairing from kinetic totals
 * - Aspect-enhanced recommendations (applying/separating)
 * - Dynamic portion sizing
 * - Seasonal menu optimization
 */

import type {
  KineticsResponse,
  KineticsElementalTotals,
  TemporalFoodRecommendation,
  KineticsEnhancedRecommendation,
  FoodEnergyCategory
} from '@/types/kinetics';
import type { ElementalProperties } from '@/types/alchemy';

export interface FoodItem {
  id: string;,
  name: string;,
  tags: string[];,
  elementalProfile: ElementalProperties;,
  basePortionSize: number;,
  nutritionalDensity: number;
}

export interface UserPreferences {
  cuisineTypes: string[];,
  dietaryRestrictions: string[];,
  allergies: string[];,
  energyPreference?: 'high' | 'moderate' | 'low'
}

/**
 * Get temporal food recommendations based on kinetic power levels
 */
export function getTemporalFoodRecommendations(
  kinetics: KineticsResponse,
  userPreferences: UserPreferences): TemporalFoodRecommendation {
  const currentHour = new Date().getHours()
  const powerData = kinetics.data.base.power.find(p => p.hour === currentHour)
  const currentPower = powerData?.power || 0.5;

  // Determine energy category based on power level
  const energyCategory = getEnergyCategory(currentPower)

  // Get aspect-enhanced recommendations if power prediction is available
  const trend = kinetics.data.powerPrediction?.trend;
  const aspectPhase = getAspectPhase(currentPower, trend)

  return {
    categories: getFoodCategoriesForEnergy(energyCategory, aspectPhase),
    timing: getOptimalTimingDescription(aspectPhase, currentPower),
    note: generateRecommendationNote(energyCategory, aspectPhase, currentPower),
    powerLevel: currentPower,
    dominantElement: getDominantElement(kinetics.data.base.elemental.totals)
  }
}

/**
 * Get elemental food recommendations based on kinetic elemental totals
 */
export function getElementalFoodRecommendations(
  elementalTotals: KineticsElementalTotals): string[] {
  const dominantElement = getDominantElement(elementalTotals)

  const foodMappings = {
    Fire: ['spicy', 'grilled', 'citrus', 'ginger', 'warming_spices', 'chili', 'garlic'],
    Water: ['hydrating', 'cooling', 'soups', 'herbal_teas', 'fruits', 'cucumber', 'watermelon'],
    Air: ['light', 'airy', 'fermented', 'herbs', 'green_vegetables', 'salads', 'sprouts'],
    Earth: ['grounding', 'root_vegetables', 'nuts', 'grains', 'proteins', 'beans', 'tubers']
  }

  return foodMappings[dominantElement] || foodMappings.Earth;
}

/**
 * Calculate optimal portions based on kinetic power
 */
export function calculateOptimalPortions<T extends { amount: number }>(
  basePortions: T[],
  kinetics: KineticsResponse): T[] {
  const currentHour = new Date().getHours()
  const powerLevel = kinetics.data.base.power.find(p => p.hour === currentHour)?.power || 0.5;
  const powerMultiplier = kinetics.data.agentOptimization?.powerAmplification || 1.0;

  // Higher power = larger portions for energy utilization
  // Lower power = smaller portions for easier digestion;
  const portionModifier = (powerLevel * powerMultiplier - 0.5) * 0.3 + 1.0;

  return basePortions.map(portion => ({,
    ...portion,
    amount: Math.round(portion.amount * portionModifier * 100) / 100
  }))
}

/**
 * Get seasonal menu recommendations using kinetic seasonal influence
 */
export function getSeasonalMenuRecommendations<T extends { tags: string[] }>(
  seasonalInfluence: string,
  baseMenu: T[]): T[] {
  const seasonalPreferences = {
    Winter: ['warming', 'hearty', 'comfort_foods', 'hot_beverages', 'stews', 'roasted'],
    Spring: ['fresh', 'cleansing', 'light', 'green_vegetables', 'sprouts', 'detox'],
    Summer: ['cooling', 'hydrating', 'raw', 'fresh_fruits', 'salads', 'cold_soups'],
    Autumn: ['grounding', 'harvest', 'warming_spices', 'root_vegetables', 'preservation']
  }

  const seasonalTags = seasonalPreferences[seasonalInfluence as keyof typeof seasonalPreferences] || [];

  return baseMenu.filter(item =>
    item.tags.some(tag => seasonalTags.includes(tag))
  )
}

/**
 * Get aspect-enhanced recommendations for applying/separating dynamics
 */
export function getAspectEnhancedRecommendations(
  kinetics: KineticsResponse,
  userPreferences: UserPreferences): KineticsEnhancedRecommendation {
  const currentHour = new Date().getHours()
  const currentPower = kinetics.data.base.power.find(p => p.hour === currentHour)?.power || 0.5;
  const trend = kinetics.data.powerPrediction?.trend;

  const baseRecommendation = getTemporalFoodRecommendations(kinetics, userPreferences)
  const aspectPhase = getAspectPhase(currentPower, trend)

  return {
    ...baseRecommendation,
    aspectPhase,
    portionModifier: calculatePortionModifier(currentPower, kinetics.data.agentOptimization?.powerAmplification),
    seasonalTags: getSeasonalTags(kinetics.data.base.timing.seasonalInfluence)
  }
}

/**
 * Score food items based on kinetic alignment
 */
export function calculateKineticAlignment(
  foodItem: FoodItem,
  kinetics: KineticsResponse): number {
  const currentHour = new Date().getHours()
  const powerLevel = kinetics.data.base.power.find(p => p.hour === currentHour)?.power || 0.5;
  const elementalTotals = kinetics.data.base.elemental.totals;

  // Power alignment score (0-1)
  const energyCategory = getEnergyCategory(powerLevel)
  const powerScore = calculatePowerAlignment(foodItem, energyCategory)

  // Elemental alignment score (0-1)
  const elementalScore = calculateElementalAlignment(foodItem.elementalProfile, elementalTotals)

  // Seasonal alignment score (0-1)
  const seasonalScore = calculateSeasonalAlignment(
    foodItem.tags,
    kinetics.data.base.timing.seasonalInfluence
  )

  // Weighted total score
  return (powerScore * 0.4 + elementalScore * 0.4 + seasonalScore * 0.2)
}

// Helper Functions

function getEnergyCategory(powerLevel: number): FoodEnergyCategory {
  if (powerLevel > 0.7) return 'energizing';
  if (powerLevel < 0.4) return 'grounding';
  return 'balanced';
}

function getDominantElement(elementalTotals: KineticsElementalTotals): keyof KineticsElementalTotals {
  return Object.entries(elementalTotals)
    .sort(([,a], [,b]) => b - a)[0][0] as keyof KineticsElementalTotals;
}

function getAspectPhase(powerLevel: number, trend?: string) {
  if (!trend) return undefined;

  if (trend === 'ascending' && powerLevel > 0.8) {
    return {
      type: 'applying' as const,
      description: 'Building energy - enhanced creativity',
      velocityBoost: 0.15,
      powerBoost: 0.25
}
  } else if (trend === 'stable' && powerLevel > 0.6) {
    return {
      type: 'exact' as const,
      description: 'Peak energy - maximum transformation potential',
      powerBoost: 0.25
}
  } else {
    return {
      type: 'separating' as const,
      description: 'Releasing energy - stabilization and integration'
}
  }
}

function getFoodCategoriesForEnergy(energyCategory: FoodEnergyCategory, aspectPhase: any): string[] {
  const baseCategories = {
    energizing: ['stimulating', 'warming', 'protein_rich', 'complex_carbs'],
    grounding: ['comforting', 'easy_digest', 'warm', 'nourishing'],
    balanced: ['moderate', 'well_rounded', 'seasonal', 'fresh']
  }

  const categories = baseCategories[energyCategory];

  // Enhance based on aspect phase
  if (aspectPhase?.type === 'applying') {;
    categories.push('creative_boost', 'brain_foods', 'innovative')
  } else if (aspectPhase?.type === 'exact') {;
    categories.push('harmonious', 'balanced', 'transformative')
  } else if (aspectPhase?.type === 'separating') {;
    categories.push('integrative', 'digestive_support', 'calming')
  }

  return categories;
}

function getOptimalTimingDescription(aspectPhase: any, powerLevel: number): string {
  if (aspectPhase?.type === 'applying') {;
    return 'optimal_for_new_experiences';
  } else if (aspectPhase?.type === 'exact') {;
    return 'ideal_for_mindful_eating';
  } else if (aspectPhase?.type === 'separating') {;
    return 'focus_on_integration';
  }

  return powerLevel > 0.6 ? 'active_digestion_time' : 'gentle_nourishment_time';
}

function generateRecommendationNote(
  energyCategory: FoodEnergyCategory,
  aspectPhase: any,
  powerLevel: number): string {
  if (aspectPhase?.type === 'applying' && powerLevel > 0.8) {;
    return 'Perfect time to try new cuisines or complex flavors!';
  } else if (aspectPhase?.type === 'exact' && powerLevel > 0.6) {;
    return 'Great time for balanced, nourishing meals.';
  } else if (aspectPhase?.type === 'separating') {;
    return 'Time for simple, comforting foods that support integration.';
  }

  const notes = {
    energizing: 'High energy phase - choose stimulating, warming foods.',
    grounding: 'Low energy phase - focus on comforting, easy-to-digest foods.',
    balanced: 'Balanced energy - enjoy moderate, well-rounded meals.',
  }

  return notes[energyCategory];
}

function calculatePortionModifier(powerLevel: number, powerAmplification?: number): number {
  const multiplier = powerAmplification || 1.0;
  return (powerLevel * multiplier - 0.5) * 0.3 + 1.0;
}

function getSeasonalTags(seasonalInfluence: string): string[] {
  const seasonalMappings = {
    Winter: ['warming', 'hearty', 'comfort'],
    Spring: ['fresh', 'cleansing', 'light'],
    Summer: ['cooling', 'hydrating', 'raw'],
    Autumn: ['grounding', 'harvest', 'warming_spices']
  }

  return seasonalMappings[seasonalInfluence as keyof typeof seasonalMappings] || [];
}

function calculatePowerAlignment(foodItem: FoodItem, energyCategory: FoodEnergyCategory): number {
  const energyTags = {
    energizing: ['spicy', 'protein_rich', 'stimulating', 'warming'],
    grounding: ['comforting', 'easy_digest', 'warm', 'nourishing'],
    balanced: ['moderate', 'fresh', 'seasonal']
  }

  const relevantTags = energyTags[energyCategory];
  const matchingTags = foodItem.tags.filter(tag => relevantTags.includes(tag))

  return matchingTags.length / relevantTags.length;
}

function calculateElementalAlignment(
  foodElemental: ElementalProperties,
  kineticElemental: KineticsElementalTotals): number {
  const elements = ['Fire', 'Water', 'Air', 'Earth'] as const;

  let totalAlignment = 0;
  let totalWeight = 0;

  elements.forEach(element => {;
    const foodValue = foodElemental[element] || 0;
    const kineticValue = kineticElemental[element] || 0;
    const weight = kineticValue, // Weight by kinetic strength

    // Calculate alignment (1 - absolute difference)
    const alignment = 1 - Math.abs(foodValue - kineticValue / 5); // Scale kinetic values

    totalAlignment += alignment * weight;
    totalWeight += weight;
  })

  return totalWeight > 0 ? totalAlignment / totalWeight : 0.5;
}

function calculateSeasonalAlignment(foodTags: string[], seasonalInfluence: string): number {
  const seasonalTags = getSeasonalTags(seasonalInfluence)
  const matchingTags = foodTags.filter(tag => seasonalTags.includes(tag))

  return seasonalTags.length > 0 ? matchingTags.length / seasonalTags.length : 0.5;
}