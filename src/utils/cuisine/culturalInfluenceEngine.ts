/**
 * Cultural Influence Engine
 *
 * Analyzes and applies cultural, geographic, and historical influences to cuisine properties.
 * Integrates environmental factors, culinary traditions, and cross-cultural exchanges.
 *
 * Key Features:
 * - Geographic and climate influence calculations
 * - Historical culinary exchange analysis
 * - Traditional philosophy integration
 * - Cultural signature enhancement
 */

import type {
    AlchemicalProperties,
    CuisineComputedProperties,
    CulturalInfluence,
    ElementalProperties
} from '@/types/hierarchy';

// ========== GEOGRAPHIC AND CLIMATE DATA ==========

/**
 * Geographic regions and their elemental associations
 */
export const GEOGRAPHIC_REGIONS = {
  mediterranean: {
    name: 'Mediterranean',
    climate: 'mediterranean',
    elementalModifiers: { Fire: 0.1, Water: 0.1, Earth: -0.1, Air: 0.1 },
    description: 'Sunny, coastal region with olive oil, fresh seafood, and herb-forward cuisine',
  },
  tropical: {
    name: 'Tropical',
    climate: 'tropical',
    elementalModifiers: { Fire: 0.2, Water: 0.2, Earth: -0.2, Air: 0.0 },
    description: 'Hot, humid regions with bold spices, fresh fruits, and vibrant flavors',
  },
  temperate: {
    name: 'Temperate',
    climate: 'temperate',
    elementalModifiers: { Fire: 0.0, Water: 0.0, Earth: 0.1, Air: 0.0 },
    description: 'Moderate climate with balanced ingredients and seasonal variety'
},
  arctic: {
    name: 'Arctic',
    climate: 'arctic',
    elementalModifiers: { Fire: -0.1, Water: -0.2, Earth: 0.3, Air: -0.1 },
    description: 'Cold regions with preserved foods, root vegetables, and hearty preparations',
  },
  desert: {
    name: 'Desert',
    climate: 'desert',
    elementalModifiers: { Fire: 0.1, Water: -0.2, Earth: 0.2, Air: 0.0 },
    description: 'Dry regions with preserved foods, spices, and water-efficient cooking',
  },
  mountainous: {
    name: 'Mountainous',
    climate: 'temperate',
    elementalModifiers: { Fire: -0.1, Water: 0.1, Earth: 0.2, Air: 0.0 },
    description: 'Elevated regions with pasture-raised meats and fermented products'
}
} as const;

/**
 * Climate type modifiers for elemental properties
 */
export const CLIMATE_MODIFIERS: Record<string, Partial<ElementalProperties>> = {
  tropical: { Fire: 0.15, Water: 0.15, Earth: -0.1, Air: 0.05 },
  temperate: { Fire: 0.05, Water: 0.05, Earth: 0.05, Air: 0.05 },
  arctic: { Fire: -0.1, Water: -0.15, Earth: 0.2, Air: -0.05 },
  desert: { Fire: 0.1, Water: -0.15, Earth: 0.15, Air: 0.05 },
  mediterranean: { Fire: 0.1, Water: 0.1, Earth: -0.05, Air: 0.1 }
};

// ========== CULTURAL PHILOSOPHY DATA ==========

/**
 * Traditional culinary philosophies and their property modifiers
 */
export const CULINARY_PHILOSOPHIES = {
  farm_to_table: {
    name: 'Farm to Table',
    elementalModifiers: { Earth: 0.15, Water: 0.1, Air: 0.05, Fire: -0.05 },
    alchemicalModifiers: { Spirit: 0.1, Essence: 0.15, Matter: 0.1, Substance: -0.1 },
    description: 'Emphasis on fresh, local, seasonal ingredients with minimal processing',
  },
  fermentation_tradition: {
    name: 'Fermentation Tradition',
    elementalModifiers: { Earth: 0.2, Water: 0.1, Air: -0.1, Fire: -0.1 },
    alchemicalModifiers: { Spirit: 0.2, Essence: 0.1, Matter: 0.15, Substance: 0.1 },
    description: 'Ancient preservation techniques creating complex, transformative flavors',
  },
  spice_trading_legacy: {
    name: 'Spice Trading Legacy',
    elementalModifiers: { Fire: 0.2, Air: 0.15, Earth: -0.05, Water: -0.05 },
    alchemicalModifiers: { Spirit: 0.25, Essence: 0.15, Matter: -0.1, Substance: 0.1 },
    description: 'Rich history of global spice trade creating bold, aromatic profiles',
  },
  imperial_court_cuisine: {
    name: 'Imperial Court Cuisine',
    elementalModifiers: { Fire: 0.1, Water: 0.05, Earth: 0.1, Air: 0.05 },
    alchemicalModifiers: { Spirit: 0.15, Essence: 0.2, Matter: 0.1, Substance: 0.05 },
    description: 'Refined, elaborate preparations from royal culinary traditions',
  },
  nomadic_heritage: {
    name: 'Nomadic Heritage',
    elementalModifiers: { Fire: 0.15, Earth: 0.1, Air: 0.1, Water: -0.1 },
    alchemicalModifiers: { Spirit: 0.1, Essence: -0.05, Matter: 0.2, Substance: 0.15 },
    description: 'Portable, durable foods adapted for travel and preservation',
  },
  monastic_cooking: {
    name: 'Monastic Cooking',
    elementalModifiers: { Earth: 0.15, Water: 0.1, Fire: -0.05, Air: 0.05 },
    alchemicalModifiers: { Spirit: 0.05, Essence: 0.1, Matter: 0.2, Substance: 0.15 },
    description: 'Simple, mindful preparations with emphasis on nourishment and balance',
  }
} as const;

