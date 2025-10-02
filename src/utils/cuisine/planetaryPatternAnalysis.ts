/**
 * Planetary Pattern Analysis Engine
 *
 * Analyzes planetary position patterns across recipe collections to identify
 * dominant astrological influences in cuisines.
 *
 * Key Features:
 * - Planetary position aggregation across recipes
 * - Dominant element analysis by planet
 * - Pattern frequency analysis
 * - Cultural significance mapping
 * - Seasonal planetary correlations
 */

import type {
    PlanetaryPattern,
    RecipeComputedProperties
} from '@/types/hierarchy';

// ========== PLANETARY CONSTANTS ==========

/**
 * Standard planets used in astrological analysis
 */
export const PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
] as const;

/**
 * Zodiac signs for planetary placement analysis
 */
export const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
] as const;

/**
 * Elemental associations for zodiac signs
 */
export const SIGN_ELEMENT_MAP: Record<string, 'Fire' | 'Water' | 'Earth' | 'Air'> = {
  aries: 'Fire', taurus: 'Earth', gemini: 'Air', cancer: 'Water',
  leo: 'Fire', virgo: 'Earth', libra: 'Air', scorpio: 'Water',
  sagittarius: 'Fire', capricorn: 'Earth', aquarius: 'Air', pisces: 'Water'
};

// ========== PATTERN ANALYSIS DATA STRUCTURES ==========

/**
 * Planetary position frequency data
 */
interface PlanetaryFrequency {
  planet: string,
  signFrequencies: Record<string, number>;
  totalRecipes: number,
  dominantSign: string,
  dominantFrequency: number;
}

/**
 * Element distribution for a planet across recipes
 */
interface ElementalDistribution {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
  totalCount: number;
}

// ========== FREQUENCY ANALYSIS ==========

/**
 * Count planetary positions across all recipes
 *
 * @param recipes - Array of recipe computed properties
 * @returns Frequency data for each planet
 */
export function countPlanetaryPositions(recipes: RecipeComputedProperties[]): PlanetaryFrequency[] {
  const planetData: Record<string, Record<string, number>> = {};

  // Initialize planet data
  PLANETS.forEach(planet => {
    planetData[planet] = {},
    ZODIAC_SIGNS.forEach(sign => {
      planetData[planet][sign] = 0,
    });
  });

  // Count positions across all recipes
  recipes.forEach(recipe => {
    const positions = recipe.computationMetadata.planetaryPositionsUsed,

    PLANETS.forEach(planet => {
      const sign = positions[planet],
      if (sign && planetData[planet][sign] !== undefined) {
        planetData[planet][sign]++;
      }
    });
  });

  // Convert to PlanetaryFrequency array
  return PLANETS.map(planet => {
    const signFrequencies = planetData[planet];
    const totalRecipes = recipes.length;

    // Find dominant sign
    let dominantSign = '';
    let dominantFrequency = 0,

    Object.entries(signFrequencies).forEach(([sign, frequency]) => {
      if (frequency > dominantFrequency) {
        dominantSign = sign;
        dominantFrequency = frequency;
      }
    });

    return {
      planet,
      signFrequencies,
      totalRecipes,
      dominantSign,
      dominantFrequency
    };
  });
}

/**
 * Calculate elemental distribution for a planet
 *
 * @param planetFrequency - Planetary frequency data
 * @returns Elemental distribution
 */
export function calculateElementalDistribution(planetFrequency: PlanetaryFrequency): ElementalDistribution {
  const distribution: ElementalDistribution = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    totalCount: 0
};

  Object.entries(planetFrequency.signFrequencies).forEach(([sign, frequency]) => {
    const element = SIGN_ELEMENT_MAP[sign];
    if (element && distribution[element] !== undefined) {
      distribution[element] += frequency;
      distribution.totalCount += frequency;
    }
  });

  return distribution;
}

/**
 * Calculate planetary strength score
 *
 * @param planetFrequency - Planetary frequency data
 * @returns Strength score (0-1)
 */
export function calculatePlanetaryStrength(planetFrequency: PlanetaryFrequency): number {
  if (planetFrequency.totalRecipes === 0) return 0;

  const dominantPercentage = planetFrequency.dominantFrequency / planetFrequency.totalRecipes;

  // Strength based on dominance (higher = more consistent placement)
  // Also consider total frequency (must appear in multiple recipes)
  const dominanceScore = Math.min(dominantPercentage * 2, 1); // Max at 50% dominance
  const frequencyScore = Math.min(planetFrequency.dominantFrequency / 5, 1); // Need at least 5 recipes

  return (dominanceScore + frequencyScore) / 2;
}

