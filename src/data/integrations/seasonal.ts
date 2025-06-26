// Keep this file focused on seasonal data only, removing any elemental balance references
import { seasonalPatterns } from './seasonalPatterns';
import { seasonalUsage } from './seasonalUsage';
import type { Season } from '@/types/alchemy';

export interface SeasonalData {
  availability: number; // 0-1 scale for ingredient availability
  traditionalUse: string[]; // Traditional uses in this season
  complementaryFlavors: string[]; // Flavors that work well in this season
}

/**
 * Get current season based on date
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

/**
 * Get seasonal score for an ingredient in the current or specified season
 */
export function getSeasonalScore(
  ingredientName: string, 
  season: Season = getCurrentSeason()
): number {
  // Check if the ingredient exists in seasonal patterns
  if (!seasonalPatterns[season] || !seasonalPatterns[season][ingredientName]) {
    // If ingredient is not found in the specific season, check if it's marked as 'all' seasons
    if (season !== 'all' && seasonalPatterns['all'] && seasonalPatterns['all'][ingredientName]) {
      return seasonalPatterns['all'][ingredientName] as number;
    }
    return 0.1; // Default low score if not found
  }
  
  return seasonalPatterns[season][ingredientName] as number;
}

/**
 * Get complete seasonal data for an ingredient
 */
export function getSeasonalData(
  ingredientName: string,
  season: Season = getCurrentSeason()
): SeasonalData {
  const availability = getSeasonalScore(ingredientName, _season);
  const traditionalUse = seasonalUsage[season]?.[ingredientName] || [];
  
  // Get complementary flavors for the season
  // Add type assertion to handle the unknown type
  const seasonalData = seasonalPatterns[season] || {};
  const complementaryFlavors = Object.entries(seasonalData)
    .filter(([key, value]) => {
      // Only include ingredient entries (skip metadata like elementalInfluence)
      return typeof value === 'number' && value > 0.7 && key !== 'elementalInfluence';
    })
    .map(([name, _]) => name)
    .slice(0, 5); // Top 5
  
  return {
    availability,
    traditionalUse,
    complementaryFlavors
  };
}

/**
 * Check if an ingredient is in season
 */
export function isInSeason(ingredientName: string, threshold = 0.5): boolean {
  const score = getSeasonalScore(ingredientName);
  return score >= threshold;
}

/**
 * Unified seasonal system that consolidates all seasonal functionality
 */
export const unifiedSeasonalSystem = {
  // Core functions
  getCurrentSeason,
  getSeasonalScore,
  getSeasonalData,
  isInSeason,
  
  // Data access
  seasonalPatterns,
  seasonalUsage,
  
  // Utility functions
  getSeasonalIngredients: (season: Season = getCurrentSeason(), minScore = 0.6) => {
    const seasonData = seasonalPatterns[season] || {};
    return Object.entries(seasonData)
      .filter(([key, value]) => typeof value === 'number' && value >= minScore && key !== 'elementalInfluence')
      .map(([name, score]) => ({ name, score: score as number }))
      .sort((a, b) => b.score - a.score);
  },
  
  getAllSeasons: () => ['spring', 'summer', 'fall', 'winter', 'all'] as Season[],
  
  getSeasonalRecommendations: (season: Season = getCurrentSeason()) => {
    const ingredients = seasonalPatterns[season] || {};
    const usage = seasonalUsage[season] || {};
    
    return {
      topIngredients: Object.entries(ingredients)
        .filter(([key, value]) => typeof value === 'number' && value > 0.7)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([name, score]) => ({ name, score: score as number })),
      traditionalUses: Object.keys(usage),
      seasonalTips: `Best practices for ${season} cooking and ingredient selection.`
    };
  }
};