// ========== CULTURAL EXCHANGE PATTERNS ==========

/**
 * Historical culinary exchange patterns
 */
export const CULTURAL_EXCHANGES = {
  silk_road: {
    name: 'Silk Road Exchange',
    influences: ['Persian', 'Indian', 'Chinese', 'Central Asian'],
    elementalImpact: { Fire: 0.1, Air: 0.15, Earth: 0.05, Water: 0.0 },
    description: 'Ancient trade routes blending spices, techniques, and ingredients across continents',
  },
  colonial_expansion: {
    name: 'Colonial Expansion',
    influences: ['European', 'American', 'Asian', 'African'],
    elementalImpact: { Fire: 0.15, Earth: 0.1, Water: 0.05, Air: 0.0 },
    description: 'Global exploration and colonization creating fusion cuisines worldwide'
},
  mediterranean_trade: {
    name: 'Mediterranean Trade',
    influences: ['Greek', 'Roman', 'Arabic', 'Ottoman'],
    elementalImpact: { Water: 0.1, Air: 0.1, Fire: 0.05, Earth: 0.05 },
    description: 'Ancient maritime trade creating rich culinary traditions around the Mediterranean'
},
  steppe_nomad_routes: {
    name: 'Steppe Nomad Routes',
    influences: ['Mongolian', 'Turkish', 'Central Asian', 'Eastern European'],
    elementalImpact: { Earth: 0.15, Fire: 0.1, Air: 0.05, Water: -0.05 },
    description: 'Nomadic traditions of preserved meats and dairy across the Eurasian steppes'
}
} as const;

// ========== INFLUENCE CALCULATION FUNCTIONS ==========

/**
 * Apply geographic and climate influences to elemental properties
 *
 * @param baseElementals - Base elemental properties
 * @param region - Geographic region
 * @param climate - Climate type
 * @returns Modified elemental properties
 */
export function applyGeographicInfluences(
  baseElementals: ElementalProperties,
  region?: string,
  climate?: string
): ElementalProperties {
  let modified = { ...baseElementals };

  // Apply region modifiers
  if (region && GEOGRAPHIC_REGIONS[region as keyof typeof GEOGRAPHIC_REGIONS]) {
    const regionData = GEOGRAPHIC_REGIONS[region as keyof typeof GEOGRAPHIC_REGIONS];
    modified = applyElementalModifiers(modified, regionData.elementalModifiers);
  }

  // Apply climate modifiers
  if (climate && CLIMATE_MODIFIERS[climate]) {
    modified = applyElementalModifiers(modified, CLIMATE_MODIFIERS[climate]);
  }

  return normalizeElementalProperties(modified);
}

/**
 * Apply cultural philosophy influences
 *
 * @param elementals - Elemental properties
 * @param alchemical - Alchemical properties (optional)
 * @param philosophies - Array of culinary philosophies
 * @returns Modified properties
 */
