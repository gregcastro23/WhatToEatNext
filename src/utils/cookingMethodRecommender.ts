import { allCookingMethods } from '@/data/cooking';
import { culturalCookingMethods, getCulturalVariations } from '@/utils/culturalMethodsAggregator';
import type { ZodiacSign, ElementalProperties } from '@/types';
import type { CookingMethod as CookingMethodEnum } from '@/types/alchemy';
import { getCurrentSeason } from '@/data/integrations/seasonal';

// Define a proper interface for our cooking method objects
interface CookingMethodData {
  id: string;
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  elementalProperties?: ElementalProperties; // Some methods use this instead
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];
  astrologicalInfluences?: {
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
    dominantPlanets?: string[];
  };
  toolsRequired?: string[];
  bestFor?: string[];
  culturalOrigin?: string;
  seasonalPreference?: string[];
  score?: number;
  variations?: CookingMethodData[]; // Add variations property to store related cultural methods
  relatedToMainMethod?: string; // Track if this is a variation of another method
}

// Type for the dictionary of methods
type CookingMethodDictionary = Record<string, CookingMethodData>;

// Combine traditional and cultural cooking methods
const allCookingMethodsCombined: CookingMethodDictionary = {
  // Convert allCookingMethods to our format
  ...Object.entries(allCookingMethods).reduce((acc: CookingMethodDictionary, [id, method]) => {
    acc[id] = {
      id,
      ...method,
      elementalEffect: method.elementalEffect || {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      },
      suitable_for: method.suitable_for || [],
      benefits: method.benefits || [],
      variations: [] // Initialize empty variations array
    };
    return acc;
  }, {}),
  
  // Add all cultural methods, making sure they don't override any existing methods
  // and properly organizing them into variations if they're related to main methods
  ...culturalCookingMethods.reduce((methods: CookingMethodDictionary, method) => {
    // Check if this method is a variation of a main method
    if (method.relatedToMainMethod) {
      // If the main method exists, add this as a variation
      if (methods[method.relatedToMainMethod]) {
        // Add to variations if it doesn't exist yet
        const existingVariations = methods[method.relatedToMainMethod].variations || [];
        if (!existingVariations.some(v => v.id === method.id)) {
          methods[method.relatedToMainMethod].variations = [
            ...existingVariations,
            {
              id: method.id,
              name: method.variationName || method.name,
              description: method.description,
              elementalEffect: method.elementalProperties || {
                Fire: 0,
                Water: 0,
                Earth: 0,
                Air: 0
              },
              toolsRequired: method.toolsRequired || [],
              bestFor: method.bestFor || [],
              culturalOrigin: method.culturalOrigin,
              astrologicalInfluences: method.astrologicalInfluences,
              duration: { min: 10, max: 30 },
              suitable_for: method.bestFor || [],
              benefits: [],
              relatedToMainMethod: method.relatedToMainMethod
            }
          ];
        }
        // Don't add as a standalone method
        return methods;
      }
    }
    
    // Only add as standalone if it doesn't already exist and isn't a variation
    if (!methods[method.id] && !method.relatedToMainMethod) {
      methods[method.id] = {
        id: method.id,
        name: method.name,
        description: method.description,
        elementalEffect: method.elementalProperties || {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
        },
        toolsRequired: method.toolsRequired || [],
        bestFor: method.bestFor || [],
        culturalOrigin: method.culturalOrigin,
        astrologicalInfluences: {
          favorableZodiac: method.astrologicalInfluences?.favorableZodiac?.map(sign => sign as ZodiacSign) || [],
          unfavorableZodiac: method.astrologicalInfluences?.unfavorableZodiac?.map(sign => sign as ZodiacSign) || [],
          dominantPlanets: method.astrologicalInfluences?.dominantPlanets || []
        },
        duration: { min: 10, max: 30 },
        suitable_for: method.bestFor || [],
        benefits: [],
        variations: [] // Initialize empty variations array
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
  const methodsArray = Object.entries(allCookingMethodsCombined)
    .map(([id, method]) => ({
      ...method,
      score: 0
    }))
    // Filter out methods that are variations of others to avoid duplication
    .filter(method => !method.relatedToMainMethod);
  
  // Apply cultural preference filter if specified
  const filteredMethods = culturalPreference
    ? methodsArray.filter(method => 
        // Include methods that match the culture OR have variations that match
        method.culturalOrigin === culturalPreference || 
        (method.variations && method.variations.some(v => v.culturalOrigin === culturalPreference))
      )
    : methodsArray;
  
  // Score each method based on multiple criteria
  filteredMethods.forEach(method => {
    // Elemental compatibility (40% of score)
    let elementalScore = 0;
    if (method.elementalEffect || method.elementalProperties) {
      const elementalProps = method.elementalEffect || method.elementalProperties || {};
      
      // Calculate similarity between method's elemental properties and user's elemental composition
      Object.entries(elementalProps).forEach(([element, value]) => {
        const numericValue = typeof value === 'number' ? value : 0;
        elementalScore += numericValue * (elementalComposition[element] || 0);
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
          method.astrologicalInfluences?.dominantPlanets?.includes(planet)
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
    
    // Cultural preference bonus (add extra points for methods from preferred culture)
    let culturalScore = 0;
    if (culturalPreference && method.culturalOrigin === culturalPreference) {
      culturalScore = 0.05; // 5% boost for direct cultural match
    } else if (culturalPreference && method.variations && 
              method.variations.some(v => v.culturalOrigin === culturalPreference)) {
      culturalScore = 0.03; // 3% boost if a variation matches the culture
    }
    
    // Calculate final score (normalize to 0-1 range)
    const rawScore = (elementalScore * 0.4) + 
                     (astrologicalScore * 0.2) + 
                     (seasonalScore * 0.15) + 
                     toolScore + 
                     dietaryScore + 
                     culturalScore;
                    
    // Add a small random factor (max 3%) for variety
    const randomFactor = Math.random() * 0.03;
    
    method.score = Math.min(1, Math.max(0, rawScore + randomFactor));
    
    // Also score variations if present and prioritize cultural variations if requested
    if (method.variations && method.variations.length > 0) {
      method.variations.forEach(variation => {
        // Give variations a score based on the main method but with slight differences
        variation.score = method.score;
        
        // Boost score for variations from the preferred culture
        if (culturalPreference && variation.culturalOrigin === culturalPreference) {
          variation.score = Math.min(1, variation.score + 0.15); // Significant boost
        }
      });
      
      // Sort variations by score
      method.variations.sort((a, b) => b.score - a.score);
    }
  });
  
  // Sort by score and return top methods
  return filteredMethods
    .sort((a, b) => b.score - a.score);
}

// Add a method to get cooking methods by cultural origin
export function getCookingMethodsByCulture(culture: string) {
  // Get main methods that match the culture
  const mainMethods = Object.entries(allCookingMethodsCombined)
    .filter(([_, method]) => 
      method.culturalOrigin === culture && !method.relatedToMainMethod
    )
    .map(([_, method]) => ({
      ...method
    }));
    
  // Get main methods that have variations matching the culture
  const methodsWithVariations = Object.entries(allCookingMethodsCombined)
    .filter(([_, method]) => 
      !method.culturalOrigin && 
      method.variations && 
      method.variations.some(v => v.culturalOrigin === culture)
    )
    .map(([_, method]) => ({
      ...method,
      // Filter variations to only include those from this culture
      variations: method.variations.filter(v => v.culturalOrigin === culture)
    }));
    
  return [...mainMethods, ...methodsWithVariations];
}

// Get all variations of a specific cooking method from any culture
export function getMethodVariations(methodId: string) {
  const method = allCookingMethodsCombined[methodId];
  if (!method) return [];
  
  return method.variations || [];
} 