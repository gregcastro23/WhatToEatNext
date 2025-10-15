export interface SignEnergyState {
  sign: any;
  baseEnergy: number;
  planetaryModifiers: Record<string, number>;
  currentEnergy: number
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string // 'conjunction', 'sextile', 'square', 'trine', 'opposition'
}
export const ZODIAC_SIGNS = [
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
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

// Base energy levels for each sign
const BASE_SIGN_ENERGIES: Record<ZodiacSign, number> = {
  aries: 1.0,
  taurus: 0.8,
  gemini: 0.6,
  cancer: 0.7,
  leo: 0.9,
  virgo: 0.6,
  libra: 0.7,
  scorpio: 0.8,
  sagittarius: 0.9,
  capricorn: 0.7,
  aquarius: 0.6,
  pisces: 0.8
}

// Define initial energy states for all zodiac signs
export const ENERGY_STATES: Record<ZodiacSign, { baseEnergy: number, currentEnergy: number }> = {
  aries: { baseEnergy: BASE_SIGN_ENERGIES.aries, currentEnergy: BASE_SIGN_ENERGIES.aries },
  taurus: { baseEnergy: BASE_SIGN_ENERGIES.taurus, currentEnergy: BASE_SIGN_ENERGIES.taurus },
  gemini: { baseEnergy: BASE_SIGN_ENERGIES.gemini, currentEnergy: BASE_SIGN_ENERGIES.gemini },
  cancer: { baseEnergy: BASE_SIGN_ENERGIES.cancer, currentEnergy: BASE_SIGN_ENERGIES.cancer },
  leo: { baseEnergy: BASE_SIGN_ENERGIES.leo, currentEnergy: BASE_SIGN_ENERGIES.leo },
  virgo: { baseEnergy: BASE_SIGN_ENERGIES.virgo, currentEnergy: BASE_SIGN_ENERGIES.virgo },
  libra: { baseEnergy: BASE_SIGN_ENERGIES.libra, currentEnergy: BASE_SIGN_ENERGIES.libra },
  scorpio: { baseEnergy: BASE_SIGN_ENERGIES.scorpio, currentEnergy: BASE_SIGN_ENERGIES.scorpio },
  sagittarius: {
    baseEnergy: BASE_SIGN_ENERGIES.sagittarius,
    currentEnergy: BASE_SIGN_ENERGIES.sagittarius
  },
  capricorn: {
    baseEnergy: BASE_SIGN_ENERGIES.capricorn,
    currentEnergy: BASE_SIGN_ENERGIES.capricorn
  },
  aquarius: { baseEnergy: BASE_SIGN_ENERGIES.aquarius, currentEnergy: BASE_SIGN_ENERGIES.aquarius },
  pisces: { baseEnergy: BASE_SIGN_ENERGIES.pisces, currentEnergy: BASE_SIGN_ENERGIES.pisces }
}

// Planetary rulerships and their energy multipliers
const PLANETARY_RULERSHIPS: Record<ZodiacSign, string[]> = {
  aries: ['Mars'],
  taurus: ['Venus'],
  gemini: ['Mercury'],
  cancer: ['Moon'],
  leo: ['Sun'],
  virgo: ['Mercury'],
  libra: ['Venus'],
  scorpio: ['Mars', 'Pluto'],
  sagittarius: ['Jupiter'],
  capricorn: ['Saturn'],
  aquarius: ['Uranus', 'Saturn'],
  pisces: ['Neptune', 'Jupiter']
}

// Planetary energy multipliers
const PLANETARY_ENERGY_MULTIPLIERS: Record<string, number> = {
  Sun: 1.2,
  Moon: 1.1,
  Mercury: 0.9,
  Venus: 1.0,
  Mars: 1.3,
  Jupiter: 1.1,
  Saturn: 0.8,
  Uranus: 0.9,
  Neptune: 1.0,
  Pluto: 1.2
}

// Aspect strength multipliers
const ASPECT_STRENGTHS: Record<string, number> = {
  conjunction: 1.2,
  sextile: 1.1,
  square: 0.9,
  trine: 1.1,
  opposition: 0.8
}

/**
 * Interface for planetary position data
 */
export interface PlanetaryPosition {
  sign?: string;
  degree?: number;
  [key: string]: unknown
}

/**
 * Calculate energy states for all zodiac signs based on planetary positions and aspects
 * @param planetaryPositions Record of planetary positions
 * @param aspects Array of planetary aspects
 * @returns Array of sign energy states
 */
export function calculateSignEnergyStates(
  planetaryPositions: Record<string, PlanetaryPosition>,
  aspects: Aspect[]
): SignEnergyState[] {
  return ZODIAC_SIGNS.map(sign => {
    const baseEnergy = BASE_SIGN_ENERGIES[sign];
    const planetaryModifiers: Record<string, number> = {};

    // Apply planetary rulers' influences
    PLANETARY_RULERSHIPS[sign].forEach(planet => {
      const planetPosition = planetaryPositions[planet];
      if (planetPosition) {
        // Calculate influence based on planet's position and strength
        const positionStrength =
          typeof planetPosition.degree === 'number' ? 1 - planetPosition.degree / 30 : 0.5; // Default to 0.5 if degree is not available

        const planetMultiplier = PLANETARY_ENERGY_MULTIPLIERS[planet] || 1.0;

        // Apply aspect modifiers
        const aspectModifier = aspects.reduce((mod, aspect) => {
          if (aspect.planet1 === planet || aspect.planet2 === planet) {
            return mod * (ASPECT_STRENGTHS[aspect.type] || 1.0);
          }
          return mod;
        }, 1.0);

        planetaryModifiers[planet] = positionStrength * planetMultiplier * aspectModifier;
      }
    });

    // Calculate current energy
    const modifierValues = Object.values(planetaryModifiers);
    const currentEnergy =
      modifierValues.length > 0
        ? modifierValues.reduce((total, modifier) => total * modifier, baseEnergy)
        : baseEnergy;

    return {
      sign,
      baseEnergy,
      planetaryModifiers,
      currentEnergy: Math.min(1.0, Math.max(0.1, currentEnergy))
    }
  })
}

// Export alias for compatibility
export const _SIGN_ENERGY_STATES = ENERGY_STATES;
