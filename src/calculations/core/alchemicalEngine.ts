import type { ElementalProperties } from "@/types/alchemy";
import { _Element } from "@/types/alchemy";


// --- Core Alchemizer Engine with Kalchm and Monica Constant ---

// Zodiac sign names
const signs = {
  0: 'aries', 1: 'taurus', 2: 'gemini', 3: 'cancer',
  4: 'leo', 5: 'virgo', 6: 'libra', 7: 'scorpio',
  8: 'sagittarius', 9: 'capricorn', 10: 'aquarius', 11: 'pisces'
};

// Planetary alchemy and element info
const planetInfo: Record<string, unknown> = {
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

// Zodiac sign info (abbreviated for brevity, expand as needed)
const signInfo: Record<string, unknown> = {
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
type AlchemyTotals = {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number,
  Fire: number,
  Water: number,
  Air: number,
  Earth: number
};

type ThermodynamicMetrics = {
  heat: number,
  entropy: number,
  reactivity: number,
  gregsEnergy: number,
  kalchm: number,
  monica: number
};

// --- Core Calculation Function ---
function alchemize(planetaryPositions: { [planet: string]: string }): ThermodynamicMetrics {
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
    for (const prop in (planetData as any).Alchemy) {
      totals[prop as keyof AlchemyTotals] += (planetData as any)?.Alchemy?.[prop];
    }

    // Sum elemental properties (use signInfo for sign's element)
    const signElement = (signInfo[sign] as any)?.Element;
    if (signElement && totals[signElement] !== undefined) {
      totals[signElement] += 1;
    }
  }

  // 2. Calculate thermodynamic metrics (using exact formulas)
  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth   } = totals;

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

// --- Export for use in other modules ---
export { alchemize, signs, planetInfo, signInfo };

// Pattern OO-4: Integration Import Resolution - AlchemicalEngine class for service compatibility
export class AlchemicalEngine {
  /**
   * Calculate thermodynamic metrics from planetary positions
   */
  alchemize(planetaryPositions: { [planet: string]: string }): ThermodynamicMetrics {
    return alchemize(planetaryPositions);
  }
  
  /**
   * Calculate elemental compatibility between two elemental property sets
   */
  calculateElementalCompatibility(
    properties1: ElementalProperties,
    properties2: ElementalProperties
  ): number {
    if (!properties1 || !properties2) return 0;
    
    // Calculate similarity based on euclidean distance
    const distance = Math.sqrt(
      Math.pow((properties1.Fire || 0) - (properties2.Fire || 0), 2) +
      Math.pow((properties1.Water || 0) - (properties2.Water || 0), 2) +
      Math.pow((properties1.Earth || 0) - (properties2.Earth || 0), 2) +
      Math.pow((properties1.Air || 0) - (properties2.Air || 0), 2)
    );
    
    // Convert distance to compatibility score (0-1)
    return Math.max(0, 1 - distance / 2);
  }
}

// Also provide default export for backwards compatibility
export default { alchemize, signs, planetInfo, signInfo }; 