export function applyPhilosophyInfluences(
  elementals: ElementalProperties,
  alchemical: AlchemicalProperties | undefined,
  philosophies: string[]
): { elementals: ElementalProperties; alchemical: AlchemicalProperties | undefined } {
  let modifiedElementals = { ...elementals };
  let modifiedAlchemical = alchemical ? { ...alchemical } : undefined;

  philosophies.forEach(philosophy => {
    const philosophyData = CULINARY_PHILOSOPHIES[philosophy as keyof typeof CULINARY_PHILOSOPHIES];
    if (!philosophyData) return;

    // Apply elemental modifiers
    modifiedElementals = applyElementalModifiers(modifiedElementals, philosophyData.elementalModifiers);

    // Apply alchemical modifiers if available
    if (modifiedAlchemical && philosophyData.alchemicalModifiers) {
      modifiedAlchemical = applyAlchemicalModifiers(modifiedAlchemical, philosophyData.alchemicalModifiers);
    }
  });

  return {
    elementals: normalizeElementalProperties(modifiedElementals),
    alchemical: modifiedAlchemical
  };
}

/**
 * Apply cultural exchange influences
 *
 * @param elementals - Elemental properties
 * @param exchanges - Array of cultural exchanges
 * @returns Modified elemental properties
 */
export function applyExchangeInfluences(
  elementals: ElementalProperties,
  exchanges: string[]
): ElementalProperties {
  let modified = { ...elementals };

  exchanges.forEach(exchange => {
    const exchangeData = CULTURAL_EXCHANGES[exchange as keyof typeof CULTURAL_EXCHANGES];
    if (!exchangeData) return;

    modified = applyElementalModifiers(modified, exchangeData.elementalImpact);
  });

  return normalizeElementalProperties(modified);
}

/**
 * Apply elemental property modifiers
 *
 * @param base - Base elemental properties
 * @param modifiers - Property modifiers to apply
 * @returns Modified properties
 */
function applyElementalModifiers(
  base: ElementalProperties,
  modifiers: Partial<ElementalProperties>
): ElementalProperties {
  return {
    Fire: base.Fire + (modifiers.Fire || 0),
    Water: base.Water + (modifiers.Water || 0),
    Earth: base.Earth + (modifiers.Earth || 0),
    Air: base.Air + (modifiers.Air || 0)
  };
}

/**
 * Apply alchemical property modifiers
 *
 * @param base - Base alchemical properties
 * @param modifiers - Property modifiers to apply
 * @returns Modified properties
 */
function applyAlchemicalModifiers(
  base: AlchemicalProperties,
  modifiers: Partial<AlchemicalProperties>
): AlchemicalProperties {
  return {
    Spirit: base.Spirit + (modifiers.Spirit || 0),
    Essence: base.Essence + (modifiers.Essence || 0),
    Matter: base.Matter + (modifiers.Matter || 0),
    Substance: base.Substance + (modifiers.Substance || 0)
  };
}

/**
 * Normalize elemental properties to ensure they sum to 1.0
 *
 * @param properties - Elemental properties to normalize
 * @returns Normalized properties
 */
function normalizeElementalProperties(properties: ElementalProperties): ElementalProperties {
  const values = Object.values(properties);
  const sum = values.reduce((total, value) => total + value, 0);

  if (Math.abs(sum - 1.0) < 0.001) {
    return properties; // Already normalized
  }

  const normalized: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
};

  // Scale to sum to 1.0
  if (sum > 0) {
    (Object.keys(properties) as (keyof ElementalProperties)[]).forEach(key => {
      normalized[key] = properties[key] / sum;
    });
  } else {
    // Fallback to equal distribution
    (Object.keys(normalized) as (keyof ElementalProperties)[]).forEach(key => {
      normalized[key] = 0.25;
    });
  }

  return normalized;
}

// ========== CULTURAL SIGNIFICANCE ANALYSIS ==========

/**
 * Generate cultural significance description
 *
 * @param influence - Cultural influence data
 * @returns Human-readable description
 */
export function generateCulturalDescription(influence: CulturalInfluence): string {
  const parts: string[] = [];

  if (influence.region) {
    const regionData = GEOGRAPHIC_REGIONS[influence.region as keyof typeof GEOGRAPHIC_REGIONS];
    if (regionData) {
      parts.push(regionData.description);
    }
  }

  if (influence.climate) {
    const climateDescriptions: Record<string, string> = {
      tropical: 'warm, humid conditions favoring fresh, vibrant ingredients',
      temperate: 'moderate climate enabling diverse seasonal cooking',
      arctic: 'harsh, cold environment emphasizing preservation and hearty foods',
      desert: 'dry conditions with emphasis on water conservation and spice',
      mediterranean: 'sunny coastal region with olive oil and fresh seafood traditions'
};
    const climateDesc = climateDescriptions[influence.climate];
    if (climateDesc) {
      parts.push(climateDesc);
    }
  }

  if (influence.culturalExchanges && influence.culturalExchanges.length > 0) {
    const exchangeNames = influence.culturalExchanges.map(exchange => {
      const exchangeData = CULTURAL_EXCHANGES[exchange as keyof typeof CULTURAL_EXCHANGES];
      return exchangeData ? exchangeData.name : exchange;
    });
    parts.push(`influenced by ${exchangeNames.join(', ')}`);
  }

  if (influence.philosophies && influence.philosophies.length > 0) {
    const philosophyNames = influence.philosophies.map(philosophy => {
      const philosophyData = CULINARY_PHILOSOPHIES[philosophy as keyof typeof CULINARY_PHILOSOPHIES];
      return philosophyData ? philosophyData.name : philosophy;
    });
    parts.push(`following ${philosophyNames.join(', ')} traditions`);
  }

  return parts.length > 0 ? parts.join('. ') : 'Traditional culinary influences';
}

