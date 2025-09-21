/**
 * Real Alchemize Service
 *
 * This service provides real alchemical calculations based on actual planetary positions.
 * It uses the proven standalone alchemize function that produces meaningful, nonzero results.
 */

import fs from 'fs';

import { ElementalProperties } from '@/types/celestial';

// Types
export type PlanetaryPosition = {
  sign: any,
  degree: number,
  minute: number,
  isRetrograde: boolean
};

export type ThermodynamicProperties = {
  heat: number,
  entropy: number,
  reactivity: number,
  gregsEnergy: number
};

export type StandardizedAlchemicalResult = {
  elementalProperties: ElementalProperties,
  thermodynamicProperties: ThermodynamicProperties,
  esms: { Spirit: number, Essence: number, Matter: number, Substance: number },
  kalchm: number,
  monica: number,
  score: number,
  normalized: boolean,
  confidence: number,
  metadata: {
    source: string,
    dominantElement: string,
    dominantModality: string,
    sunSign: string,
    chartRuler: string
  };
};

// Utility functions
function normalizeSign(sign: string): any {
  const normalized = sign.toLowerCase()
  const validSigns: any[] = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces'
  ];

  if (validSigns.includes(normalized as any)) {
    return normalized as any
  }

  throw new Error(`Invalid zodiac sign: ${sign}`);
}

function getZodiacElement(_sign: string): string {
  const elementMap: Record<string, string> = {
    aries: 'Fire',
    taurus: 'Earth',
    gemini: 'Air',
    cancer: 'Water',
    leo: 'Fire',
    virgo: 'Earth',
    libra: 'Air',
    scorpio: 'Water',
    sagittarius: 'Fire',
    capricorn: 'Earth',
    aquarius: 'Air',
    pisces: 'Water'
  };
  return elementMap[sign.toLowerCase()] || 'Air';
}

function getPlanetaryDignity(_planet: string, _sign: string): number {
  const dignityMap: Record<string, Record<string, number>> = {
    Sun: {
      leo: 1,
      aries: 2,
      aquarius: -1,
      libra: -2
    },
    Moon: {
      cancer: 1,
      taurus: 2,
      capricorn: -1,
      scorpio: -2
    },
    Mercury: {
      gemini: 1,
      virgo: 3,
      sagittarius: 1,
      pisces: -3
    },
    Venus: {
      libra: 1,
      taurus: 1,
      pisces: 2,
      aries: -1,
      scorpio: -1,
      virgo: -2
    },
    Mars: {
      aries: 1,
      scorpio: 1,
      capricorn: 2,
      taurus: -1,
      libra: -1,
      cancer: -2
    },
    Jupiter: {
      pisces: 1,
      sagittarius: 1,
      cancer: 2,
      gemini: -1,
      virgo: -1,
      capricorn: -2
    },
    Saturn: {
      aquarius: 1,
      capricorn: 1,
      libra: 2,
      cancer: -1,
      leo: -1,
      aries: -2
    },
    Uranus: {
      aquarius: 1,
      scorpio: 2,
      taurus: -3
    },
    Neptune: {
      pisces: 1,
      cancer: 2,
      virgo: -1,
      capricorn: -2
    },
    Pluto: {
      scorpio: 1,
      leo: 2,
      taurus: -1,
      aquarius: -2
    }
  };

  return dignityMap[planet][sign.toLowerCase()] || 0;
}

/**
 * Core alchemize function that calculates alchemical properties from planetary positions
 * This is the proven implementation that produces meaningful, nonzero results
 */
