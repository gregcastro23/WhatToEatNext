/**
 * Chart Comparison Service
 *
 * Compares user's natal chart with the current moment's chart
 * to provide personalized recommendations based on astrological harmony.
 *
 * This service:
 * 1. Calculates the moment's chart (current planetary positions + derived properties)
 * 2. Compares natal chart with moment chart
 * 3. Provides compatibility scores for personalized recommendations
 */

import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
  getDominantElement,
} from "@/utils/planetaryAlchemyMapping";
import type { NatalChart } from "@/types/natalChart";
import type { Planet, ZodiacSign, Element } from "@/types/celestial";
import type { ElementalProperties, AlchemicalProperties } from "@/types/alchemy";
import type { PlanetPosition } from "@/utils/astrologyUtils";
import { _logger } from "@/lib/logger";

/**
 * Moment Chart - Calculated for a specific date/time
 * Similar structure to NatalChart but represents a moment in time
 */
export interface MomentChart {
  dateTime: string; // ISO 8601 format
  location: {
    latitude: number;
    longitude: number;
  };
  planetaryPositions: Record<Planet, ZodiacSign>;
  dominantElement: Element;
  elementalBalance: ElementalProperties;
  alchemicalProperties: AlchemicalProperties;
  calculatedAt: string;
}

/**
 * Chart Comparison Result
 * Scores and insights from comparing natal chart with moment chart
 */
export interface ChartComparison {
  natalChart: NatalChart;
  momentChart: MomentChart;

  // Overall compatibility (0-1)
  overallHarmony: number;

  // Individual component scores (0-1)
  elementalHarmony: number;
  alchemicalAlignment: number;
  planetaryResonance: number;

  // Detailed insights
  insights: {
    favorableElements: Element[];
    challengingElements: Element[];
    harmonicPlanets: Planet[];
    recommendations: string[];
  };

  // Boosted properties for recommendations
  elementalBoosts: Partial<ElementalProperties>;
  alchemicalBoosts: Partial<AlchemicalProperties>;

  calculatedAt: string;
}

/**
 * Calculate moment chart for current time or specified date/time
 */
export async function calculateMomentChart(
  dateTime?: Date,
  location?: { latitude: number; longitude: number },
): Promise<MomentChart> {
  const targetDateTime = dateTime || new Date();
  const targetLocation = location || {
    latitude: 40.7498, // Default: New York
    longitude: -73.7976,
  };

  try {
    // Get planetary positions for the moment
    const planetaryPositionsRaw: Record<string, PlanetPosition> =
      await getPlanetaryPositionsForDateTime(targetDateTime, targetLocation);

    // Convert to Record<Planet, ZodiacSign>
    const planetaryPositions: Record<Planet, ZodiacSign> = {
      Sun: planetaryPositionsRaw.Sun?.sign as ZodiacSign,
      Moon: planetaryPositionsRaw.Moon?.sign as ZodiacSign,
      Mercury: planetaryPositionsRaw.Mercury?.sign as ZodiacSign,
      Venus: planetaryPositionsRaw.Venus?.sign as ZodiacSign,
      Mars: planetaryPositionsRaw.Mars?.sign as ZodiacSign,
      Jupiter: planetaryPositionsRaw.Jupiter?.sign as ZodiacSign,
      Saturn: planetaryPositionsRaw.Saturn?.sign as ZodiacSign,
      Uranus: planetaryPositionsRaw.Uranus?.sign as ZodiacSign,
      Neptune: planetaryPositionsRaw.Neptune?.sign as ZodiacSign,
      Pluto: planetaryPositionsRaw.Pluto?.sign as ZodiacSign,
      Ascendant: (planetaryPositionsRaw.Ascendant?.sign as ZodiacSign) || "aries",
    };

    // Calculate elemental balance from zodiac positions
    const elementalBalance = aggregateZodiacElementals(planetaryPositions);

    // Calculate alchemical properties from planets
    const alchemicalProperties = calculateAlchemicalFromPlanets(planetaryPositions);

    // Determine dominant element (cast keyof to Element type)
    const dominantElement = getDominantElement(elementalBalance) as Element;

    const momentChart: MomentChart = {
      dateTime: targetDateTime.toISOString(),
      location: targetLocation,
      planetaryPositions,
      dominantElement,
      elementalBalance,
      alchemicalProperties,
      calculatedAt: new Date().toISOString(),
    };

    _logger.info("Moment chart calculated successfully", {
      dateTime: momentChart.dateTime,
      dominantElement: momentChart.dominantElement,
    } as any);

    return momentChart;
  } catch (error) {
    _logger.error("Failed to calculate moment chart", error as any);
    throw error;
  }
}

