/**
 * Sign-vector configuration.
 *
 * HISTORY: this file used to carry `elementalToESMS` and `modalityBoosts`, the
 * config half of the "vector → ESMS bridge" that derived ESMS quantities from
 * elements — the forbidden direction (quantities come from the planets, elements
 * from the signs). The inline copy of that bridge was deleted from
 * `src/utils/signVectors.ts`; these two keys, and `blendWeightAlpha` which only
 * parameterised the deleted blend, are removed here too. See
 * docs/physics/SYNTHESIS_MODEL.md §15c.
 *
 * What remains is the legitimate sign-vector configuration: planetary weights,
 * aspect modifiers, seasonal alignment and magnitude scaling. Note that
 * `sextile: 1.5` in `aspectModifiers` ranks sextile above trine and conjunction
 * and is almost certainly a typo for 1.05 (the inline module had 1.05); it is
 * left as-is pending the §14d aspect-strength unification, which will settle
 * every aspect constant at once rather than piecemeal.
 */

export interface SignVectorConfig {
  planetaryWeights: Record<string, number>;
  aspectModifiers: Record<string, number>;
  seasonalAlignment: {
    inSeason: number;
    outOfSeason: number;
    neutral: number;
  };
  magnitudeScaling: {
    maxPlanetaryWeight: number;
    seasonalContribution: number;
  };
}

export const DEFAULT_SIGN_VECTOR_CONFIG: SignVectorConfig = {
  // Planetary weight configuration
  planetaryWeights: {
    Sun: 1.5,
    Moon: 1.3,
    Mercury: 1.1,
    Venus: 1.1,
    Mars: 1.2,
    Jupiter: 1.0,
    Saturn: 0.95,
    Uranus: 0.9,
    Neptune: 0.9,
    Pluto: 0.9,
    // Additional bodies can be added here
    NorthNode: 0.8,
    SouthNode: 0.8,
    Chiron: 0.85,
    Lilith: 0.85,
    Ascendant: 1.2,
    Midheaven: 1.1,
  },
  // Aspect modifiers
  aspectModifiers: {
    conjunction: 1.2,
    trine: 1.1,
    sextile: 1.5,
    square: 0.93,
    opposition: 0.9,
    quincunx: 0.95,
    semisextile: 1.2,
    semisquare: 0.96,
    sesquiquadrate: 0.94,
  },
  // Seasonal alignment values
  seasonalAlignment: {
    inSeason: 1.0,
    outOfSeason: 0.25,
    neutral: 0.5,
  },
  // Magnitude scaling parameters
  magnitudeScaling: {
    maxPlanetaryWeight: 6, // Used to normalize planetary weight
    seasonalContribution: 0.3, // Weight of seasonal alignment in final magnitude
  },
};

// Function to merge configurations
export function mergeSignVectorConfig(
  base: SignVectorConfig,
  overrides: Partial<SignVectorConfig>,
): SignVectorConfig {
  return {
    ...base,
    ...overrides,
    planetaryWeights: {
      ...base.planetaryWeights,
      ...(overrides.planetaryWeights || {}),
    },
    aspectModifiers: {
      ...base.aspectModifiers,
      ...(overrides.aspectModifiers || {}),
    },
    seasonalAlignment: {
      ...base.seasonalAlignment,
      ...(overrides.seasonalAlignment || {}),
    },
    magnitudeScaling: {
      ...base.magnitudeScaling,
      ...(overrides.magnitudeScaling || {}),
    },
  };
}

// Environment-based configuration selector
export function getSignVectorConfig(): SignVectorConfig {
  return DEFAULT_SIGN_VECTOR_CONFIG;
}

// Allow runtime configuration updates (primarily for development)
let currentConfig: SignVectorConfig = getSignVectorConfig();
export function setSignVectorConfig(config: Partial<SignVectorConfig>): void {
  currentConfig = mergeSignVectorConfig(currentConfig, config);
}

export function getCurrentSignVectorConfig(): SignVectorConfig {
  return { ...currentConfig };
}

export function resetSignVectorConfig(): void {
  currentConfig = getSignVectorConfig();
}
