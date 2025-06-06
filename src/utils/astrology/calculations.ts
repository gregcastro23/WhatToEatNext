/**
 * Astrology Calculations Module
 * 
 * Consolidates alchemical calculations, thermodynamic metrics, and the core alchemize function
 * with Kalchm and Monica constants following the elemental principles guide.
 */

import { Element , AlchemicalProperties } from "@/types/alchemy";
import { PlanetaryPosition } from '@/types/celestial';
// --- Core Alchemizer Engine with Kalchm and Monica Constants ---

// Zodiac sign names
export const signs = {
  0: 'aries', 1: 'taurus', 2: 'gemini', 3: 'cancer',
  4: 'leo', 5: 'virgo', 6: 'libra', 7: 'scorpio',
  8: 'sagittarius', 9: 'capricorn', 10: 'aquarius', 11: 'pisces'
};

// Define types for planet info objects
interface DignityEffect {
  [sign: string]: number;
}

interface AlchemyValues {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

interface PlanetInfoData {
  'Dignity Effect': DignityEffect;
  Elements: string[];
  Alchemy: AlchemyValues;
  'Diurnal Element': string;
  'Nocturnal Element': string;
}

// Define type for Ascendant which has a different structure
interface AscendantInfo {
  'Diurnal Element': string;
  'Nocturnal Element': string;
}

// Define type for the entire planetInfo object
type PlanetInfo = Record<string, PlanetInfoData | AscendantInfo>;

// Planetary alchemy and element info
export const planetInfo: PlanetInfo = {
  Sun: {
    'Dignity Effect': { leo: 1, aries: 2, aquarius: -1, libra: -2 },
    Elements: ['Fire', 'Fire'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Fire'
  },
  moon: {
    'Dignity Effect': { cancer: 1, taurus: 2, capricorn: -1, scorpio: -2 },
    Elements: ['Water', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  Mercury: {
    'Dignity Effect': { gemini: 1, virgo: 3, sagittarius: 1, pisces: -3 },
    Elements: ['Air', 'Earth'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  Venus: {
    'Dignity Effect': { libra: 1, taurus: 1, pisces: 2, aries: -1, scorpio: -1, virgo: -2 },
    Elements: ['Water', 'Earth'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Earth'
  },
  Mars: {
    'Dignity Effect': { aries: 1, scorpio: 1, capricorn: 2, taurus: -1, libra: -1, cancer: -2 },
    Elements: ['Fire', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Fire',
    'Nocturnal Element': 'Water'
  },
  Jupiter: {
    'Dignity Effect': { pisces: 1, sagittarius: 1, cancer: 2, gemini: -1, virgo: -1, capricorn: -2 },
    Elements: ['Air', 'Fire'],
    Alchemy: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Fire'
  },
  Saturn: {
    'Dignity Effect': { aquarius: 1, capricorn: 1, libra: 2, cancer: -1, leo: -1, aries: -2 },
    Elements: ['Air', 'Earth'],
    Alchemy: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Air',
    'Nocturnal Element': 'Earth'
  },
  Uranus: {
    'Dignity Effect': { aquarius: 1, scorpio: 2, taurus: -3 },
    Elements: ['Water', 'Air'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Air'
  },
  Neptune: {
    'Dignity Effect': { pisces: 1, cancer: 2, virgo: -1, capricorn: -2 },
    Elements: ['Water', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
    'Diurnal Element': 'Water',
    'Nocturnal Element': 'Water'
  },
  Pluto: {
    'Dignity Effect': { scorpio: 1, leo: 2, taurus: -1, aquarius: -2 },
    Elements: ['Earth', 'Water'],
    Alchemy: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Water'
  },
  Ascendant: {
    'Diurnal Element': 'Earth',
    'Nocturnal Element': 'Earth'
  }
};

// Define interface for signInfo
interface ZodiacSignInfo {
  Element: string;
}

// Zodiac sign info
export const signInfo: { [key: string]: ZodiacSignInfo } = {
  aries: { Element: 'Fire' },
  taurus: { Element: 'Earth' },
  gemini: { Element: 'Air' },
  cancer: { Element: 'Water' },
  leo: { Element: 'Fire' },
  virgo: { Element: 'Earth' },
  libra: { Element: 'Air' },
  scorpio: { Element: 'Water' },
  sagittarius: { Element: 'Fire' },
  capricorn: { Element: 'Earth' },
  aquarius: { Element: 'Air' },
  pisces: { Element: 'Water' }
};

// --- Types ---
export type AlchemyTotals = {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number,
  Fire: number,
  Water: number,
  Air: number,
  Earth: number
};

export type ThermodynamicMetrics = {
  heat: number,
  entropy: number,
  reactivity: number,
  energy: number     // Normalized energy level (for scoring)
};

export interface AlchemicalResult {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  elementalBalance: {
    Fire: number;
    Earth: number;
    Air: number;
    Water: number;
  };
  dominantElement: string;
  recommendation: string;
  totalEffectValue: {
    Fire: number;
    Earth: number;
    Air: number;
    Water: number;
  };
}
;
}

// Map elements to zodiac signs
const signElements: { [key: string]: string } = {
  'aries': 'Fire',
  'leo': 'Fire',
  'sagittarius': 'Fire',
  'taurus': 'Earth',
  'virgo': 'Earth',
  'capricorn': 'Earth',
  'gemini': 'Air',
  'libra': 'Air',
  'aquarius': 'Air',
  'cancer': 'Water',
  'scorpio': 'Water',
  'pisces': 'Water'
};

// Map planets to their alchemical properties
const planetAlchemicalProperties: Record<string, Record<string, number>> = {
  'Sun': { Spirit: 1.0, Essence: 0.2, Matter: 0.3, Substance: 0.1 },
  'Moon': { Spirit: 0.3, Essence: 0.9, Matter: 0.5, Substance: 0.2 },
  'Mercury': { Spirit: 0.7, Essence: 0.5, Matter: 0.3, Substance: 0.8 },
  'Venus': { Spirit: 0.4, Essence: 0.8, Matter: 0.6, Substance: 0.3 },
  'Mars': { Spirit: 0.6, Essence: 0.4, Matter: 0.7, Substance: 0.2 },
  'Jupiter': { Spirit: 0.8, Essence: 0.6, Matter: 0.4, Substance: 0.5 },
  'Saturn': { Spirit: 0.5, Essence: 0.3, Matter: 0.8, Substance: 0.6 },
  'Uranus': { Spirit: 0.9, Essence: 0.4, Matter: 0.2, Substance: 0.7 },
  'Neptune': { Spirit: 0.7, Essence: 0.8, Matter: 0.3, Substance: 0.9 },
  'Pluto': { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 }
};

// --- Core Calculation Function ---
export function alchemize(planetaryPositions: { [planet: string]: string }): ThermodynamicMetrics {
  // 1. Aggregate alchemical and elemental properties
  const totals: AlchemyTotals = {
    Spirit: 0, Essence: 0, Matter: 0, Substance: 0,
    Fire: 0, Water: 0, Air: 0, Earth: 0
  };

  for (const planet in planetaryPositions) {
    const sign = planetaryPositions[planet];
    const planetData = planetInfo[planet];
    if (!planetData) continue;

    // Sum alchemical properties
    for (const prop in planetData.Alchemy) {
      totals[prop as keyof AlchemyTotals] += planetData?.Alchemy?.[prop];
    }

    // Sum elemental properties (use signInfo for sign's element)
    const signElement = signInfo[sign]?.Element;
    if (signElement && totals[signElement] !== undefined) {
      totals[signElement] += 1;
    }
  }

  // 2. Calculate thermodynamic metrics (using exact formulas)
  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } = totals;

  // Heat
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
  const heat = heatNum / heatDen;

  // Entropy
  const entropyNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / entropyDen;

  // Reactivity
  const reactivityNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Essence, 2)
    + Math.pow(Fire, 2) + Math.pow(Air, 2) + Math.pow(Water, 2);
  const reactivityDen = Math.pow(Matter + Earth, 2);
  const reactivity = reactivityNum / reactivityDen;

  // Greg's Energy
  const gregsEnergy = heat - (entropy * reactivity);

  // Kalchm (K_alchm)
  const kalchm = (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) /
    (Math.pow(Matter, Matter) * Math.pow(Substance, Substance));

  // Monica constant
  let monica = NaN;
  if (kalchm > 0) {
    const lnK = Math.log(kalchm);
    if (lnK !== 0) {
      monica = -gregsEnergy / (reactivity * lnK);
    }
  }

  return { heat, entropy, reactivity, gregsEnergy, kalchm, monica };
}

// Calculate elemental values based on planetary positions
export function calculateElementalValues(positions: PlanetaryPositionsType) {
  const elements = { Fire: 0, Earth: 0, Air: 0,
    Water: 0
  };
  
  // Count planets by element
  Object.entries(positions || {}).forEach(([planet, data]) => {
    if (!data.sign || planet === 'ascendant' || planet === 'northnode' || planet === 'southnode') {
      return;
    }
    
    const signKey = data.sign?.toLowerCase();
    const element = signElements[signKey] || 'balanced';
    
    // Only add to elements if it's a valid element key
    if (element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air') {
      // Weight by planet importance
      let weight = 1.0;
      if (planet === 'Sun' || planet === 'Moon') weight = 3.0;
      if (planet === 'Mercury' || planet === 'Venus' || planet === 'Mars') weight = 1.5;
      
      elements[element] += weight;
    }
  });
  
  // Calculate alchemical values from elements
  const total = elements.Fire + elements.Earth + elements.Air + elements.Water;
  
  return {
    Spirit: (elements.Fire + elements.Air) / (total * 2) + 0.1,
    Essence: (elements.Fire + elements.Water) / (total * 2) + 0.1,
    Matter: (elements.Earth + elements.Water) / (total * 2) + 0.1,
    Substance: (elements.Earth + elements.Air) / (total * 2) + 0.1
  };
}

// Calculate planetary contributions to alchemical values
export function calculatePlanetaryAlchemicalValues(positions: PlanetaryPositionsType) {
  const alchemicalValues = {
    Spirit: 0.25,
    Essence: 0.25,
    Matter: 0.25,
    Substance: 0.25
  };
  
  let totalWeight = 0;
  
  Object.entries(positions || {}).forEach(([planet, data]) => {
    if (!data || planet === 'ascendant' || planet === 'northnode' || planet === 'southnode') {
      return;
    }
    
    const properties = planetAlchemicalProperties[planet];
    if (!properties) return;
    
    // Weight by planetary dignity
    let dignityMultiplier = 1.0;
    if (data.sign) {
      // Simple dignity check
      if (
        (planet === 'Sun' && data.sign === 'leo') ||
        (planet === 'Moon' && data.sign === 'cancer') ||
        (planet === 'Mercury' && (data.sign === 'gemini' || data.sign === 'virgo')) ||
        (planet === 'Venus' && (data.sign === 'taurus' || data.sign === 'libra')) ||
        (planet === 'Mars' && (data.sign === 'aries' || data.sign === 'scorpio')) ||
        (planet === 'Jupiter' && (data.sign === 'sagittarius' || data.sign === 'pisces')) ||
        (planet === 'Saturn' && (data.sign === 'capricorn' || data.sign === 'aquarius')) ||
        (planet === 'Uranus' && data.sign === 'aquarius') ||
        (planet === 'Neptune' && data.sign === 'pisces') ||
        (planet === 'Pluto' && data.sign === 'scorpio')
      ) {
        dignityMultiplier = 1.5; // Domicile or rulership
      } else if (
        (planet === 'Sun' && data.sign === 'aries') ||
        (planet === 'Moon' && data.sign === 'taurus') ||
        (planet === 'Jupiter' && data.sign === 'cancer') ||
        (planet === 'Venus' && data.sign === 'pisces')
      ) {
        dignityMultiplier = 1.3; // Exaltation
      } else if (
        (planet === 'Venus' && data.sign === 'virgo') ||
        (planet === 'Mercury' && data.sign === 'pisces') ||
        (planet === 'Mars' && data.sign === 'cancer') ||
        (planet === 'Jupiter' && data.sign === 'capricorn')
      ) {
        dignityMultiplier = 0.7; // Fall
      }
    }
    
    // Add weighted contribution
    const weight = dignityMultiplier;
    totalWeight += weight;
    
    alchemicalValues.Spirit += properties.Spirit * weight;
    alchemicalValues.Essence += properties.Essence * weight;
    alchemicalValues.Matter += properties.Matter * weight;
    alchemicalValues.Substance += properties.Substance * weight;
  });
  
  // Normalize values
  if (totalWeight > 0) {
    const normalizer = (positions ? Object.keys(positions || {}).length : 10) / 10;
    
    return {
      Spirit: alchemicalValues.Spirit / normalizer,
      Essence: alchemicalValues.Essence / normalizer,
      Matter: alchemicalValues.Matter / normalizer,
      Substance: alchemicalValues.Substance / normalizer
    };
  }
  
  return alchemicalValues;
}

// Calculate elemental balance based on planetary positions
export function calculateElementalBalance(positions: PlanetaryPositionsType) {
  // Initialize with balanced elements
  const elements = { Fire: 0.25, Earth: 0.25, Air: 0.25, 
    Water: 0.25
  };
  
  if (!positions || Object.keys(positions || {}).length === 0) {
    return elements;
  }
  
  let totalWeight = 0;
  let elementsFound = false;
  
  Object.entries(positions || {}).forEach(([planet, data]) => {
    if (!data || !data.sign || planet === 'ascendant' || planet === 'northnode' || planet === 'southnode') {
      return;
    }
    
    const signKey = data.sign?.toLowerCase();
    const element = signElements[signKey];
    
    // Only proceed if it's a valid element
    if (element && (element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air')) {
      // Weight by planet importance
      let weight = 1.0;
      if (planet === 'Sun' || planet === 'Moon') weight = 2.5;
      if (planet === 'Mercury' || planet === 'Venus' || planet === 'Mars') weight = 1.5;
      
      elements[element] += weight;
      totalWeight += weight;
      elementsFound = true;
    }
  });
  
  // Normalize to ensure sum equals 1.0
  if (totalWeight > 0 && elementsFound) {
    const total = elements.Fire + elements.Earth + elements.Air + elements.Water;
    
    return { Fire: elements.Fire / total, Earth: elements.Earth / total, Air: elements.Air / total,
      Water: elements.Water / total
    };
  }
  
  return elements;
}

// Generate recommendation based on dominant element
function generateRecommendation(dominantElement: string): string {
  const recommendations = { Fire: "Focus on energizing and warming foods. Consider spices, grilled foods, and warming herbs.",
    Earth: "Emphasize grounding and nourishing foods. Root vegetables, grains, and substantial meals work well.",
    Air: "Light, fresh foods support your current energy. Consider salads, fruits, and Airy preparations.",
    Water: "Cooling and flowing foods align with your energy. Soups, stews, and hydrating foods are ideal."
  };
  
  return recommendations[dominantElement as keyof typeof recommendations] || 
    "Maintain balance with a variety of foods from all elements.";
}

// Enhanced alchemize function with full result
export function alchemizeDetailed(
  planetaryPositions: { [key: string]: PlanetaryPosition },
  isDaytime = true,
  lunarPhase?: string,
  retrogrades?: { [key: string]: boolean }
): AlchemicalResult {
  // Calculate elemental balance// Calculate alchemical values
  const alchemicalValues = calculatePlanetaryAlchemicalValues(planetaryPositions);
  
  // Find dominant element
  const dominantElement = Object.entries(elementalBalance)
    .reduce((a, b) => elementalBalance[a[0] as keyof typeof elementalBalance] > elementalBalance[b[0] as keyof typeof elementalBalance] ? a : b)[0];
  
  // Generate recommendation
  const recommendation = generateRecommendation(dominantElement);
  
  return {
    Spirit: alchemicalValues.Spirit,
    Essence: alchemicalValues.Essence,
    Matter: alchemicalValues.Matter,
    Substance: alchemicalValues.Substance,
    elementalBalance: calculateElementalBalance(planetaryPositions),
    dominantElement,
    recommendation,
    totalEffectValue: {
      Fire: calculateElementalBalance(planetaryPositions).Fire,
      Earth: calculateElementalBalance(planetaryPositions).Earth,
      Air: calculateElementalBalance(planetaryPositions).Air,
      Water: calculateElementalBalance(planetaryPositions).Water
    }
  };
}

// Export for use in other modules
export default { 
  alchemize, 
  alchemizeDetailed,
  signs, 
  planetInfo, 
  signInfo,
  calculateElementalValues,
  calculatePlanetaryAlchemicalValues,
  calculateElementalBalance
}; 