/**
 * Calculate elemental harmony between two elemental property sets
 * Returns a score from 0 (no harmony) to 1 (perfect harmony)
 */
function calculateElementalHarmony(
  natal: ElementalProperties,
  moment: ElementalProperties,
): number {
  // Calculate similarity using cosine similarity
  let dotProduct = 0;
  let natalMagnitude = 0;
  let momentMagnitude = 0;

  const elements: Element[] = ["Fire", "Water", "Earth", "Air"];

  elements.forEach((element) => {
    dotProduct += natal[element] * moment[element];
    natalMagnitude += natal[element] * natal[element];
    momentMagnitude += moment[element] * moment[element];
  });

  const magnitude = Math.sqrt(natalMagnitude) * Math.sqrt(momentMagnitude);

  if (magnitude === 0) {
    return 0.5; // Neutral if no magnitude
  }

  // Cosine similarity ranges from -1 to 1, normalize to 0-1
  const cosineSimilarity = dotProduct / magnitude;
  return (cosineSimilarity + 1) / 2;
}

/**
 * Calculate alchemical alignment between two alchemical property sets
 * Returns a score from 0 (no alignment) to 1 (perfect alignment)
 */
function calculateAlchemicalAlignment(
  natal: AlchemicalProperties,
  moment: AlchemicalProperties,
): number {
  // Normalize values for comparison
  const natalTotal = natal.Spirit + natal.Essence + natal.Matter + natal.Substance;
  const momentTotal = moment.Spirit + moment.Essence + moment.Matter + moment.Substance;

  if (natalTotal === 0 || momentTotal === 0) {
    return 0.5; // Neutral if no values
  }

  const natalNorm = {
    Spirit: natal.Spirit / natalTotal,
    Essence: natal.Essence / natalTotal,
    Matter: natal.Matter / natalTotal,
    Substance: natal.Substance / natalTotal,
  };

  const momentNorm = {
    Spirit: moment.Spirit / momentTotal,
    Essence: moment.Essence / momentTotal,
    Matter: moment.Matter / momentTotal,
    Substance: moment.Substance / momentTotal,
  };

  // Calculate cosine similarity
  let dotProduct = 0;
  let natalMagnitude = 0;
  let momentMagnitude = 0;

  const properties: (keyof AlchemicalProperties)[] = ["Spirit", "Essence", "Matter", "Substance"];

  properties.forEach((prop) => {
    dotProduct += natalNorm[prop] * momentNorm[prop];
    natalMagnitude += natalNorm[prop] * natalNorm[prop];
    momentMagnitude += momentNorm[prop] * momentNorm[prop];
  });

  const magnitude = Math.sqrt(natalMagnitude) * Math.sqrt(momentMagnitude);

  if (magnitude === 0) {
    return 0.5;
  }

  const cosineSimilarity = dotProduct / magnitude;
  return (cosineSimilarity + 1) / 2;
}

/**
 * Calculate planetary resonance between natal and moment charts
 * Considers which planets are in harmonious signs
 */
