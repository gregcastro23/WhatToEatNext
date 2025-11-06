/**
 * Cuisine Property Aggregation System
 *
 * This module implements statistical aggregation and signature identification
 * for cuisine-level properties. It analyzes recipe collections to identify:
 * - Cultural signatures (z-score > 1.5 outliers)
 * - Statistical variance and diversity metrics
 * - Common planetary patterns
 * - Elemental and alchemical ranges
 *
 * Part of the three-tier hierarchical system: Ingredients → Recipes → Cuisines
 */

import type { ElementalProperties } from '@/types/alchemy';
import type {
  CuisineSignature,
  CuisineComputedProperties,
  PropertyVariance,
  PlanetaryPattern,
  RecipeComputedProperties
} from '@/types/hierarchy';
import type { AlchemicalProperties, ThermodynamicMetrics } from './monicaKalchmCalculations';

// ========== GLOBAL AVERAGES (for z-score calculation) ==========

/**
 * Global average properties across all cuisines
 * These should be computed from your entire cuisine database
 * Values below are placeholders - update with actual global statistics
 */
export interface GlobalPropertyAverages {
  elementals: ElementalProperties;
  alchemical?: AlchemicalProperties;
  thermodynamics?: Partial<ThermodynamicMetrics>;

  // Standard deviations for z-score calculation
  elementalsStdDev: ElementalProperties;
  alchemicalStdDev?: AlchemicalProperties;
  thermodynamicsStdDev?: Partial<ThermodynamicMetrics>;
}

/**
 * Default global averages (placeholder - compute from real data)
 */
export const DEFAULT_GLOBAL_AVERAGES: GlobalPropertyAverages = {
  elementals: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  },
  alchemical: {
    Spirit: 3.5,
    Essence: 4.2,
    Matter: 4.0,
    Substance: 2.8
},
  thermodynamics: {
    heat: 0.08,
    entropy: 0.15,
    reactivity: 0.45,
    gregsEnergy: -0.02,
    kalchm: 2.5,
    monica: 1.0
},
  elementalsStdDev: {
    Fire: 0.15,
    Water: 0.15,
    Earth: 0.15,
    Air: 0.15
},
  alchemicalStdDev: {
    Spirit: 1.2,
    Essence: 1.5,
    Matter: 1.3,
    Substance: 1.0
},
  thermodynamicsStdDev: {
    heat: 0.03,
    entropy: 0.08,
    reactivity: 0.2,
    gregsEnergy: 0.05,
    kalchm: 1.5,
    monica: 0.5
}
};

// ========== RECIPE WEIGHTING ==========

/**
 * Recipe weighting strategy for cuisine aggregation
 */
export type WeightingStrategy = 'equal' | 'popularity' | 'representativeness';
/**
 * Calculate recipe weight based on strategy
 *
 * @param recipe - Recipe with computed properties
 * @param strategy - Weighting strategy to use
 * @param allRecipes - All recipes in cuisine (for representativeness calculation)
 * @returns Weight value (higher = more influence)
 */
export function calculateRecipeWeight(
  recipe: any, // Would be Recipe type with metadata
  strategy: WeightingStrategy,
  allRecipes: any[] = []
): number {
  switch (strategy) {
    case 'equal': return 1.0;

    case 'popularity':
      // Weight by view count and rating (if available)
      const viewCount = recipe.viewCount || 1;
      const rating = recipe.rating || 3;
      return Math.sqrt(viewCount) * (rating / 5.0);

    case 'representativeness':
      // Weight by how typical the recipe is for the cuisine
      // Calculate similarity to cuisine average
      const similarities: number[] = [];

      for (const other of allRecipes) {
        if (other.id === recipe.id) continue;

        // Simple elemental similarity (can be enhanced)
        const recipeProps = recipe._computed?.elementalProperties;
        const otherProps = other._computed?.elementalProperties;

        if (recipeProps && otherProps) {
          const similarity = calculateElementalSimilarity(recipeProps, otherProps);
          similarities.push(similarity);
        }
      }

      // Average similarity to other recipes = representativeness
      const avgSimilarity = similarities.length > 0
        ? similarities.reduce((a, b) => a + b, 0) / similarities.length
        : 0.5;

      return avgSimilarity;

    default:
      return 1.0;
  }
}

