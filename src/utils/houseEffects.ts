import { log } from '@/services/LoggingService';
import type { ZodiacSign } from '@/types/alchemy';

import type { ElementalCharacter } from '../constants/planetaryElements';

import { getZodiacElement } from './astrologyUtils';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (_message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // log.info(message, ...args);
};

/**
 * Interface for house data in astrological charts
 */
export interface HouseData {
  number: number;
  name: string;
  element: ElementalCharacter;
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  nature: 'Angular' | 'Succedent' | 'Cadent';
  significance: number; // 1-10 rating of overall significance
  ruling_planet: string;
}

/**
 * Map of house numbers to their data including characteristics and significance
 */
export const HOUSE_DATA: Record<number, HouseData> = {
  1: {
    number: 1,
    name: 'House of Self',
    element: 'Fire',
    modality: 'Cardinal',
    nature: 'Angular',
    significance: 10,
    ruling_planet: 'Mars'
  },
  2: {
    number: 2,
    name: 'House of Value',
    element: 'Earth',
    modality: 'Fixed',
    nature: 'Succedent',
    significance: 7,
    ruling_planet: 'Venus'
  },
  3: {
    number: 3,
    name: 'House of Communication',
    element: 'Air',
    modality: 'Mutable',
    nature: 'Cadent',
    significance: 6,
    ruling_planet: 'Mercury'
  },
  4: {
    number: 4,
    name: 'House of Home',
    element: 'Water',
    modality: 'Cardinal',
    nature: 'Angular',
    significance: 9,
    ruling_planet: 'Moon'
  },
  5: {
    number: 5,
    name: 'House of Pleasure',
    element: 'Fire',
    modality: 'Fixed',
    nature: 'Succedent',
    significance: 7,
    ruling_planet: 'Sun'
  },
  6: {
    number: 6,
    name: 'House of Health',
    element: 'Earth',
    modality: 'Mutable',
    nature: 'Cadent',
    significance: 6,
    ruling_planet: 'Mercury'
  },
  7: {
    number: 7,
    name: 'House of Partnership',
    element: 'Air',
    modality: 'Cardinal',
    nature: 'Angular',
    significance: 9,
    ruling_planet: 'Venus'
  },
  8: {
    number: 8,
    name: 'House of Transformation',
    element: 'Water',
    modality: 'Fixed',
    nature: 'Succedent',
    significance: 8,
    ruling_planet: 'Pluto'
  },
  9: {
    number: 9,
    name: 'House of Philosophy',
    element: 'Fire',
    modality: 'Mutable',
    nature: 'Cadent',
    significance: 7,
    ruling_planet: 'Jupiter'
  },
  10: {
    number: 10,
    name: 'House of Social Status',
    element: 'Earth',
    modality: 'Cardinal',
    nature: 'Angular',
    significance: 10,
    ruling_planet: 'Saturn'
  },
  11: {
    number: 11,
    name: 'House of Friendship',
    element: 'Air',
    modality: 'Fixed',
    nature: 'Succedent',
    significance: 7,
    ruling_planet: 'Uranus'
  },
  12: {
    number: 12,
    name: 'House of Unconscious',
    element: 'Water',
    modality: 'Mutable',
    nature: 'Cadent',
    significance: 8,
    ruling_planet: 'Neptune'
  }
};

/**
 * House strength multipliers based on house nature
 */
export const HOUSE_STRENGTH: Record<'Angular' | 'Succedent' | 'Cadent', number> = {
  'Angular': 1.0,    // Strongest influence
  'Succedent': 0.7,  // Medium influence
  'Cadent': 0.4      // Weakest influence
};

/**
 * Calculate elemental effects from a planet being in a specific house
 * 
 * @param planet Planet name
 * @param house House number (1-12)
 * @param sign Zodiac sign the planet is in
 * @returns Record of elemental effects for each element
 */
export function calculateHouseEffect(
  planet: string,
  house: number,
  sign: ZodiacSign
): Record<ElementalCharacter, number> {
  const effects: Record<ElementalCharacter, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
  };
  
  // Get house data
  const houseData = HOUSE_DATA[house];
  if (!houseData) {
    debugLog(`House number ${house} not found in house data`);
    return effects;
  }
  
  // Get sign element
  const signElement = getZodiacElement(sign) ;
  
  // Calculate house-based elemental effect
  const houseElement = houseData.element;
  const houseStrength = HOUSE_STRENGTH[houseData.nature];
  
  // Add house-based effect
  effects[houseElement] += houseStrength;
  
  // Add synergy effect if sign element matches house element
  if (signElement === houseElement) {
    effects[houseElement] += 0.5; // Bonus for matching element
    debugLog(`Element synergy bonus for ${planet} in house ${house}: ${signElement}`);
  }
  
  // Add special effects for certain houses and planets
  // House 1 (Ascendant) bonus
  if (house === 1) {
    effects[signElement] += 1.0; // Strong effect for 1st house placements
    debugLog(`House 1 bonus applied for ${planet}: +1.0 to ${signElement}`);
  }
  
  // House 10 (Midheaven) bonus
  if (house === 10) {
    effects[signElement] += 0.8; // Strong effect for 10th house placements
    debugLog(`House 10 bonus applied for ${planet}: +0.8 to ${signElement}`);
  }
  
  // Planet in ruling house
  if (houseData.ruling_planet.toLowerCase() === planet.toLowerCase()) {
    effects[signElement] += 0.7; // Bonus for planet in its ruling house
    debugLog(`Ruling planet bonus for ${planet} in house ${house}: +0.7 to ${signElement}`);
  }
  
  return effects;
}

/**
 * Calculate all house effects for all planets in a chart
 * 
 * @param planetPositions Map of planets to their positions including sign and house
 * @param houses Map of house numbers to their signs
 * @returns Combined elemental effects from all house placements
 */
export function calculateAllHouseEffects(
  planetPositions: Record<string, { sign: ZodiacSign, house?: number }>,
  _houses: Record<number, ZodiacSign>
): Record<ElementalCharacter, number> {
  const totalEffects: Record<ElementalCharacter, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
  };
  
  debugLog(`Calculating house effects for ${Object.keys(planetPositions).length} planets`);
  
  // Calculate effects for each planet
  for (const [planet, position] of Object.entries(planetPositions)) {
    // Skip if house is not defined
    if (!position.house) {
      debugLog(`House not defined for ${planet}, skipping`);
      continue;
    }
    
    const house = position.house;
    const sign = position.sign;
    
    // Get house effects for this planet
    const houseEffects = calculateHouseEffect(planet, house, sign);
    
    // Add to total effects
    for (const element in houseEffects) {
      totalEffects[element as ElementalCharacter] += houseEffects[element as ElementalCharacter];
    }
  }
  
  debugLog(`House effects calculation complete. Results:`, totalEffects);
  return totalEffects;
} 