function calculatePlanetaryResonance(
  natalPositions: Record<Planet, ZodiacSign>,
  momentPositions: Record<Planet, ZodiacSign>,
): number {
  const planets: Planet[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

  // Zodiac sign to element mapping (lowercase signs)
  const signToElement: Record<string, Element> = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
  };

  let harmonicCount = 0;
  let totalPlanets = 0;

  planets.forEach((planet) => {
    const natalSign = natalPositions[planet];
    const momentSign = momentPositions[planet];

    if (!natalSign || !momentSign) {
      return; // Skip if missing
    }

    totalPlanets++;

    const natalElement = signToElement[natalSign];
    const momentElement = signToElement[momentSign];

    // Same sign = perfect harmony
    if (natalSign === momentSign) {
      harmonicCount += 1.0;
    }
    // Same element = strong harmony
    else if (natalElement === momentElement) {
      harmonicCount += 0.8;
    }
    // Compatible elements = moderate harmony
    // Fire + Air are compatible, Earth + Water are compatible
    else if (
      (natalElement === "Fire" && momentElement === "Air") ||
      (natalElement === "Air" && momentElement === "Fire") ||
      (natalElement === "Earth" && momentElement === "Water") ||
      (natalElement === "Water" && momentElement === "Earth")
    ) {
      harmonicCount += 0.6;
    }
    // Neutral/challenging = low harmony
    else {
      harmonicCount += 0.3;
    }
  });

  return totalPlanets > 0 ? harmonicCount / totalPlanets : 0.5;
}

/**
 * Identify which planets are in harmonic positions
 */
function getHarmonicPlanets(
  natalPositions: Record<Planet, ZodiacSign>,
  momentPositions: Record<Planet, ZodiacSign>,
): Planet[] {
  const planets: Planet[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  const harmonicPlanets: Planet[] = [];

  const signToElement: Record<string, Element> = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
  };

  planets.forEach((planet) => {
    const natalSign = natalPositions[planet];
    const momentSign = momentPositions[planet];

    if (!natalSign || !momentSign) {
      return;
    }

    const natalElement = signToElement[natalSign];
    const momentElement = signToElement[momentSign];

    // Same sign or same element = harmonic
    if (natalSign === momentSign || natalElement === momentElement) {
      harmonicPlanets.push(planet);
    }
  });

  return harmonicPlanets;
}

/**
 * Compare user's natal chart with moment chart
 */