export function alchemize(
  planetaryPositions: Record<string, PlanetaryPosition>,
): StandardizedAlchemicalResult {
  // Initialize totals
  const totals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0
  };

  // Planetary alchemical properties
  const planetaryAlchemy: Record<
    string,
    { Spirit: number, Essence: number, Matter: number, Substance: number }
  > = {
    Sun: { Spirit: 1.0, Essence: 0.3, Matter: 0.2, Substance: 0.1 },
    Moon: { Spirit: 0.2, Essence: 1.0, Matter: 0.8, Substance: 0.3 },
    Mercury: { Spirit: 0.8, Essence: 0.2, Matter: 0.1, Substance: 0.9 },
    Venus: { Spirit: 0.3, Essence: 0.9, Matter: 0.7, Substance: 0.2 },
    Mars: { Spirit: 0.6, Essence: 0.8, Matter: 0.9, Substance: 0.1 },
    Jupiter: { Spirit: 0.9, Essence: 0.7, Matter: 0.2, Substance: 0.3 },
    Saturn: { Spirit: 0.7, Essence: 0.1, Matter: 0.9, Substance: 0.8 },
    Uranus: { Spirit: 0.4, Essence: 0.6, Matter: 0.3, Substance: 0.7 },
    Neptune: { Spirit: 0.2, Essence: 0.8, Matter: 0.4, Substance: 0.6 },
    Pluto: { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 }
  };

  // Process each planet
  for (const [planet, position] of Object.entries(planetaryPositions)) {
    // Get planetary alchemical properties
    const alchemy = planetaryAlchemy[planet];
    if (alchemy) {
      // Apply dignity modifier
      const dignity = getPlanetaryDignity(planet, position.sign);
      const dignityMultiplier = Math.max(0.11 + dignity * 0.2); // Dignity affects strength

      totals.Spirit += alchemy.Spirit * dignityMultiplier;
      totals.Essence += alchemy.Essence * dignityMultiplier;
      totals.Matter += alchemy.Matter * dignityMultiplier;
      totals.Substance += alchemy.Substance * dignityMultiplier;
    }

    // Add elemental contribution from sign
    const element = getZodiacElement(position.sign);
    const elementWeight = 1.0; // Base weight for sign element

    if (element === 'Fire') totals.Fire += elementWeight;
    else if (element === 'Water') totals.Water += elementWeight;
    else if (element === 'Air') totals.Air += elementWeight;
    else if (element === 'Earth') totals.Earth += elementWeight;
  }

  // Calculate thermodynamic metrics using the exact formulas
  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth} = totals;

  // Heat
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
  const heat = heatNum / (heatDen || 1); // Avoid division by zero

  // Entropy
  const entropyNum =
    Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / (entropyDen || 1);

  // Reactivity
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const reactivityDen = Math.pow(Matter + Earth, 2);
  const reactivity = reactivityNum / (reactivityDen || 1);

  // Greg's Energy
  const gregsEnergy = heat - entropy * reactivity;

  // Kalchm (K_alchm)
  const kalchm =
    (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) /
    (Math.pow(Matter, Matter) * Math.pow(Substance, Substance));

  // Monica constant
  let monica = 1.0; // Default value
  if (kalchm > 0) {
    const lnK = Math.log(kalchm);
    if (lnK !== 0) {
      monica = -gregsEnergy / (reactivity * lnK);
    }
  }

  // Calculate dominant element
  const elements = { Fire, Water, Air, Earth };
  const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0];

  // Calculate score based on total energy
  const score = Math.min(
    1.0,
    Math.max(0.0, (Spirit + Essence + Matter + Substance + Fire + Water + Air + Earth) / 20)
  );

  return {
    elementalProperties: {
      Fire: Fire / Math.max(1, Fire + Water + Air + Earth),
      Water: Water / Math.max(1, Fire + Water + Air + Earth),
      Earth: Earth / Math.max(1, Fire + Water + Air + Earth),
      Air: Air / Math.max(1, Fire + Water + Air + Earth)
    },
    thermodynamicProperties: {
      heat,
      entropy,
      reactivity,
      gregsEnergy
    },
    esms: { Spirit, Essence, Matter, Substance },
    kalchm,
    monica,
    score,
    normalized: true,
    confidence: 0.8,
    metadata: {
      source: 'alchemize',
      dominantElement,
      dominantModality: 'Cardinal', // Simplified for now
      sunSign: planetaryPositions['Sun'].sign || '',
      chartRuler: getZodiacElement(planetaryPositions['Sun'].sign || 'aries')
    }
  };
}

/**
 * Load planetary positions from the extracted data file
 */
export function loadPlanetaryPositions(): Record<string, PlanetaryPosition> {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // In browser, use fallback data
      return getFallbackPlanetaryPositions()
    }

    // In Node.js environment, try to read the file
    const rawData = fs.readFileSync('extracted-planetary-positions.json', 'utf8');
    const positions = JSON.parse(rawData);

    // Convert to the format expected by alchemize
    const convertedPositions: Record<string, PlanetaryPosition> = {};

    for (const [planetName, planetData] of Object.entries(positions)) {
      const data = planetData as any;

      convertedPositions[planetName] = {
        sign: normalizeSign(String(data.sign || '')),
        degree: Number(data.degree) || 0,
        minute: Number(data.minute) || 0,
        isRetrograde: Boolean(data.isRetrograde) || false
      };
    }

    return convertedPositions;
  } catch (error) {
    console.warn('Error loading planetary positions from file, using fallback data:', error);
    return getFallbackPlanetaryPositions();
  }
}

/**
 * Get fallback planetary positions for when file loading fails
 */
function getFallbackPlanetaryPositions(): Record<string, PlanetaryPosition> {
  // Current planetary positions as of July 2025
  return {
    Sun: { sign: 'cancer', degree: 15, minute: 30, isRetrograde: false },
    Moon: { sign: 'virgo', degree: 8, minute: 45, isRetrograde: false },
    Mercury: { sign: 'gemini', degree: 22, minute: 10, isRetrograde: false },
    Venus: { sign: 'leo', degree: 3, minute: 20, isRetrograde: false },
    Mars: { sign: 'taurus', degree: 18, minute: 55, isRetrograde: false },
    Jupiter: { sign: 'gemini', degree: 12, minute: 40, isRetrograde: false },
    Saturn: { sign: 'pisces', degree: 7, minute: 15, isRetrograde: false },
    Uranus: { sign: 'taurus', degree: 25, minute: 30, isRetrograde: false },
    Neptune: { sign: 'aries', degree: 29, minute: 45, isRetrograde: false },
    Pluto: { sign: 'aquarius', degree: 1, minute: 20, isRetrograde: false }
  };
}

/**
 * Get current alchemical state based on real planetary positions
 */
export function getCurrentAlchemicalState(): StandardizedAlchemicalResult {
  const planetaryPositions = loadPlanetaryPositions()
  return alchemize(planetaryPositions)
}

/**
 * Calculate alchemical properties for a specific set of planetary positions
 */
export function calculateAlchemicalProperties(
  positions: Record<string, PlanetaryPosition>,
): StandardizedAlchemicalResult {
  return alchemize(positions)
}

// Export the service as default
export default {
  alchemize,
  loadPlanetaryPositions,
  getCurrentAlchemicalState,
  calculateAlchemicalProperties
};
