import type { Recipe } from '@/types/recipe';
import type { Season, ZodiacSign } from '@/types/alchemy';
import { toZodiacSign } from '@/utils/zodiacUtils';
import { ElementType, ElementalEnergy, signElementMap } from '@/types/elements';
import { PlanetaryPositionsType } from '@/contexts/AlchemicalContext/context';

/**
 * Simplified version that focuses only on astrological influence
 * without elemental balance calculations
 */
export function calculateAstrologicalInfluence(
  recipe: Recipe,
  zodiacSign: string,
  season: Season
): number {
  if (!recipe.astrologicalProfile) return 0;
  
  let score = 0;
  
  // Convert string to proper ZodiacSign type
  const zodiac = toZodiacSign(zodiacSign);
  
  // Check zodiac compatibility
  if (recipe.astrologicalProfile.favorableZodiac.includes(zodiac)) {
    score += 5;
  }
  
  // Check seasonal compatibility
  if (recipe.energyProfile?.season?.includes(season)) {
    score += 5;
  }
  
  return score;
}

/**
 * Calculate elemental energies based on planetary positions and time of day
 * 
 * @param planetaryPositions Current planetary positions
 * @param isDaytime Whether it is currently daytime
 * @returns Array of elemental energies with their strengths
 */
export function calculateElementalEnergies(
  planetaryPositions: PlanetaryPositionsType,
  isDaytime: boolean = true
): ElementalEnergy[] {
  // Base elemental values
  const elementalEnergies: Record<ElementType, number> = {
    fire: 0,
    water: 0,
    air: 0,
    earth: 0,
    metal: 0,
    wood: 0,
    void: 0
  };
  
  // Planetary influence weights
  const planetaryWeights: Record<string, number> = {
    sun: 5,
    moon: 4,
    mercury: 3,
    venus: 3,
    mars: 3,
    jupiter: 2,
    saturn: 2,
    uranus: 1,
    neptune: 1,
    pluto: 1
  };
  
  // Calculate primary elemental values based on planetary positions
  Object.entries(planetaryPositions).forEach(([planet, data]) => {
    if (!data || !data.sign) return;
    
    const planetWeight = planetaryWeights[planet.toLowerCase()] || 1;
    const sign = data.sign.toLowerCase();
    const element = signElementMap[sign];
    
    if (element) {
      elementalEnergies[element] += planetWeight;
      
      // Retrograde planets have different energy
      if (data.isRetrograde) {
        // Retrograde planets reduce their element's energy and boost their opposite
        elementalEnergies[element] *= 0.8;
        
        // Boost opposite element
        const oppositeElement = getOppositeElement(element);
        if (oppositeElement) {
          elementalEnergies[oppositeElement] += planetWeight * 0.3;
        }
      }
    }
  });
  
  // Day/night cycle affects fire/water balance
  if (isDaytime) {
    elementalEnergies.fire *= 1.2;
    elementalEnergies.air *= 1.1;
  } else {
    elementalEnergies.water *= 1.2;
    elementalEnergies.earth *= 1.1;
  }
  
  // Normalize values to create percentages
  const totalEnergy = Object.values(elementalEnergies).reduce((sum, val) => sum + val, 0);
  
  // Convert to array of ElementalEnergy objects
  return Object.entries(elementalEnergies)
    .map(([type, strength]) => ({
      type: type as ElementType,
      strength: totalEnergy > 0 ? strength / totalEnergy : 0,
      influence: getPlanetaryInfluencers(type as ElementType, planetaryPositions)
    }))
    .filter(energy => energy.strength > 0);
}

/**
 * Get the opposite element
 */
function getOppositeElement(element: ElementType): ElementType | null {
  const opposites: Record<ElementType, ElementType> = {
    fire: 'water',
    water: 'fire',
    air: 'earth',
    earth: 'air',
    metal: 'wood',
    wood: 'metal',
    void: 'void'
  };
  
  return opposites[element] || null;
}

/**
 * Get the planets influencing a particular element
 */
function getPlanetaryInfluencers(
  element: ElementType,
  positions: PlanetaryPositionsType
): string[] {
  return Object.entries(positions)
    .filter(([_, data]) => {
      if (!data || !data.sign) return false;
      const elementOfSign = signElementMap[data.sign.toLowerCase()];
      return elementOfSign === element;
    })
    .map(([planet]) => planet);
}

// Choose ONE export pattern - removing duplicates
export class ElementalCalculator {
  // Static method to get current elemental state
  static getCurrentelementalState() {
    return {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
  }
  
  // Add any other implementation methods here
}

// Removing the duplicate class declarations and alternative exports