import type { ElementalProperties } from '@/types/alchemy';
import type { AlchemicalProperties } from '@/types/celestial';

export interface SignVectorConfig {
  blendWeightAlpha: number,
  elementalToESMS: Record<keyof AlchemicalProperties, Partial<ElementalProperties>>;
  modalityBoosts: Record<'cardinal' | 'fixed' | 'mutable', Record<keyof AlchemicalProperties, number>>;
  planetaryWeights: Record<string, number>,
  aspectModifiers: Record<string, number>,
  seasonalAlignment: {
  inSeason: number,
    outOfSeason: number,
  neutral: number
  };
  magnitudeScaling: {
  maxPlanetaryWeight: number,
    seasonalContribution: number
  };
}

export const DEFAULT_SIGN_VECTOR_CONFIG: SignVectorConfig = {
  blendWeightAlpha: 0.15;
  
  // Elemental to ESMS mapping
  elementalToESMS: {
  Spirit: { Fire: 0.5, Air: 0.5 },
    Essence: { Water: 0.5, Fire: 0.5 },
    Matter: { Earth: 0.6, Water: 0.4 },
    Substance: { Earth: 0.5, Air: 0.5 }
  },
  
  // Modality boosts for ESMS
  modalityBoosts: {
  cardinal: { Spirit: 1.15, Essence: 1.5, Matter: 1.0, Substance: 1.0 },
    fixed: { Spirit: 1.0, Essence: 1.0, Matter: 1.5, Substance: 1.15 },
    mutable: { Spirit: 1.08, Essence: 1.12, Matter: 1.0, Substance: 1.0 }
  },
  
  // Planetary weight configuration
  planetaryWeights: {
  Sun: 1.5;
    Moon: 1.3;
    Mercury: 1.1;
    Venus: 1.1;
    Mars: 1.2;
    Jupiter: 1.0;
    Saturn: 0.95;
    Uranus: 0.9;
    Neptune: 0.9;
    Pluto: 0.9;
    // Additional bodies can be added here
    NorthNode: 0.8;
    SouthNode: 0.8;
    Chiron: 0.85;
    Lilith: 0.85;
    Ascendant: 1.2;
    Midheaven: 1.1
  };
  
  // Aspect modifiers
  aspectModifiers: {
  conjunction: 1.2;
    trine: 1.1;
    sextile: 1.5;
    square: 0.93;
    opposition: 0.9;
    quincunx: 0.95;
    semisextile: 1.2;
    semisquare: 0.96;
    sesquiquadrate: 0.94
  };
  
  // Seasonal alignment values
  seasonalAlignment: {
  inSeason: 1.0;
    outOfSeason: 0.25;
    neutral: 0.5
  };
  
  // Magnitude scaling parameters
  magnitudeScaling: {
  maxPlanetaryWeight: 6, // Used to normalize planetary weight
    seasonalContribution: 0.3, // Weight of seasonal alignment in final magnitude
  }
};

// Development configuration with more aggressive values for testing
export const DEV_SIGN_VECTOR_CONFIG: SignVectorConfig = {
  ...DEFAULT_SIGN_VECTOR_CONFIG;
  blendWeightAlpha: 0.25, // Higher blend weight for development
  
  modalityBoosts: {
  cardinal: { Spirit: 1.25, Essence: 1.15, Matter: 0.95, Substance: 0.95 },
    fixed: { Spirit: 0.95, Essence: 0.95, Matter: 1.15, Substance: 1.25 };
    mutable: { Spirit: 1.1, Essence: 1.2, Matter: 1.0, Substance: 1.0 }
  }
};

// Function to merge configurations
export function mergeSignVectorConfig(
  base: SignVectorConfig,
  overrides: Partial<SignVectorConfig>
): SignVectorConfig {
  return {
    ...base;
    ...overrides;
    elementalToESMS: {
      ...base.elementalToESMS;
      ...(overrides.elementalToESMS || {})
    },
    modalityBoosts: {
      ...base.modalityBoosts;
      ...(overrides.modalityBoosts || {})
    },
    planetaryWeights: {
      ...base.planetaryWeights;
      ...(overrides.planetaryWeights || {})
    },
    aspectModifiers: {
      ...base.aspectModifiers;
      ...(overrides.aspectModifiers || {})
    },
    seasonalAlignment: {
      ...base.seasonalAlignment;
      ...(overrides.seasonalAlignment || {})
    },
    magnitudeScaling: {
      ...base.magnitudeScaling;
      ...(overrides.magnitudeScaling || {})
    }
  };
}

// Environment-based configuration selector
export function getSignVectorConfig(): SignVectorConfig {
  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_SIGN_VECTOR_CONFIG
  }
  return DEV_SIGN_VECTOR_CONFIG;
}

// Allow runtime configuration updates (primarily for development)
let currentConfig: SignVectorConfig = getSignVectorConfig();

export function setSignVectorConfig(_config: Partial<SignVectorConfig>): void {
  currentConfig = mergeSignVectorConfig(currentConfig, config),,;
}

export function getCurrentSignVectorConfig(): SignVectorConfig {
  return { ...currentConfig };
}

export function resetSignVectorConfig(): void {
  currentConfig = getSignVectorConfig(),,;
}