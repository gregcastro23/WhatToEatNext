import { AstrologicalState } from '@/types/celestial';

import { LunarPhase, ZodiacSign, PlanetaryAspect, ElementalProperties } from '@/types/alchemy';
import { LUNAR_PHASES } from '@/constants/lunar';
import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { planetaryFlavorProfiles } from '@/data/planetaryFlavorProfiles';
import { allIngredients } from '@/data/ingredients';
import {
  calculateLunarPhase,
  calculatePlanetaryPositions,
  calculatePlanetaryAspects,
} from "@/utils/astrologyUtils";
// Import the planet data
import { 
  venusData, 
  marsData, 
  mercuryData, 
  jupiterData
} from '@/data/planets';

// Mock planetary data for calculations
const mockPlanetaryData = {
  flavorProfiles: {
    sweet: 0.7,
    sour: 0.4,
    salty: 0.5, 
    bitter: 0.2,
    umami: 0.6,
    spicy: 0.3
  },
  foodAssociations: ["vegetables", "grains", "fruits", "proteins"],
  herbalAssociations: { Herbs: ["basil", "thyme", "mint", "rosemary"] }
};

// Export the function that was previously defined but not exported
export function generateTopSauceRecommendations(currentElementalProfile = null, count = 5) {
  // Import sauce data
  const { allSauces } = require('@/data/sauces');
  
  // Use provided elemental profile from current moment's calculations, only fall back if absolutely necessary
  const userProfile = currentElementalProfile || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // Get current date for planetary calculations
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Get planetary day influence
  const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const currentPlanetaryDay = planetaryDays[dayOfWeek];
  
  // Convert sauces object to array
  const saucesArray = Object.values(allSauces || {});
  
  // Map all sauces with scores
  const scoredSauces = saucesArray.map(sauce => {
    // Use safe type casting for unknown property access
    const sauceData = sauce as any;
    const elementalProperties = sauceData?.elementalProperties;
    const planetaryInfluences = sauceData?.planetaryInfluences;
    const flavorProfile = sauceData?.flavorProfile;
    const sauceId = sauceData?.id;
    const sauceName = sauceData?.name;
    
    // Calculate elemental match score
    const elementalMatchScore = calculateElementalMatch(
      elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      userProfile
    );
    
    // Calculate planetary day bonus - sauces that match the current planetary day get a bonus
    let planetaryDayScore = 0.7; // base score
    if (planetaryInfluences && planetaryInfluences.includes(currentPlanetaryDay)) {
      planetaryDayScore = 0.9; // bonus for matching the day
    }
    
    // Calculate flavor profile match if available
    let flavorMatchScore = 0.7; // base score
    if (flavorProfile) {
      // Use planetary flavor data to calculate preferred flavors
      const planetaryFlavors = {
        Sun: { spicy: 0.8, umami: 0.6 },
        Moon: { sweet: 0.7, creamy: 0.8 },
        Mars: { spicy: 0.9, sour: 0.6 },
        Mercury: { sour: 0.7, aromatic: 0.8 },
        Jupiter: { rich: 0.8, sweet: 0.7 },
        Venus: { sweet: 0.8, creamy: 0.7 },
        Saturn: { bitter: 0.7, earthy: 0.8 }
      };
      
      const currentFlavors = planetaryFlavors[currentPlanetaryDay] || {};
      
      // Calculate flavor match
      let flavorMatch = 0;
      let flavorCount = 0;
      
      Object.entries(currentFlavors).forEach(([flavor, strength]) => {
        if (flavorProfile[flavor]) {
          flavorMatch += (1 - Math.abs(flavorProfile[flavor] - strength));
          flavorCount++;
        }
      });
      
      if (flavorCount > 0) {
        flavorMatchScore = flavorMatch / flavorCount;
      }
    }
    
    // Calculate overall match percentage - weighted average of all scores
    const matchPercentage = Math.round(
      (elementalMatchScore * 0.5 + planetaryDayScore * 0.3 + flavorMatchScore * 0.2) * 100
    );
    
    return {
      ...sauce,
      id: sauceId || sauceName?.replace(/\s+/g, '-').toLowerCase(),
      matchPercentage,
      elementalMatchScore: Math.round(elementalMatchScore * 100),
      planetaryDayScore: Math.round(planetaryDayScore * 100),
      planetaryHourScore: Math.round(flavorMatchScore * 100), // Using flavor match for hour score
    };
  });
  
  // Sort by overall match percentage and return top results
  return scoredSauces
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, count);
}


export function calculateElementalProfileFromZodiac(zodiac: string) { return { Fire: 0.5, Water: 0.5, Earth: 0.5, Air: 0.5 }; }

