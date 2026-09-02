/**
 * Enhanced Astrology Service
 *
 * Provides the most accurate astronomical data by combining multiple sources: * 1. Astrologize API (primary)
 * 2. Swiss Ephemeris data (high accuracy fallback)
 * 3. Comprehensive transit database (seasonal analysis)
 * 4. Existing fallback calculations (final fallback)
 */

import {
  getAvailableYears,
  getSeasonalAnalysis,
  getTransitForDate,
  getEclipseSeasons,
  COMPREHENSIVE_TRANSIT_DATABASE,
} from "@/data/transits/comprehensiveTransitDatabase";
import type { TransitSeason } from "@/data/transits/comprehensiveTransitDatabase";
import type {
  CelestialPosition,
  PlanetaryAspect,
} from "@/types/celestial";
// import { getFallbackPlanetaryPositions } from "@/utils/accurateAstronomy";
import { createLogger } from "@/utils/logger";
import { getCurrentPlanetaryPositions } from "./astrologizeApi";
import { swissEphemerisService } from "./SwissEphemerisService";

const logger = createLogger("EnhancedAstrologyService");

/** The four elemental buckets this service tallies and reports on. */
type ElementName = "Fire" | "Earth" | "Air" | "Water";

const ELEMENT_NAMES: ElementName[] = ["Fire", "Earth", "Air", "Water"];

/**
 * Threshold test for an element share that may be absent from the map.
 * `undefined > threshold` is already false in JS, so an absent element keeps
 * failing the check exactly as it did before the lookups became index-checked.
 */
const exceedsThreshold = (
  value: number | undefined,
  threshold: number,
): boolean => value !== undefined && value > threshold;

export interface EnhancedAstrologicalData {
  planetaryPositions: Record<string, CelestialPosition>;
  dataSource: "astrologize" | "swiss-ephemeris" | "fallback" | "composite";
  confidence: number;
  siderealTime?: string;
  seasonalTransit?: unknown;
  keyAspects: PlanetaryAspect[];
  dominantElements: Record<string, number>;
  retrogradePlanets: string[];
  specialEvents: string[];
  lastUpdated: Date;
}

export interface TransitAnalysis {
  currentSeason: TransitSeason | null;
  upcomingTransits: TransitSeason[];
  dominantElements: Record<string, number>;
  keyAspects: PlanetaryAspect[];
  retrogradePlanets: string[];
  eclipseSeasons: Date[];
  majorTransits: unknown[];
}

/**
 * Enhanced Astrology Service Class
 */
export class EnhancedAstrologyService {
  private readonly cache: Map<string, EnhancedAstrologicalData> = new Map();
  private readonly cacheExpiration = 10 * 60 * 1000; // 10 minutes
  private lastAstrologizeCheck = 0;
  private readonly astrologizeCheckInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {
    logger.info(
      "Enhanced Astrology Service initialized with multi-source data integration",
    );
  }

  /**
   * Get the most accurate planetary positions using multiple data sources
   */
  async getEnhancedPlanetaryPositions(
    date: Date = new Date(),
  ): Promise<EnhancedAstrologicalData> {
    // Same value as `toISOString().split("T")[0]`, without an unchecked index:
    // the calendar-date portion, or the whole string if there is no separator.
    const iso = date.toISOString();
    const separatorIndex = iso.indexOf("T");
    const cacheKey =
      separatorIndex === -1 ? iso : iso.slice(0, separatorIndex);

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (
        cached &&
        Date.now() - cached.lastUpdated.getTime() < this.cacheExpiration
      ) {
        logger.debug("Using cached enhanced astrological data");
        return cached;
      }
    }

