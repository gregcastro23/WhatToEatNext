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