/**
 * Calculate similarity between two elemental property sets
 *
 * @param props1 - First elemental properties
 * @param props2 - Second elemental properties
 * @returns Similarity score (0-1, higher = more similar)
 */
function calculateElementalSimilarity(
  props1: ElementalProperties,
  props2: ElementalProperties
): number {
  // Cosine similarity
  const dotProduct = props1.Fire * props2.Fire +
    props1.Water * props2.Water +
    props1.Earth * props2.Earth +
    props1.Air * props2.Air;

  const magnitude1 = Math.sqrt(
    props1.Fire ** 2 + props1.Water ** 2 + props1.Earth ** 2 + props1.Air ** 2
  );
  const magnitude2 = Math.sqrt(
    props2.Fire ** 2 + props2.Water ** 2 + props2.Earth ** 2 + props2.Air ** 2
  );

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

// ========== PROPERTY AGGREGATION ==========

/**
 * Aggregate elemental properties from recipes with weighting
 *
 * @param recipes - Array of recipes with computed properties
 * @param strategy - Weighting strategy
 * @returns Weighted average elemental properties
 */
export function aggregateElementalProperties(recipes: Array<{ _computed?: RecipeComputedProperties, [key: string]: any }>,
  strategy: WeightingStrategy = 'equal'
): ElementalProperties {
  if (!recipes || recipes.length === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let totalWeight = 0;

  for (const recipe of recipes) {
    if (!recipe._computed?.elementalProperties) continue;

    const weight = calculateRecipeWeight(recipe, strategy, recipes);
    const props = recipe._computed.elementalProperties;

    totals.Fire += props.Fire * weight;
    totals.Water += props.Water * weight;
    totals.Earth += props.Earth * weight;
    totals.Air += props.Air * weight;

    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: totals.Fire / totalWeight,
    Water: totals.Water / totalWeight,
    Earth: totals.Earth / totalWeight,
    Air: totals.Air / totalWeight
  };
}

/**
 * Aggregate alchemical properties from recipes
 *
 * @param recipes - Recipes with computed properties
 * @param strategy - Weighting strategy
 * @returns Weighted average alchemical properties
 */
export function aggregateAlchemicalProperties(recipes: Array<{ _computed?: RecipeComputedProperties, [key: string]: any }>,
  strategy: WeightingStrategy = 'equal'
): AlchemicalProperties | undefined {
  const validRecipes = recipes.filter(r => r._computed?.alchemicalProperties);
  if (validRecipes.length === 0) return undefined;

  const totals = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  let totalWeight = 0;

  for (const recipe of validRecipes) {
    const weight = calculateRecipeWeight(recipe, strategy, recipes);
    const props = recipe._computed!.alchemicalProperties;

    totals.Spirit += props.Spirit * weight;
    totals.Essence += props.Essence * weight;
    totals.Matter += props.Matter * weight;
    totals.Substance += props.Substance * weight;

    totalWeight += weight;
  }

  if (totalWeight === 0) return undefined;

  return {
    Spirit: totals.Spirit / totalWeight,
    Essence: totals.Essence / totalWeight,
    Matter: totals.Matter / totalWeight,
    Substance: totals.Substance / totalWeight
  };
}

// ========== VARIANCE CALCULATION ==========

/**
 * Calculate property variance (standard deviation) across recipes
 *
 * @param recipes - Recipes with computed properties
 * @param averages - Average properties (for variance calculation)
 * @returns Property variance metrics
 */
export function calculatePropertyVariance(recipes: Array<{ _computed?: RecipeComputedProperties, [key: string]: any }>,
  averages: {
    elementals: ElementalProperties,
    alchemical?: AlchemicalProperties
  }
): PropertyVariance {
  if (!recipes || recipes.length === 0) {
    return {
      elementals: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      diversityScore: 0
    };
  }

  // Calculate elemental variance
  const elementalVariances = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let validCount = 0;

  for (const recipe of recipes) {
    if (!recipe._computed?.elementalProperties) continue;

    const props = recipe._computed.elementalProperties;
    elementalVariances.Fire += (props.Fire - averages.elementals.Fire) ** 2;
    elementalVariances.Water += (props.Water - averages.elementals.Water) ** 2;
    elementalVariances.Earth += (props.Earth - averages.elementals.Earth) ** 2;
    elementalVariances.Air += (props.Air - averages.elementals.Air) ** 2;

    validCount++;
  }

  if (validCount === 0) {
    return {
      elementals: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      diversityScore: 0
    };
  }

  // Standard deviation (sqrt of variance)
  const elementalsStdDev: ElementalProperties = {
    Fire: Math.sqrt(elementalVariances.Fire / validCount),
    Water: Math.sqrt(elementalVariances.Water / validCount),
    Earth: Math.sqrt(elementalVariances.Earth / validCount),
    Air: Math.sqrt(elementalVariances.Air / validCount)
  };

  // Diversity score: average of all standard deviations (0-1 scale)
  const diversityScore = (elementalsStdDev.Fire +
      elementalsStdDev.Water +
      elementalsStdDev.Earth +
      elementalsStdDev.Air) /
    4;

  return {
    elementals: elementalsStdDev,
    diversityScore: Math.min(1.0, diversityScore * 3) // Scale to 0-1
  };
}

// ========== SIGNATURE IDENTIFICATION ==========

/**
 * Calculate z-score for a property
 *
 * @param value - Property value
 * @param globalMean - Global average for this property
 * @param globalStdDev - Global standard deviation
 * @returns Z-score (number of standard deviations from mean)
 */
function calculateZScore(value: number, globalMean: number, globalStdDev: number): number {
  if (globalStdDev === 0) return 0;
  return (value - globalMean) / globalStdDev;
}

/**
 * Classify signature strength from z-score
 *
 * @param zscore - Z-score value
 * @returns Strength classification
 */
function classifySignatureStrength(
  zscore: number
): 'low' | 'moderate' | 'high' | 'very_high' {
  const absZscore = Math.abs(zscore);
  if (absZscore >= 2.5) return 'very_high';
  if (absZscore >= 2.0) return 'high';
  if (absZscore >= 1.5) return 'moderate';
  return 'low';
}

/**
 * Identify cuisine signatures from property averages
 *
 * @param averages - Cuisine average properties
 * @param globalAverages - Global averages for comparison
 * @param threshold - Minimum z-score for signature (default: 1.5)
 * @returns Array of identified signatures
 */
export function identifyCuisineSignatures(averages: {
    elementals: ElementalProperties;
    alchemical?: AlchemicalProperties;
    thermodynamics?: Partial<ThermodynamicMetrics>;
  },
  globalAverages: GlobalPropertyAverages = DEFAULT_GLOBAL_AVERAGES,
  threshold: number = 1.5
): CuisineSignature[] {
  const signatures: CuisineSignature[] = [];

  // Check elemental signatures
  for (const [element, value] of Object.entries(averages.elementals) as [
    keyof ElementalProperties,
    number
  ][]) {
    const zscore = calculateZScore(
      value,
      globalAverages.elementals[element],
      globalAverages.elementalsStdDev[element]
    );

    if (Math.abs(zscore) >= threshold) {
      signatures.push({
        property: element,
        zscore,
        strength: classifySignatureStrength(zscore),
        averageValue: value,
        globalAverage: globalAverages.elementals[element],
        description: `${element} is ${zscore > 0 ? 'elevated' : 'reduced'} (${Math.abs(zscore).toFixed(1)}σ ${zscore > 0 ? 'above' : 'below'} global average)`
      });
    }
  }

  // Check alchemical signatures
  if (averages.alchemical && globalAverages.alchemical && globalAverages.alchemicalStdDev) {
    for (const [property, value] of Object.entries(averages.alchemical) as [
      keyof AlchemicalProperties,
      number
    ][]) {
      const zscore = calculateZScore(
        value,
        globalAverages.alchemical[property],
        globalAverages.alchemicalStdDev[property]
      );

      if (Math.abs(zscore) >= threshold) {
        signatures.push({
          property,
          zscore,
          strength: classifySignatureStrength(zscore),
          averageValue: value,
          globalAverage: globalAverages.alchemical[property],
          description: `${property} is ${zscore > 0 ? 'elevated' : 'reduced'} (${Math.abs(zscore).toFixed(1)}σ ${zscore > 0 ? 'above' : 'below'} global average)`
        });
      }
    }
  }

  // Sort by absolute z-score (strongest signatures first)
  signatures.sort((a, b) => Math.abs(b.zscore) - Math.abs(a.zscore));

  return signatures;
}

// ========== PLANETARY PATTERN ANALYSIS ==========

/**
 * Identify common planetary patterns in cuisine recipes
 *
 * @param recipes - Recipes with planetary position data
 * @returns Array of planetary patterns
 */
export function identifyPlanetaryPatterns(recipes: Array<{ _computed?: RecipeComputedProperties, [key: string]: any }>
): PlanetaryPattern[] {
  const planetaryCounts: Record<string, Record<string, number>> = {};

  // Count occurrences of each planet-sign combination
  for (const recipe of recipes) {
    const positions = recipe._computed?.planetaryPositionsUsed;
    if (!positions) continue;

    for (const [planet, sign] of Object.entries(positions)) {
      if (!planetaryCounts[planet]) {
        planetaryCounts[planet] = {};
      }
      planetaryCounts[planet][sign] = (planetaryCounts[planet][sign] || 0) + 1;
    }
  }

  // Convert to patterns
  const patterns: PlanetaryPattern[] = [];

  for (const [planet, signCounts] of Object.entries(planetaryCounts)) {
    const totalCount = Object.values(signCounts).reduce((a, b) => a + b, 0);

    const commonSigns = Object.entries(signCounts)
      .map(([sign, count]) => ({
        sign,
        frequency: count / totalCount
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3); // Top 3 most common signs

    // Determine dominant element for this planet
    const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const ZODIAC_ELEMENTS: Record<string, keyof ElementalProperties> = {
      Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
      Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
      Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water'
    };

    for (const [sign, count] of Object.entries(signCounts)) {
      const element = ZODIAC_ELEMENTS[sign];
      if (element) {
        elementCounts[element] += count;
      }
    }

    const dominantElement = (Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Fire') as keyof ElementalProperties;

    patterns.push({
      planet,
      commonSigns,
      dominantElement
    });
  }

  return patterns;
}

// ========== MAIN CUISINE COMPUTATION FUNCTION ==========

/**
 * Compute complete cuisine properties from recipe collection
 *
 * @param recipes - Array of recipes with computed properties
 * @param options - Computation options
 * @returns Complete cuisine computed properties
 */
export function computeCuisineProperties(recipes: Array<{ _computed?: RecipeComputedProperties, [key: string]: any }>,
  options: {
    weightingStrategy?: WeightingStrategy;
    globalAverages?: GlobalPropertyAverages;
    signatureThreshold?: number;
    includeVariance?: boolean;
    identifyPlanetaryPatterns?: boolean
  } = ) {}
): CuisineComputedProperties {
  const {
    weightingStrategy = 'equal',
    globalAverages = DEFAULT_GLOBAL_AVERAGES,
    signatureThreshold = 1.5,
    includeVariance = true,
    identifyPlanetaryPatterns: identifyPatterns = true
  } = options;

  // Aggregate properties
  const averageElementals = aggregateElementalProperties(recipes, weightingStrategy);
  const averageAlchemical = aggregateAlchemicalProperties(recipes, weightingStrategy);

  // Calculate variance if requested
  const variance = includeVariance;
    ? calculatePropertyVariance(recipes, ) {
        elementals: averageElementals,
        alchemical: averageAlchemical
      })
    : {
        elementals: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        diversityScore: 0
      };

  // Identify signatures
  const signatures = identifyCuisineSignatures() {
      elementals: averageElementals,
      alchemical: averageAlchemical
    },
    globalAverages,
    signatureThreshold
  );

  // Identify planetary patterns if requested
  const planetaryPatterns = identifyPatterns;
    ? identifyPlanetaryPatterns(recipes)
    : undefined;

  return {
    averageElementals,
    averageAlchemical,
    variance,
    signatures,
    planetaryPatterns,
    sampleSize: recipes.length,
    computedAt: new Date(),
    version: '1.0.0'
};
}