    try {
      const enhancedData = await this.calculateEnhancedPositions(date);
      this.cache.set(cacheKey, enhancedData);
      this.cleanCache();

      logger.info(
        `Enhanced astrological data calculated for ${date.toDateString()}`,
      );
      return enhancedData;
    } catch (error) {
      logger.error("Error getting enhanced planetary positions: ", error);
      throw error;
    }
  }

  /**
   * Get comprehensive transit analysis for a date
   */
  async getTransitAnalysis(date: Date = new Date()): Promise<TransitAnalysis> {
    const currentSeason = getTransitForDate(date);
    const _year = date.getFullYear().toString();
    const _availableYears = getAvailableYears();

    // Get seasonal analysis for the next 3 months
    const endDate = new Date(date);
    endDate.setMonth(endDate.getMonth() + 3);
    const seasonalAnalysis = getSeasonalAnalysis(date, endDate);

    // Get upcoming transits (next 30 days)
    const upcomingEndDate = new Date(date);
    upcomingEndDate.setDate(upcomingEndDate.getDate() + 30);
    const upcomingAnalysis = getSeasonalAnalysis(date, upcomingEndDate);

    // Get eclipse seasons for current year and next year
    const currentYear = date.getFullYear().toString();
    const nextYear = (date.getFullYear() + 1).toString();
    const currentYearEclipses = getEclipseSeasons(currentYear);
    const nextYearEclipses = getEclipseSeasons(nextYear);

    // Filter eclipses to only include future dates from current date
    const allEclipses = [...currentYearEclipses, ...nextYearEclipses];
    const futureEclipses = allEclipses
      .filter((eclipseDate) => eclipseDate > date)
      .slice(0, 4); // Return next 4 eclipses

    // Get major transits from transit database
    const yearlyData = COMPREHENSIVE_TRANSIT_DATABASE[currentYear] as { majorTransits?: unknown[] } | undefined;
    const majorTransits = Array.isArray(yearlyData?.majorTransits)
      ? yearlyData.majorTransits
      : [];

    await Promise.resolve();

    return {
      currentSeason,
      upcomingTransits: upcomingAnalysis.seasons,
      dominantElements: seasonalAnalysis.dominantElements,
      keyAspects: seasonalAnalysis.keyAspects,
      retrogradePlanets: seasonalAnalysis.retrogradePlanets,
      eclipseSeasons: futureEclipses,
      majorTransits,
    };
  }

  /**
   * Get seasonal recommendations based on current transits
   */
  async getSeasonalRecommendations(date: Date = new Date()): Promise<{
    seasonalThemes: string[];
    culinaryInfluences: string[];
    dominantElements: Record<string, number>;
    recommendedCuisines: string[];
    recommendedCookingMethods: string[];
    alchemicalProperties: Record<string, number>;
  }> {
    const transitAnalysis = await this.getTransitAnalysis(date);
    const { currentSeason } = transitAnalysis;

    if (!currentSeason) {
      // Fallback to basic seasonal analysis
      const month = date.getMonth();
      const basicSeasonalData = this.getBasicSeasonalData(month);
      return {
        seasonalThemes: basicSeasonalData.themes,
        culinaryInfluences: basicSeasonalData.culinaryInfluences,
        dominantElements: basicSeasonalData.dominantElements,
        recommendedCuisines: basicSeasonalData.recommendedCuisines,
        recommendedCookingMethods: basicSeasonalData.cookingMethods,
        alchemicalProperties: basicSeasonalData.alchemicalProperties,
      };
    }

    return {
      seasonalThemes: currentSeason.seasonalThemes,
      culinaryInfluences: currentSeason.culinaryInfluences,
      dominantElements: currentSeason.dominantElements,
      recommendedCuisines: this.getRecommendedCuisines(currentSeason.dominantElements),
      recommendedCookingMethods: this.getRecommendedCookingMethods(currentSeason.dominantElements),
      alchemicalProperties: currentSeason.alchemicalProperties,
    };
  }

  /**
   * Calculate enhanced positions using multiple data sources
   */
  private async calculateEnhancedPositions(
    date: Date,
  ): Promise<EnhancedAstrologicalData> {
    let primaryPositions: Record<string, CelestialPosition>;
    let dataSource: EnhancedAstrologicalData["dataSource"];
    let confidence: number;

    // Unified positions service
    try {
      const positionsModule = (await import(
        "@/services/PlanetaryPositionsService"
      )) as Record<string, unknown>;
      const servicePositions = await (
        positionsModule.planetaryPositionsService as {
          getForDate: (
            date: Date,
          ) => Promise<Record<string, CelestialPosition>>;
        }
      ).getForDate(date);
      primaryPositions = servicePositions;
      dataSource = "composite";
      confidence = 0.95;
    } catch (_error) {
      logger.warn(
        "Positions service failed, falling back to Swiss/fallback chain",
      );
      // Try Swiss Ephemeris then fallback
      try {
        primaryPositions =
          await swissEphemerisService.getPlanetaryPositions(date);
        dataSource = "swiss-ephemeris";
        confidence = 0.9;
      } catch (_e) {
        primaryPositions = {};
        dataSource = "fallback";
        confidence = 0.7;
      }
    }

    // Get seasonal transit information
    const seasonalTransit = getTransitForDate(date);

    // Get sidereal time
    const siderealTime = swissEphemerisService.getSiderealTime(date);

    // Calculate dominant elements from positions
    const dominantElements = this.calculateDominantElements(
      primaryPositions,
    );

    // Get retrograde planets
    const retrogradePlanets = Object.entries(primaryPositions)
      .filter(([_, position]) => position.isRetrograde)
      .map(([planet]) => planet);

    // Get special events
    const specialEvents = seasonalTransit?.specialEvents ?? [];

    // Get key aspects from seasonal transit
    const keyAspects = (seasonalTransit as { keyAspects?: PlanetaryAspect[] } | undefined)?.keyAspects ?? [];

    return {
      planetaryPositions: primaryPositions,
      dataSource,
      confidence,
      siderealTime: siderealTime ?? undefined,
      seasonalTransit,
      keyAspects,
      dominantElements,
      retrogradePlanets,
      specialEvents,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get positions from Astrologize API
   */
  private async getAstrologizePositions(
    _date: Date,
  ): Promise<Record<string, CelestialPosition>> {
    try {
      const astrologizePositions = await getCurrentPlanetaryPositions();

      // Convert to CelestialPosition format
      const celestialPositions: Record<string, CelestialPosition> = {};

      Object.entries(astrologizePositions).forEach(([planet, position]) => {
        celestialPositions[planet] = {
          sign: position.sign,
          degree: position.degree,
          exactLongitude: position.exactLongitude,
          isRetrograde: position.isRetrograde,
          minutes: position.minute,
        };
      });

      return celestialPositions;
    } catch (error) {
      logger.error("Error fetching Astrologize positions: ", error);
      throw error;
    }
  }

  /**
   * Calculate dominant elements from planetary positions
   */
  private calculateDominantElements(
    positions: Record<string, CelestialPosition>,
  ): Record<string, number> {
    const elementCounts: Record<ElementName, number> = {
      Fire: 0,
      Earth: 0,
      Air: 0,
      Water: 0,
    };

    // Keyed by an already-lowercased sign string (with an "aries" fallback) that
    // isn't statically narrowed to ZodiacSignType, so the key stays `string`.
    // Every value is one of the four buckets held by `elementCounts`.
    const signElements: Record<string, ElementName> = {
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

    Object.values(positions).forEach((position) => {
      const element = signElements[position.sign ?? "aries"];
      if (element) {
        elementCounts[element]++;
      }
    });

    // Normalize to percentages
    const total = Object.values(elementCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (total > 0) {
      ELEMENT_NAMES.forEach((element) => {
        elementCounts[element] /= total;
      });
    }

    return elementCounts;
  }

  /**
   * Get recommended cuisines based on dominant elements
   */
  private getRecommendedCuisines(
    dominantElements: Record<string, number>,
  ): string[] {
    const recommendations: string[] = [];

    if (exceedsThreshold(dominantElements.Fire, 0.3)) {
      recommendations.push("Mexican", "Thai", "Indian", "Korean");
    }
    if (exceedsThreshold(dominantElements.Earth, 0.3)) {
      recommendations.push("Italian", "French", "Mediterranean", "Southern US");
    }
    if (exceedsThreshold(dominantElements.Air, 0.3)) {
      recommendations.push("Japanese", "Vietnamese", "Greek", "Middle Eastern");
    }
    if (exceedsThreshold(dominantElements.Water, 0.3)) {
      recommendations.push(
        "Seafood-focused",
        "Nordic",
        "Coastal Mediterranean",
        "Pacific Rim",
      );
    }

    return recommendations.length > 0
      ? recommendations
      : ["Italian", "Mediterranean", "Asian Fusion"];
  }

  /**
   * Get recommended cooking methods based on dominant elements
   */
  private getRecommendedCookingMethods(
    dominantElements: Record<string, number>,
  ): string[] {
    const recommendations: string[] = [];

    if (exceedsThreshold(dominantElements.Fire, 0.3)) {
      recommendations.push(
        "Grilling",
        "Stir-frying",
        "High-heat roasting",
        "Spicy seasoning",
      );
    }
    if (exceedsThreshold(dominantElements.Earth, 0.3)) {
      recommendations.push("Slow cooking", "Braising", "Stewing", "Baking");
    }
    if (exceedsThreshold(dominantElements.Air, 0.3)) {
      recommendations.push(
        "Steaming",
        "Light sautéing",
        "Fresh preparation",
        "Quick cooking",
      );
    }
    if (exceedsThreshold(dominantElements.Water, 0.3)) {
      recommendations.push(
        "Poaching",
        "Soups and stews",
        "Gentle simmering",
        "Marinating",
      );
    }

    return recommendations.length > 0
      ? recommendations
      : ["Grilling", "Sautéing", "Baking"];
  }

  /**
   * Get basic seasonal data as fallback
   */
  private getBasicSeasonalData(month: number): {
    themes: string[];
    culinaryInfluences: string[];
    dominantElements: Record<string, number>;
    recommendedCuisines: string[];
    cookingMethods: string[];
    alchemicalProperties: Record<string, number>;
  } {
    const seasonalData = {
      0: {
        // January
        themes: ["New beginnings", "Comfort", "Warmth"],
        culinaryInfluences: ["Hearty dishes", "Slow cooking", "Warm spices"],
        dominantElements: { Fire: 0.3, Earth: 0.4, Air: 0.2, Water: 0.1 },
        recommendedCuisines: ["Italian", "French", "Comfort food"],
        cookingMethods: ["Slow cooking", "Braising", "Baking"],
        alchemicalProperties: {
          Spirit: 0.2,
          Essence: 0.3,
          Matter: 0.4,
          Substance: 0.1,
        },
      },
      1: {
        // February
        themes: ["Romance", "Indulgence", "Rich flavors"],
        culinaryInfluences: ["Rich sauces", "Chocolate", "Comfort foods"],
        dominantElements: { Fire: 0.2, Earth: 0.5, Air: 0.2, Water: 0.1 },
        recommendedCuisines: ["French", "Italian", "Comfort food"],
        cookingMethods: ["Slow cooking", "Baking", "Rich sauces"],
        alchemicalProperties: {
          Spirit: 0.1,
          Essence: 0.4,
          Matter: 0.4,
          Substance: 0.1,
        },
      },
      2: {
        // March
        themes: ["Spring awakening", "Fresh ingredients", "Light dishes"],
        culinaryInfluences: [
          "Fresh herbs",
          "Light sauces",
          "Spring vegetables",
        ],
        dominantElements: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
        recommendedCuisines: ["Mediterranean", "Asian", "Fresh cuisine"],
        cookingMethods: ["Quick cooking", "Fresh preparation", "Light cooking"],
        alchemicalProperties: {
          Spirit: 0.4,
          Essence: 0.2,
          Matter: 0.2,
          Substance: 0.2,
        },
      },
      // Add more months as needed...
    };

    return (month in seasonalData ? seasonalData[month as keyof typeof seasonalData] : undefined) ?? seasonalData[0];
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (now - value.lastUpdated.getTime() > this.cacheExpiration) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get data source information
   */
  getDataSourceInfo(): {
    astrologizeAvailable: boolean;
    swissEphemerisAvailable: boolean;
    transitDatabaseAvailable: boolean;
    lastAstrologizeCheck: Date;
  } {
    return {
      astrologizeAvailable:
        Date.now() - this.lastAstrologizeCheck < this.astrologizeCheckInterval,
      swissEphemerisAvailable: true, // Always available as it's local data
      transitDatabaseAvailable: true, // Always available as it's local data
      lastAstrologizeCheck: new Date(this.lastAstrologizeCheck),
    };
  }

  /**
   * Force refresh of Astrologize API data
   */
  async forceRefreshAstrologize(): Promise<void> {
    this.lastAstrologizeCheck = 0;
    this.cache.clear();
    logger.info("Forced refresh of Astrologize API data");
    await Promise.resolve();
  }
}

// Create singleton instance
export const enhancedAstrologyService = new EnhancedAstrologyService();

// Export convenience functions
export const getEnhancedPlanetaryPositions = (
  _date?: Date,
): Promise<EnhancedAstrologicalData> =>
  enhancedAstrologyService.getEnhancedPlanetaryPositions(_date);

export const getTransitAnalysis = (
  _date?: Date,
): Promise<TransitAnalysis> =>
  enhancedAstrologyService.getTransitAnalysis(_date);

export const getSeasonalRecommendations = (
  _date?: Date,
): Promise<{
  seasonalThemes: string[];
  culinaryInfluences: string[];
  dominantElements: Record<string, number>;
  recommendedCuisines: string[];
  recommendedCookingMethods: string[];
  alchemicalProperties: Record<string, number>;
}> =>
  enhancedAstrologyService.getSeasonalRecommendations(_date);

export const getDataSourceInfo = (): {
  astrologizeAvailable: boolean;
  swissEphemerisAvailable: boolean;
  transitDatabaseAvailable: boolean;
  lastAstrologizeCheck: Date;
} =>
  enhancedAstrologyService.getDataSourceInfo();

export const forceRefreshAstrologize = (): Promise<void> =>
  enhancedAstrologyService.forceRefreshAstrologize();