// ========== MAIN CULTURAL INFLUENCE APPLICATION ==========

/**
 * Apply comprehensive cultural influences to cuisine properties
 *
 * This is the main entry point for cultural influence integration.
 * Applies geographic, philosophical, and historical factors to cuisine properties.
 *
 * @param cuisineProperties - Base cuisine computed properties
 * @param culturalInfluence - Cultural influence data
 * @returns Enhanced cuisine properties with cultural influences applied
 */
export function applyCulturalInfluences(
  cuisineProperties: CuisineComputedProperties,
  culturalInfluence: CulturalInfluence
): CuisineComputedProperties {
  let enhancedProperties = { ...cuisineProperties };

  // Apply geographic and climate influences to elementals
  const geoInfluencedElementals = applyGeographicInfluences(
    cuisineProperties.averageElementals,
    culturalInfluence.region,
    culturalInfluence.climate
  );

  // Apply cultural exchange influences
  const exchangeInfluencedElementals = culturalInfluence.culturalExchanges ?
    applyExchangeInfluences(geoInfluencedElementals, culturalInfluence.culturalExchanges) :
    geoInfluencedElementals;

  // Apply philosophical influences
  const philosophyResult = applyPhilosophyInfluences(
    exchangeInfluencedElementals,
    cuisineProperties.averageAlchemical,
    culturalInfluence.philosophies || []
  );

  // Update the cuisine properties
  enhancedProperties = {
    ...enhancedProperties,
    averageElementals: philosophyResult.elementals,
    averageAlchemical: philosophyResult.alchemical
  };

  return enhancedProperties;
}

// ========== CULTURAL INFLUENCE VALIDATION ==========

/**
 * Validate cultural influence data
 *
 * @param influence - Cultural influence to validate
 * @returns Validation result
 */
export function validateCulturalInfluence(influence: CulturalInfluence): {
  isValid: boolean,
  errors: string[],
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate region
  if (influence.region && !GEOGRAPHIC_REGIONS[influence.region as keyof typeof GEOGRAPHIC_REGIONS]) {
    errors.push(`Unknown geographic region: ${influence.region}`);
  }

  // Validate climate
  if (influence.climate && !CLIMATE_MODIFIERS[influence.climate]) {
    errors.push(`Unknown climate type: ${influence.climate}`);
  }

  // Validate cultural exchanges
  if (influence.culturalExchanges) {
    influence.culturalExchanges.forEach(exchange => {
      if (!CULTURAL_EXCHANGES[exchange as keyof typeof CULTURAL_EXCHANGES]) {
        warnings.push(`Unknown cultural exchange: ${exchange}`);
      }
    });
  }

  // Validate philosophies
  if (influence.philosophies) {
    influence.philosophies.forEach(philosophy => {
      if (!CULINARY_PHILOSOPHIES[philosophy as keyof typeof CULINARY_PHILOSOPHIES]) {
        warnings.push(`Unknown culinary philosophy: ${philosophy}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get available geographic regions
 *
 * @returns Array of available region identifiers
 */
export function getAvailableRegions(): string[] {
  return Object.keys(GEOGRAPHIC_REGIONS);
}

/**
 * Get available climate types
 *
 * @returns Array of available climate types
 */
export function getAvailableClimates(): string[] {
  return Object.keys(CLIMATE_MODIFIERS);
}

/**
 * Get available culinary philosophies
 *
 * @returns Array of available philosophy identifiers
 */
export function getAvailablePhilosophies(): string[] {
  return Object.keys(CULINARY_PHILOSOPHIES);
}

/**
 * Get available cultural exchanges
 *
 * @returns Array of available exchange identifiers
 */
export function getAvailableExchanges(): string[] {
  return Object.keys(CULTURAL_EXCHANGES);
}

// ========== EXPORTS ==========

export type {
    CulturalInfluence
};