export function getMatchScoreClass(score: number): string { return score > 0.7 ? "high" : score > 0.4 ? "medium" : "low"; }

// ========== MISSING FUNCTIONS FOR TS2305 FIXES ==========

// getCuisineRecommendations function (causing errors in CuisineRecommender components)
export function getCuisineRecommendations(
  elementalState: ElementalProperties,
  astrologicalState?: AstrologicalState,
  options: { count?: number } = {}
) {
  const { count = 5 } = options;
  
  // Get all cuisines from flavor profiles
  const cuisines = Object.keys(cuisineFlavorProfiles);
  
  const scoredCuisines = cuisines.map(cuisine => {
    const flavorProfile = cuisineFlavorProfiles[cuisine];
    const elementalMatch = calculateElementalMatch(
      (flavorProfile as any)?.elementalAffinity || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      elementalState
    );
    
    return {
      name: cuisine,
      matchPercentage: Math.round(elementalMatch * 100),
      elementalMatch,
      flavorProfile,
      reasoning: [`${Math.round(elementalMatch * 100)}% elemental compatibility`]
    };
  });
  
  return scoredCuisines
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, count);
}

// calculateElementalMatch function (causing errors in multiple components)
export function calculateElementalMatch(
  profile1: ElementalProperties,
  profile2: ElementalProperties
): number {
  let totalMatch = 0;
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  
  elements.forEach(element => {
    const diff = Math.abs((profile1[element] || 0) - (profile2[element] || 0));
    const elementMatch = 1 - diff;
    totalMatch += elementMatch;
  });
  
  return totalMatch / elements.length;
}

// renderScoreBadge function (causing error in CuisineRecommender.tsx)
export function renderScoreBadge(score: number): string {
  const scoreClass = getMatchScoreClass(score);
  const percentage = Math.round(score * 100);
  
  return `<span class="score-badge ${scoreClass}">${percentage}%</span>`;
}

// calculateElementalContributionsFromPlanets function (causing errors in debug components)
export function calculateElementalContributionsFromPlanets(
  planetaryPositions: Record<string, any>
): ElementalProperties {
  const contributions: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  };
  
  // Calculate contributions based on planetary positions
  Object.entries(planetaryPositions).forEach(([planet, position]) => {
    const planetData = getPlanetaryElementalContribution(planet);
    const signData = getSignElementalContribution(position?.sign);
    
    // Add weighted contributions
    contributions.Fire += (planetData.Fire + signData.Fire) * 0.5;
    contributions.Water += (planetData.Water + signData.Water) * 0.5;
    contributions.Earth += (planetData.Earth + signData.Earth) * 0.5;
    contributions.Air += (planetData.Air + signData.Air) * 0.5;
  });
  
  // Normalize to ensure total is reasonable
  const total = contributions.Fire + contributions.Water + contributions.Earth + contributions.Air;
  if (total > 0) {
    contributions.Fire = contributions.Fire / total;
    contributions.Water = contributions.Water / total;
    contributions.Earth = contributions.Earth / total;
    contributions.Air = contributions.Air / total;
  }
  
  return contributions;
}

// Helper functions for planetary calculations
function getPlanetaryElementalContribution(planet: string): ElementalProperties {
  const planetaryElements: Record<string, ElementalProperties> = {
    Sun: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 },
    Moon: { Fire: 0.1, Water: 0.8, Earth: 0.05, Air: 0.05 },
    Mercury: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
    Venus: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
    Mars: { Fire: 0.7, Water: 0.2, Earth: 0.05, Air: 0.05 },
    Jupiter: { Fire: 0.3, Water: 0.1, Earth: 0.1, Air: 0.5 },
    Saturn: { Fire: 0.05, Water: 0.1, Earth: 0.7, Air: 0.15 }
  };
  
  return planetaryElements[planet] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

function getSignElementalContribution(sign: string): ElementalProperties {
  const signElements: Record<string, ElementalProperties> = {
    Aries: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    Taurus: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    Gemini: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    Cancer: { Fire: 0, Water: 1, Earth: 0, Air: 0 },
    Leo: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    Virgo: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    Libra: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    Scorpio: { Fire: 0, Water: 1, Earth: 0, Air: 0 },
    Sagittarius: { Fire: 1, Water: 0, Earth: 0, Air: 0 },
    Capricorn: { Fire: 0, Water: 0, Earth: 1, Air: 0 },
    Aquarius: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
    Pisces: { Fire: 0, Water: 1, Earth: 0, Air: 0 }
  };
  
  return signElements[sign] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}
