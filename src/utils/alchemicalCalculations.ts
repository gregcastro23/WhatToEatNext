// src/utils/alchemicalCalculations.ts

import { SUIT_TO_ELEMENT, SUIT_TO_TOKEN } from './tarotMappings';

// Define PlanetaryPositionsType
export interface PlanetaryPositionsType {
  [key: string]: {
    sign?: string;
    degree?: number;
    isRetrograde?: boolean;
    exactLongitude?: number;
    [key: string]: unknown;
  };
}

// Map elements to zodiac signs
const signElements: Record<string, string> = {
  aries: 'Fire',
  leo: 'Fire',
  sagittarius: 'Fire',
  taurus: 'Earth',
  virgo: 'Earth',
  capricorn: 'Earth',
  gemini: 'Air',
  libra: 'Air',
  aquarius: 'Air',
  cancer: 'Water',
  scorpio: 'Water',
  pisces: 'Water',
};

// Map planets to their alchemical properties
const planetAlchemicalProperties: Record<string, Record<string, number>> = {
  sun: { Spirit: 1.0, Essence: 0.3, Matter: 0.1, Substance: 0.2 },
  moon: { Spirit: 0.2, Essence: 0.8, Matter: 0.7, Substance: 0.3 },
  mercury: { Spirit: 0.7, Essence: 0.4, Matter: 0.2, Substance: 0.8 },
  venus: { Spirit: 0.3, Essence: 0.9, Matter: 0.6, Substance: 0.2 },
  mars: { Spirit: 0.4, Essence: 0.7, Matter: 0.8, Substance: 0.3 },
  jupiter: { Spirit: 0.8, Essence: 0.6, Matter: 0.3, Substance: 0.4 },
  saturn: { Spirit: 0.6, Essence: 0.2, Matter: 0.9, Substance: 0.5 },
  uranus: { Spirit: 0.9, Essence: 0.5, Matter: 0.2, Substance: 0.7 },
  neptune: { Spirit: 0.7, Essence: 0.8, Matter: 0.1, Substance: 0.9 },
  pluto: { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 },
};

/**
 * Calculates elemental balance based on planetary positions, day/night, and tarot card
 * Throws error if critical planetary positions are missing.
 */