// ========== CULTURAL SIGNIFICANCE MAPPING ==========

/**
 * Get cultural significance for planetary patterns
 *
 * @param planet - Planet name
 * @param dominantSign - Most common zodiac sign
 * @param strength - Pattern strength score
 * @returns Cultural notes and significance
 */
export function getCulturalSignificance(
  planet: string,
  dominantSign: string,
  strength: number
): string | undefined {
  const significanceMap: Record<string, Record<string, string>> = {
    Sun: {
      leo: 'Bold, dramatic flavors with emphasis on presentation and pride in cooking traditions',
      sagittarius: 'Adventurous spice combinations and international fusion influences',
      aries: 'Bold, direct flavors with emphasis on fresh, immediate ingredients',
    },
    Moon: {
      cancer: 'Comforting, nurturing dishes with emphasis on family and emotional connection to food',
      taurus: 'Sensual, luxurious ingredients with focus on texture and mouthfeel',
      pisces: 'Dreamy, ethereal presentations with delicate, subtle flavor combinations',
    },
    Mercury: {
      gemini: 'Versatile, adaptable cooking techniques with emphasis on communication through food',
      virgo: 'Precise, methodical preparation with attention to ingredient quality and health benefits',
      libra: 'Harmonious flavor balancing with emphasis on aesthetic presentation'
},
    Venus: {
      libra: 'Beautifully balanced dishes with emphasis on elegance and social dining',
      taurus: 'Luxurious, indulgent ingredients with focus on sensual pleasure',
      pisces: 'Romantic, poetic presentations with delicate, artistic touches',
    },
    Mars: {
      aries: 'Bold, aggressive flavors with emphasis on heat and intensity',
      scorpio: 'Deep, intense, transformative cooking processes',
      capricorn: 'Structured, disciplined approaches to complex culinary techniques',
    },
    Jupiter: {
      sagittarius: 'Expansive, generous portions with international and exotic influences',
      pisces: 'Spiritual, transcendent dining experiences',
      cancer: 'Nurturing, abundant family-style servings',
    },
    Saturn: {
      capricorn: 'Traditional, structured recipes with emphasis on technique and discipline',
      aquarius: 'Innovative, unconventional approaches with intellectual depth',
      libra: 'Balanced, fair presentations with social consciousness',
    }
  };

  const planetSignificance = significanceMap[planet]?.[dominantSign];
  if (!planetSignificance) return undefined;

  // Adjust significance based on strength
  if (strength > 0.8) {
    return `${planetSignificance} (very strong pattern)`;
  } else if (strength > 0.6) {
    return `${planetSignificance} (strong pattern)`;
  } else if (strength > 0.4) {
    return `${planetSignificance} (moderate pattern)`;
  }

  return undefined;
}

// ========== MAIN PATTERN ANALYSIS FUNCTION ==========

/**
 * Analyze planetary patterns across a recipe collection
 *
 * This is the main entry point for planetary pattern analysis.
 * Identifies dominant planetary placements and their cultural significance.
 *
 * @param recipes - Array of recipe computed properties
 * @param options - Analysis options
 * @returns Array of planetary patterns for the cuisine
 */
