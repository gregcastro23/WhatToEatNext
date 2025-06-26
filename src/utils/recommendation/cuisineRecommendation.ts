import { _ElementalProperties } from '../../types/common';
import { CuisineType } from '../../types/recipe';

export interface CuisineRecommendation {
  cuisine: CuisineType;
  score: number;
  reasoning: string;
  elementalMatch: number;
}

export interface CuisineRecommendationParams {
  elementalProperties: ElementalProperties;
  preferences?: string[];
  dietaryRestrictions?: string[];
}

export function generateCuisineRecommendation(
  params: CuisineRecommendationParams
): CuisineRecommendation[] {
  const { elementalProperties } = params;
  
  // Basic cuisine recommendations based on elemental properties
  const recommendations: CuisineRecommendation[] = [];
  
  // Fire-based cuisines
  if (elementalProperties.Fire > 0.6) {
    recommendations.push({
      cuisine: 'Mexican' as CuisineType,
      score: elementalProperties.Fire * 0.9,
      reasoning: 'High Fire element matches spicy Mexican cuisine',
      elementalMatch: elementalProperties.Fire
    });
  }
  
  // Water-based cuisines
  if (elementalProperties.Water > 0.6) {
    recommendations.push({
      cuisine: 'Mediterranean' as CuisineType,
      score: elementalProperties.Water * 0.8,
      reasoning: 'High Water element matches Mediterranean freshness',
      elementalMatch: elementalProperties.Water
    });
  }
  
  // Earth-based cuisines
  if (elementalProperties.Earth > 0.6) {
    recommendations.push({
      cuisine: 'Italian' as CuisineType,
      score: elementalProperties.Earth * 0.85,
      reasoning: 'High Earth element matches hearty Italian cuisine',
      elementalMatch: elementalProperties.Earth
    });
  }
  
  // Air-based cuisines
  if (elementalProperties.Air > 0.6) {
    recommendations.push({
      cuisine: 'Asian' as CuisineType,
      score: elementalProperties.Air * 0.8,
      reasoning: 'High Air element matches light Asian cuisine',
      elementalMatch: elementalProperties.Air
    });
  }
  
  return recommendations.sort((a, b) => b.score - a.score);
}

export function getCuisineElementalProfile(cuisine: CuisineType): ElementalProperties {
  const profiles: Record<string, ElementalProperties> = {
    'Mexican': { Fire: 0.8, Water: 0.3, Earth: 0.5, Air: 0.4 },
    'Italian': { Fire: 0.4, Water: 0.4, Earth: 0.8, Air: 0.4 },
    'Mediterranean': { Fire: 0.3, Water: 0.8, Earth: 0.5, Air: 0.6 },
    'Asian': { Fire: 0.5, Water: 0.6, Earth: 0.4, Air: 0.8 },
    'Indian': { Fire: 0.9, Water: 0.3, Earth: 0.6, Air: 0.5 },
    'Thai': { Fire: 0.7, Water: 0.7, Earth: 0.4, Air: 0.6 },
  };
  
  return profiles[cuisine] || { Fire: 0.5, Water: 0.5, Earth: 0.5, Air: 0.5 };
}

export function getMatchScoreClass(score: number): string {
  if (score >= 0.8) return 'match-excellent';
  if (score >= 0.6) return 'match-good';
  if (score >= 0.4) return 'match-fair';
  return 'match-poor';
}

export function renderScoreBadge(score: number): string {
  const percentage = Math.round(score * 100);
  if (percentage >= 80) return `🌟 ${percentage}%`;
  if (percentage >= 60) return `⭐ ${percentage}%`;
  if (percentage >= 40) return `⚡ ${percentage}%`;
  return `💫 ${percentage}%`;
}

export function calculateElementalProfileFromZodiac(zodiacSign: string): ElementalProperties {
  const zodiacProfiles: Record<string, ElementalProperties> = {
    // Fire signs
    'aries': { Fire: 0.8, Water: 0.2, Earth: 0.3, Air: 0.4 },
    'leo': { Fire: 0.9, Water: 0.3, Earth: 0.2, Air: 0.5 },
    'sagittarius': { Fire: 0.7, Water: 0.4, Earth: 0.3, Air: 0.6 },
    
    // Earth signs
    'taurus': { Fire: 0.3, Water: 0.4, Earth: 0.8, Air: 0.2 },
    'virgo': { Fire: 0.2, Water: 0.5, Earth: 0.9, Air: 0.3 },
    'capricorn': { Fire: 0.4, Water: 0.3, Earth: 0.8, Air: 0.2 },
    
    // Air signs
    'gemini': { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.8 },
    'libra': { Fire: 0.3, Water: 0.5, Earth: 0.3, Air: 0.7 },
    'aquarius': { Fire: 0.5, Water: 0.2, Earth: 0.3, Air: 0.9 },
    
    // Water signs
    'cancer': { Fire: 0.2, Water: 0.8, Earth: 0.4, Air: 0.3 },
    'scorpio': { Fire: 0.6, Water: 0.9, Earth: 0.3, Air: 0.2 },
    'pisces': { Fire: 0.3, Water: 0.8, Earth: 0.2, Air: 0.4 },
  };
  
  return zodiacProfiles[zodiacSign.toLowerCase()] || { Fire: 0.5, Water: 0.5, Earth: 0.5, Air: 0.5 };
}

export function calculateElementalContributionsFromPlanets(planetaryPositions: Record<string, any>): ElementalProperties {
  const contributions: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  
  // Basic planetary element contributions
  const planetaryElements: Record<string, ElementalProperties> = {
    sun: { Fire: 1.0, Water: 0, Earth: 0, Air: 0 },
    moon: { Fire: 0, Water: 1.0, Earth: 0, Air: 0 },
    mercury: { Fire: 0, Water: 0, Earth: 0, Air: 1.0 },
    venus: { Fire: 0, Water: 0.7, Earth: 0.3, Air: 0 },
    mars: { Fire: 1.0, Water: 0, Earth: 0, Air: 0 },
    jupiter: { Fire: 0.5, Water: 0, Earth: 0, Air: 0.5 },
    saturn: { Fire: 0, Water: 0, Earth: 1.0, Air: 0 },
  };
  
  Object.entries(planetaryPositions).forEach(([planet, position]) => {
    const planetElements = planetaryElements[planet.toLowerCase()];
    if (planetElements && position) {
      const strength = typeof position === 'object' && position.strength ? position.strength : 0.5;
      contributions.Fire += planetElements.Fire * strength;
      contributions.Water += planetElements.Water * strength;
      contributions.Earth += planetElements.Earth * strength;
      contributions.Air += planetElements.Air * strength;
    }
  });
  
  // Normalize
  const total = contributions.Fire + contributions.Water + contributions.Earth + contributions.Air;
  if (total > 0) {
    contributions.Fire /= total;
    contributions.Water /= total;
    contributions.Earth /= total;
    contributions.Air /= total;
  }
  
  return contributions;
} 