export async function compareCharts(
  natalChart: NatalChart,
  momentChart?: MomentChart,
): Promise<ChartComparison> {
  // Calculate moment chart if not provided
  const moment = momentChart || await calculateMomentChart();

  // Calculate individual harmony scores (cast to align ElementalProperties types)
  const elementalHarmony = calculateElementalHarmony(
    natalChart.elementalBalance as ElementalProperties,
    moment.elementalBalance as ElementalProperties,
  );

  const alchemicalAlignment = calculateAlchemicalAlignment(
    natalChart.alchemicalProperties,
    moment.alchemicalProperties,
  );

  const planetaryResonance = calculatePlanetaryResonance(
    natalChart.planetaryPositions,
    moment.planetaryPositions,
  );

  // Calculate overall harmony (weighted average)
  const overallHarmony =
    elementalHarmony * 0.4 +
    alchemicalAlignment * 0.3 +
    planetaryResonance * 0.3;

  // Identify favorable and challenging elements
  const elementalDifferences: Record<Element, number> = {
    Fire: Math.abs(natalChart.elementalBalance.Fire - moment.elementalBalance.Fire),
    Water: Math.abs(natalChart.elementalBalance.Water - moment.elementalBalance.Water),
    Earth: Math.abs(natalChart.elementalBalance.Earth - moment.elementalBalance.Earth),
    Air: Math.abs(natalChart.elementalBalance.Air - moment.elementalBalance.Air),
  };

  const elements: Element[] = ["Fire", "Water", "Earth", "Air"];
  const sortedElements = elements.sort(
    (a, b) => elementalDifferences[a] - elementalDifferences[b],
  );

  const favorableElements = sortedElements.slice(0, 2); // Most aligned
  const challengingElements = sortedElements.slice(2, 4); // Least aligned

  // Identify harmonic planets
  const harmonicPlanets = getHarmonicPlanets(
    natalChart.planetaryPositions,
    moment.planetaryPositions,
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (overallHarmony > 0.7) {
    recommendations.push("Excellent cosmic alignment! This is a favorable time for culinary exploration.");
  } else if (overallHarmony > 0.5) {
    recommendations.push("Good cosmic balance. Focus on dishes that emphasize your favorable elements.");
  } else {
    recommendations.push("Moderate cosmic alignment. Stick with familiar flavors for comfort.");
  }

  if (favorableElements.length > 0) {
    recommendations.push(
      `Emphasize ${favorableElements.join(" and ")} elements in your meal choices.`,
    );
  }

  if (harmonicPlanets.length >= 5) {
    recommendations.push(
      `Strong planetary support from ${harmonicPlanets.slice(0, 3).join(", ")}. Trust your intuition.`,
    );
  }

  // Calculate elemental boosts for recommendations
  const elementalBoosts: Partial<ElementalProperties> = {};
  favorableElements.forEach((element) => {
    elementalBoosts[element] = 0.3; // 30% boost for favorable elements
  });

  // Calculate alchemical boosts
  const alchemicalBoosts: Partial<AlchemicalProperties> = {};
  const alchemProps: (keyof AlchemicalProperties)[] = ["Spirit", "Essence", "Matter", "Substance"];

  alchemProps.forEach((prop) => {
    const natalValue = natalChart.alchemicalProperties[prop];
    const momentValue = moment.alchemicalProperties[prop];
    const difference = Math.abs(natalValue - momentValue);

    // Boost properties that are well-aligned
    if (difference <= 2) {
      alchemicalBoosts[prop] = 0.2; // 20% boost
    }
  });

  const comparison: ChartComparison = {
    natalChart,
    momentChart: moment,
    overallHarmony,
    elementalHarmony,
    alchemicalAlignment,
    planetaryResonance,
    insights: {
      favorableElements,
      challengingElements,
      harmonicPlanets,
      recommendations,
    },
    elementalBoosts,
    alchemicalBoosts,
    calculatedAt: new Date().toISOString(),
  };

  _logger.info("Chart comparison completed", {
    overallHarmony,
    elementalHarmony,
    alchemicalAlignment,
    planetaryResonance,
  } as any);

  return comparison;
}

/**
 * Get personalization boost from chart comparison
 * Returns a multiplier (0.7-1.3) to apply to recommendation scores
 */
export function getPersonalizationBoost(
  itemElemental: ElementalProperties,
  itemAlchemical: AlchemicalProperties,
  chartComparison: ChartComparison,
): number {
  let boost = 1.0;

  // Elemental boost
  const elements: Element[] = ["Fire", "Water", "Earth", "Air"];
  elements.forEach((element) => {
    const itemValue = itemElemental[element];
    const boostValue = chartComparison.elementalBoosts[element] || 0;
    boost += itemValue * boostValue;
  });

  // Alchemical boost
  const alchemProps: (keyof AlchemicalProperties)[] = ["Spirit", "Essence", "Matter", "Substance"];
  const totalAlchem =
    itemAlchemical.Spirit +
    itemAlchemical.Essence +
    itemAlchemical.Matter +
    itemAlchemical.Substance;

  if (totalAlchem > 0) {
    alchemProps.forEach((prop) => {
      const normalizedValue = itemAlchemical[prop] / totalAlchem;
      const boostValue = chartComparison.alchemicalBoosts[prop] || 0;
      boost += normalizedValue * boostValue;
    });
  }

  // Overall harmony multiplier
  boost *= 0.7 + (chartComparison.overallHarmony * 0.6); // Range: 0.7 to 1.3

  return Math.max(0.7, Math.min(1.3, boost)); // Clamp to reasonable range
}

export default {
  calculateMomentChart,
  compareCharts,
  getPersonalizationBoost,
};