export function analyzePlanetaryPatterns(recipes: RecipeComputedProperties[],
  options: {
    minStrength?: number, // Minimum strength threshold (0-1)
    includeCulturalNotes?: boolean;
  } = {}
): PlanetaryPattern[] {
  const { minStrength = 0.3, includeCulturalNotes = true } = options;

  if (recipes.length === 0) {
    return [];
  }

  // Count planetary positions
  const planetFrequencies = countPlanetaryPositions(recipes);

  // Convert to PlanetaryPattern array
  const patterns: PlanetaryPattern[] = [],

  planetFrequencies.forEach(planetFreq => {
    const strength = calculatePlanetaryStrength(planetFreq);

    // Skip weak patterns
    if (strength < minStrength) {
      return;
    }

    // Calculate elemental distribution
    const elementalDist = calculateElementalDistribution(planetFreq);

    // Find dominant element
    let dominantElement: 'Fire' | 'Water' | 'Earth' | 'Air' = 'Fire',
    let maxCount = 0;

    (['Fire', 'Water', 'Earth', 'Air'] as const).forEach(element => {
      if (elementalDist[element] > maxCount) {
        dominantElement = element;
        maxCount = elementalDist[element];
      }
    });

    // Build common signs array (sorted by frequency)
    const commonSigns = Object.entries(planetFreq.signFrequencies)
      .filter(([, frequency]) => frequency > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Top 3 most common
      .map(([sign, frequency]) => ({
        sign,
        frequency: frequency / planetFreq.totalRecipes, // Convert to proportion
        dominantElement: SIGN_ELEMENT_MAP[sign]
      }));

    // Build pattern object
    const pattern: PlanetaryPattern = {
      planet: planetFreq.planet,
      commonSigns,
      planetaryStrength: strength,
      dominantElement
    };

    patterns.push(pattern);
  });

  // Sort by planetary strength (strongest first)
  return patterns.sort((a, b) => b.planetaryStrength - a.planetaryStrength);
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get planetary pattern summary statistics
 *
 * @param patterns - Array of planetary patterns
 * @returns Summary statistics
 */
export function getPlanetaryPatternSummary(patterns: PlanetaryPattern[]): {
  totalPatterns: number,
  averageStrength: number,
  dominantElements: Record<string, number>;
  planetDistribution: Record<string, number>;
} {
  const dominantElements: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 },
  const planetDistribution: Record<string, number> = {};

  let totalStrength = 0;

  patterns.forEach(pattern => {
    totalStrength += pattern.planetaryStrength,
    dominantElements[pattern.dominantElement]++,
    planetDistribution[pattern.planet] = pattern.planetaryStrength,
  });

  return {
    totalPatterns: patterns.length,
    averageStrength: patterns.length > 0 ? totalStrength / patterns.length : 0,
    dominantElements,
    planetDistribution
  };
}

/**
 * Find recipes with specific planetary patterns
 *
 * @param recipes - Array of recipes to search
 * @param planet - Planet to match
 * @param sign - Zodiac sign to match
 * @returns Array of matching recipes
 */
export function findRecipesWithPlanetaryPattern(
  recipes: RecipeComputedProperties[],
  planet: string,
  sign: string
): RecipeComputedProperties[] {
  return recipes.filter(recipe => {
    const positions = recipe.computationMetadata.planetaryPositionsUsed;
    return positions[planet] === sign;
  });
}

/**
 * Calculate planetary diversity score
 *
 * @param patterns - Array of planetary patterns
 * @returns Diversity score (0-1, higher = more diverse planetary influences)
 */
export function calculatePlanetaryDiversity(patterns: PlanetaryPattern[]): number {
  if (patterns.length === 0) return 0;

  // Count unique planets with strong patterns
  const strongPatterns = patterns.filter(p => p.planetaryStrength > 0.5);
  const uniquePlanets = new Set(strongPatterns.map(p => p.planet));

  // Count unique elements
  const uniqueElements = new Set(strongPatterns.map(p => p.dominantElement));

  // Calculate diversity as combination of planet and element variety
  const planetDiversity = Math.min(uniquePlanets.size / 5, 1); // Max at 5 planets
  const elementDiversity = Math.min(uniqueElements.size / 4, 1); // Max at 4 elements

  return (planetDiversity + elementDiversity) / 2;
}

// ========== VALIDATION ==========

/**
 * Validate planetary pattern analysis inputs
 *
 * @param recipes - Recipe array to validate
 * @returns Validation result
 */
export function validatePlanetaryAnalysisInputs(recipes: RecipeComputedProperties[]): {
  isValid: boolean,
  errors: string[],
  warnings: string[];
} {
  const errors: string[] = [],
  const warnings: string[] = [],

  if (!Array.isArray(recipes)) {
    errors.push('Recipes must be an array');
    return { isValid: false, errors, warnings };
  }

  if (recipes.length === 0) {
    warnings.push('No recipes provided for analysis');
    return { isValid: true, errors, warnings };
  }

  // Check for planetary position data
  let recipesWithPositions = 0;
  recipes.forEach((recipe, index) => {
    const positions = recipe.computationMetadata?.planetaryPositionsUsed;
    if (!positions) {
      errors.push(`Recipe ${index} missing planetary position data`);
    } else {
      recipesWithPositions++;
      // Validate position format
      PLANETS.forEach(planet => {
        const sign = positions[planet],
        if (sign && !ZODIAC_SIGNS.includes(sign as any)) {
          errors.push(`Recipe ${index}: Invalid zodiac sign '${sign}' for ${planet}`);
        }
      });
    }
  });

  if (recipesWithPositions < recipes.length * 0.8) {
    warnings.push('Less than 80% of recipes have planetary position data - results may be unreliable');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ========== EXPORTS ==========

export type {
    ElementalDistribution, PlanetaryFrequency
};
