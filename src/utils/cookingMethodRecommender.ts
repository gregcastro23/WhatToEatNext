import { allCookingMethods } from '@/data/cooking';
import { culturalCookingMethods } from '@/utils/culturalMethodsAggregator';
import type { ZodiacSign, CookingMethod, ElementalProperties } from '@/types';
import { getCurrentSeason } from '@/data/integrations/seasonal';

// Combine traditional and cultural cooking methods
const allCookingMethodsCombined = {
  ...allCookingMethods,
  // Add all cultural methods, making sure they don't override any existing methods
  ...culturalCookingMethods.reduce((methods, method) => {
    if (!methods[method.id]) {
      methods[method.id] = {
        name: method.name,
        description: method.description,
        elementalEffect: method.elementalProperties,
        toolsRequired: method.toolsRequired || [],
        bestFor: method.bestFor || [],
        culturalOrigin: method.culturalOrigin,
        astrologicalInfluences: method.astrologicalInfluences
      };
    }
    return methods;
  }, {})
};

// Improved scoring algorithm for cooking method recommendations
export function getRecommendedCookingMethods(
  elementalComposition: ElementalProperties,
  currentZodiac?: ZodiacSign,
  planets?: string[],
  season = getCurrentSeason(),
  culturalPreference?: string,
  dietaryPreferences?: string[],
  availableTools?: string[]
) {
  // Convert cooking methods to array for easier processing
  const methodsArray = Object.entries(allCookingMethodsCombined).map(([id, method]) => ({
    id,
    ...method,
    score: 0
  }));
  
  // Apply cultural preference filter if specified
  const filteredMethods = culturalPreference
    ? methodsArray.filter(method => method.culturalOrigin === culturalPreference || method.regionalVariations?.[culturalPreference])
    : methodsArray;
  
  // Score each method based on multiple criteria
  filteredMethods.forEach(method => {
    // Elemental compatibility (40% of score)
    let elementalScore = 0;
    if (method.elementalEffect || method.elementalProperties) {
      const elementalProps = method.elementalEffect || method.elementalProperties;
      
      // Calculate similarity between method's elemental properties and user's elemental composition
      Object.entries(elementalProps).forEach(([element, value]) => {
        elementalScore += value * (elementalComposition[element] || 0);
      });
    }
    
    // Astrological compatibility (25% of score)
    let astrologicalScore = 0;
    if (method.astrologicalInfluences) {
      // Zodiac compatibility
      if (currentZodiac) {
        if (method.astrologicalInfluences.favorableZodiac?.includes(currentZodiac)) {
          astrologicalScore += 0.25;
        } else if (method.astrologicalInfluences.unfavorableZodiac?.includes(currentZodiac)) {
          astrologicalScore -= 0.2;
        }
      }
      
      // Planetary compatibility
      if (planets && planets.length > 0) {
        const matchCount = planets.filter(planet => 
          method.astrologicalInfluences.rulingPlanets?.includes(planet) ||
          method.astrologicalInfluences.dominantPlanets?.includes(planet)
        ).length;
        
        astrologicalScore += (matchCount / planets.length) * 0.25;
      }
    }
    
    // Seasonal bonus (15% of score)
    let seasonalScore = 0;
    if (method.seasonalPreference && method.seasonalPreference.includes(season)) {
      seasonalScore += 0.15;
    } else {
      // Default seasonal preferences if not explicitly defined
      if (season === 'winter' && (method.name === 'braising' || method.name === 'roasting')) {
        seasonalScore += 0.1;
      } else if (season === 'summer' && (method.name === 'grilling' || method.name === 'raw')) {
        seasonalScore += 0.1;
      }
    }
    
    // Tools availability (10% of score)
    let toolScore = 0;
    if (availableTools && method.toolsRequired) {
      const requiredTools = method.toolsRequired;
      const availableRequiredTools = requiredTools.filter(tool => 
        availableTools.some(available => available.toLowerCase().includes(tool.toLowerCase()))
      );
      
      toolScore = (availableRequiredTools.length / requiredTools.length) * 0.1;
    } else {
      // Assume basic tools are available
      toolScore = method.name === 'sous_vide' || 
                  method.name === 'spherification' || 
                  method.name === 'cryo_cooking' ? 0.01 : 0.07;
    }
    
    // Dietary preferences (10% of score)
    let dietaryScore = 0;
    if (dietaryPreferences && method.suitable_for) {
      const preferenceMatch = dietaryPreferences.some(pref => 
        method.suitable_for.some(suitable => suitable.toLowerCase().includes(pref.toLowerCase()))
      );
      
      dietaryScore = preferenceMatch ? 0.1 : 0;
    }
    
    // Calculate final score (normalize to 0-1 range)
    const rawScore = (elementalScore * 0.4) + (astrologicalScore * 0.25) + 
                    (seasonalScore * 0.15) + toolScore + dietaryScore;
                    
    // Add a small random factor (max 5%) for variety
    const randomFactor = Math.random() * 0.05;
    
    method.score = Math.min(1, Math.max(0, rawScore + randomFactor));
  });
  
  // Sort by score and return top methods
  return filteredMethods
    .sort((a, b) => b.score - a.score);
}

// Add a method to get cooking methods by cultural origin
export function getCookingMethodsByCulture(culture: string) {
  return Object.entries(allCookingMethodsCombined)
    .filter(([_, method]) => method.culturalOrigin === culture)
    .map(([id, method]) => ({
      id,
      ...method
    }));
} 