export function calculateElementalBalance(
  positions: PlanetaryPositionsType,
  isDaytime = true,
  tarotCardSuit?: string
) {
  if (!positions || Object.keys(positions).length === 0) {
    throw new Error('Alchemical Error: Planetary positions are required for elemental balance calculation.');
  }

  const elements = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  let totalWeight = 0;

  Object.entries(positions).forEach(([planet, data]) => {
    if (!data?.sign || ['ascendant', 'northnode', 'southnode'].includes(planet)) {
      return;
    }

    const signKey = data.sign.toLowerCase();
    const element = signElements[signKey] as keyof typeof elements;

    if (element) {
      let weight = 1.0;
      if (planet === 'sun' || planet === 'moon') weight = 2.5;
      if (['mercury', 'venus', 'mars'].includes(planet)) weight = 1.5;
      
      if (data.isRetrograde) weight *= 0.8;

      elements[element] += weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) {
    throw new Error('Alchemical Error: No valid planetary positions found to calculate elemental balance.');
  }

  // Apply daytime / nighttime adjustments
  if (isDaytime) {
    elements.Fire *= 1.2;
    elements.Air *= 1.1;
  } else {
    elements.Water *= 1.2;
    elements.Earth *= 1.1;
  }

  // Apply Tarot card boost
  if (tarotCardSuit) {
    const boostedElement = SUIT_TO_ELEMENT[tarotCardSuit as keyof typeof SUIT_TO_ELEMENT] as keyof typeof elements;
    if (boostedElement) {
      elements[boostedElement] *= 1.3;
    }
  }

  // Normalize to ensure sum equals 1.0
  const total = elements.Fire + elements.Earth + elements.Air + elements.Water;
  return {
    Fire: elements.Fire / total,
    Earth: elements.Earth / total,
    Air: elements.Air / total,
    Water: elements.Water / total,
  };
}

/**
 * Calculates alchemical token values based on planetary positions, day/night, and tarot card
 * Throws error if critical planetary positions are missing.
 */
export function calculatePlanetaryAlchemicalValues(
  positions: PlanetaryPositionsType,
  isDaytime = true,
  tarotCardSuit?: string
) {
  if (!positions || Object.keys(positions).length === 0) {
    throw new Error('Alchemical Error: Planetary positions are required for alchemical value calculation.');
  }

  const alchemicalValues = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };

  let totalWeight = 0;

  Object.entries(positions).forEach(([planet, data]) => {
    if (!data || ['ascendant', 'northnode', 'southnode'].includes(planet)) {
      return;
    }

    const properties = planetAlchemicalProperties[planet];
    if (!properties) return;

    let dignityMultiplier = 1.0;
    if (data.sign) {
      const sign = data.sign.toLowerCase();
      if (
        (planet === 'sun' && sign === 'leo') ||
        (planet === 'moon' && sign === 'cancer') ||
        (planet === 'mercury' && (sign === 'gemini' || sign === 'virgo')) ||
        (planet === 'venus' && (sign === 'taurus' || sign === 'libra')) ||
        (planet === 'mars' && (sign === 'aries' || sign === 'scorpio')) ||
        (planet === 'jupiter' && (sign === 'sagittarius' || sign === 'pisces')) ||
        (planet === 'saturn' && (sign === 'capricorn' || sign === 'aquarius'))
      ) {
        dignityMultiplier = 1.5;
      } else if (
        (planet === 'sun' && sign === 'aries') ||
        (planet === 'moon' && sign === 'taurus') ||
        (planet === 'jupiter' && sign === 'cancer') ||
        (planet === 'venus' && sign === 'pisces')
      ) {
        dignityMultiplier = 1.3;
      }
    }

    if (data.isRetrograde) dignityMultiplier *= 0.8;

    totalWeight += dignityMultiplier;
    alchemicalValues.Spirit += properties.Spirit * dignityMultiplier;
    alchemicalValues.Essence += properties.Essence * dignityMultiplier;
    alchemicalValues.Matter += properties.Matter * dignityMultiplier;
    alchemicalValues.Substance += properties.Substance * dignityMultiplier;
  });

  if (totalWeight === 0) {
    throw new Error('Alchemical Error: No valid planetary positions found to calculate alchemical values.');
  }

  if (isDaytime) {
    alchemicalValues.Spirit *= 1.1;
    alchemicalValues.Substance *= 1.1;
  } else {
    alchemicalValues.Essence *= 1.1;
    alchemicalValues.Matter *= 1.1;
  }

  if (tarotCardSuit) {
    const boostedToken = SUIT_TO_TOKEN[tarotCardSuit as keyof typeof SUIT_TO_TOKEN] as keyof typeof alchemicalValues;
    if (boostedToken) {
      alchemicalValues[boostedToken] *= 1.3;
    }
  }

  // Normalize
  const total = alchemicalValues.Spirit + alchemicalValues.Essence + alchemicalValues.Matter + alchemicalValues.Substance;
  return {
    Spirit: alchemicalValues.Spirit / total,
    Essence: alchemicalValues.Essence / total,
    Matter: alchemicalValues.Matter / total,
    Substance: alchemicalValues.Substance / total,
  };
}

/**
 * Combined alchemize function
 */
export function alchemize(
  positions: PlanetaryPositionsType,
  isDaytime = true,
  tarotCardSuit?: string
) {
  const elementalBalance = calculateElementalBalance(positions, isDaytime, tarotCardSuit);
  const alchemicalValues = calculatePlanetaryAlchemicalValues(positions, isDaytime, tarotCardSuit);
  
  return {
    elementalBalance,
    ...alchemicalValues,
    dominantElement: Object.entries(elementalBalance).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  };
}
