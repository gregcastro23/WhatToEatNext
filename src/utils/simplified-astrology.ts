/**
 * A simplified astrological calculations utility
 * This file provides basic functions for astrological calculations
 * without relying on external libraries
 */

// Basic types
export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
export type Planet = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto' | 'Rising';
export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';

export interface PlanetaryAspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  strength: number;
}

/**
 * Calculate simplified planetary positions
 * This function uses simplified calculations to approximate planet positions
 * @param date The date to calculate for
 * @returns Record of planet positions in degrees (0-360)
 */
export function calculateSimplifiedPositions(date: Date = new Date()): Record<string, number> {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    'Sun': (dayOfYear * 0.9863) % 360,
    'Moon': (dayOfYear * 13.1763) % 360,
    'Mercury': (dayOfYear * 4.0923 + 20) % 360,
    'Venus': (dayOfYear * 1.6021 + 40) % 360, 
    'Mars': (dayOfYear * 0.5240 + 80) % 360,
    'Jupiter': (dayOfYear * 0.0831 + 120) % 360,
    'Saturn': (dayOfYear * 0.0334 + 160) % 360,
    'Uranus': (dayOfYear * 0.0116 + 200) % 360,
    'Neptune': (dayOfYear * 0.0059 + 240) % 360,
    'Pluto': (dayOfYear * 0.0040 + 280) % 360,
    'Rising': (date.getHours() * 15 + date.getMinutes() * 0.25) % 360
  };
}

/**
 * Calculate the rising sign (ascendant) for a given date
 * This is a simplified calculation for demo purposes
 * @param date The date to calculate for
 * @returns The rising degree (0-360)
 */
export function calculateRisingSign(date: Date = new Date()): number {
  // Simple approximation based on time of day
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  // Full rotation in 24 hours (15 degrees per hour)
  const hourDegree = hour * 15;
  const minuteDegree = minute * 0.25; // 15/60 = 0.25 degrees per minute
  
  // Add season adjustment - this is simplified
  const month = date.getMonth(); // 0-11
  let seasonAdjustment = 0;
  
  if (month >= 2 && month <= 4) { // Spring (March-May)
    seasonAdjustment = 90;
  } else if (month >= 5 && month <= 7) { // Summer (June-August)
    seasonAdjustment = 180;
  } else if (month >= 8 && month <= 10) { // Fall (September-November)
    seasonAdjustment = 270;
  }
  
  return (hourDegree + minuteDegree + seasonAdjustment) % 360;
}

/**
 * Calculate aspects between planets
 * @param positions Planetary positions
 * @returns Array of aspects
 */
export function calculateAspects(
  planetaryPositions: Record<string, number>
): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];
  const planets = Object.keys(planetaryPositions);
  
  // Define aspect types and orbs (allowed deviation)
  const aspectTypes = [
    { name: 'conjunction' as AspectType, angle: 0, orb: 8 },
    { name: 'sextile' as AspectType, angle: 60, orb: 6 },
    { name: 'square' as AspectType, angle: 90, orb: 8 },
    { name: 'trine' as AspectType, angle: 120, orb: 8 },
    { name: 'opposition' as AspectType, angle: 180, orb: 10 }
  ];
  
  // Compare each planet pair
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i] as Planet;
      const planet2 = planets[j] as Planet;
      const angle = Math.abs(planetaryPositions[planet1] - planetaryPositions[planet2]);
      const normalizedAngle = angle > 180 ? 360 - angle : angle;
      
      // Check for aspects
      for (const aspectType of aspectTypes) {
        if (Math.abs(normalizedAngle - aspectType.angle) < aspectType.orb) {
          aspects.push({
            planet1,
            planet2,
            type: aspectType.name,
            strength: 1 - (Math.abs(normalizedAngle - aspectType.angle) / aspectType.orb)
          });
          break; // Only count the closest aspect between any two planets
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Calculate normalized lunar phase (0-1)
 * @param date Date to calculate for
 * @returns Normalized phase where 0=new, 0.5=full, 1=back to new
 */
export function getNormalizedLunarPhase(date: Date = new Date()): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return (dayOfYear % 29.5) / 29.5;
}

/**
 * Get the zodiac sign for a degree
 * @param degree The degree (0-359)
 * @returns The zodiac sign name
 */
export function getZodiacSign(degree: number) {
  const signs = [
    { name: 'Aries', symbol: '♈', start: 0, element: 'Fire' },
    { name: 'Taurus', symbol: '♉', start: 30, element: 'Earth' },
    { name: 'Gemini', symbol: '♊', start: 60, element: 'Air' },
    { name: 'Cancer', symbol: '♋', start: 90, element: 'Water' },
    { name: 'Leo', symbol: '♌', start: 120, element: 'Fire' },
    { name: 'Virgo', symbol: '♍', start: 150, element: 'Earth' },
    { name: 'Libra', symbol: '♎', start: 180, element: 'Air' },
    { name: 'Scorpio', symbol: '♏', start: 210, element: 'Water' },
    { name: 'Sagittarius', symbol: '♐', start: 240, element: 'Fire' },
    { name: 'Capricorn', symbol: '♑', start: 270, element: 'Earth' },
    { name: 'Aquarius', symbol: '♒', start: 300, element: 'Air' },
    { name: 'Pisces', symbol: '♓', start: 330, element: 'Water' }
  ];
  
  const signIndex = Math.floor((degree % 360) / 30);
  return signs[signIndex];
}

/**
 * Get the element for a zodiac sign
 * @param sign The sign name
 * @returns The element (Fire, Earth, Air, Water)
 */
export function getZodiacElement(sign: string): Element {
  const elements: Record<string, Element> = {
    'Aries': 'Fire',
    'Leo': 'Fire',
    'Sagittarius': 'Fire',
    'Taurus': 'Earth',
    'Virgo': 'Earth',
    'Capricorn': 'Earth',
    'Gemini': 'Air',
    'Libra': 'Air',
    'Aquarius': 'Air',
    'Cancer': 'Water',
    'Scorpio': 'Water',
    'Pisces': 'Water'
  };
  
  return elements[sign] || 'Fire';
}

/**
 * Calculate elemental balance from planetary positions
 * @param positions Planetary positions
 * @returns Object with element percentages
 */
export function calculateElementalBalance(positions: Record<string, number>) {
  const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  let total = 0;
  
  Object.entries(positions).forEach(([planet, degree]) => {
    const sign = getZodiacSign(degree);
    let weight = 1;
    if (planet === 'Sun' || planet === 'Moon') weight = 3;
    if (planet === 'Rising') weight = 2;
    
    elements[sign.element] += weight;
    total += weight;
  });
  
  return {
    Fire: Math.round((elements.Fire / total) * 100),
    Earth: Math.round((elements.Earth / total) * 100),
    Air: Math.round((elements.Air / total) * 100),
    Water: Math.round((elements.Water / total) * 100),
  };
}

/**
 * Calculate alchemical principles from elemental balance
 * @param elemBal Elemental balance percentages
 * @returns Alchemical principles as percentages
 */
export function calculateAlchemicalPrinciples(elementalBalance: Record<string, number>) {
  return {
    Spirit: Math.round((elementalBalance.Fire + elementalBalance.Air) / 2),
    Essence: Math.round((elementalBalance.Fire + elementalBalance.Water) / 2),
    Matter: Math.round((elementalBalance.Earth + elementalBalance.Water) / 2),
    Substance: Math.round((elementalBalance.Earth + elementalBalance.Air) / 2)
  };
} 