/**
 * Enhanced Cuisine Recommendation System
 *
 * Integrates the comprehensive hierarchical cuisine system with personalized recommendations,
 * signature analysis, and planetary pattern recognition.
 */

// Import the new comprehensive cuisine system
import type { ElementalProperties } from "@/types/alchemy";
import type { CuisineComputedProperties } from "@/types/hierarchy";
import { getGlobalCache } from "../cuisine/cuisineComputationCache";
import {
  generateCuisineRecommendations,
  validateUserProfile,
} from "../cuisine/cuisineRecommendationEngine";
import type { UserProfile } from "../cuisine/cuisineRecommendationEngine";

// Import caching system

// Import legacy types for backward compatibility

// ========== BACKWARD COMPATIBILITY INTERFACES ==========

/**
 * Legacy cuisine recommendation interface (maintained for compatibility)
 */
export interface CuisineRecommendation {
  cuisine: string;
  score: number;
  reasoning: string;
  elementalMatch: number;
}

/**
 * Legacy cuisine recommendation parameters
 */
export interface CuisineRecommendationParams {
  elementalProperties: ElementalProperties;
  preferences?: string[];
  dietaryRestrictions?: string[];
}

// ========== ENHANCED RECOMMENDATION SYSTEM ==========

/**
 * Enhanced cuisine recommendation with comprehensive analysis
 */
export interface EnhancedCuisineRecommendation extends CuisineRecommendation {
  planetaryAlignment?: number;
  signatureMatch?: number;
  confidence: number;
  detailedReasoning: string[];
  recommendedRecipes?: string[];
}

/**
 * Enhanced recommendation parameters
 */
export interface EnhancedCuisineRecommendationParams extends CuisineRecommendationParams {
  astrologicalProfile?: {
    sunSign?: string;
    moonSign?: string;
    currentPlanets?: { [planet: string]: string };
  };
  useAdvancedAnalysis?: boolean;
  includePlanetaryData?: boolean;
  includeSignatures?: boolean;
}

// ========== MAIN RECOMMENDATION FUNCTIONS ==========

/**
 * Generate enhanced cuisine recommendations using the comprehensive system
 *
 * @param params - Enhanced recommendation parameters
 * @returns Array of cuisine recommendations with detailed analysis
 */
export function generateEnhancedCuisineRecommendations(
  params: EnhancedCuisineRecommendationParams,
): EnhancedCuisineRecommendation[] {
  const {
    elementalProperties,
    preferences = [],
    dietaryRestrictions = [],
    astrologicalProfile,
    useAdvancedAnalysis: _useAdvancedAnalysis = true,
    includePlanetaryData: _includePlanetaryData = true,
    includeSignatures: _includeSignatures = true,
  } = params;

  try {
    // Validate input
    if (!elementalProperties) {
      throw new Error("Elemental properties are required");
    }

    // Create user profile
    const userProfile: UserProfile = {
      elementalPreferences: elementalProperties,
      culturalBackground: {
        preferredCuisines: preferences,
        dietaryRestrictions,
      },
      astrologicalProfile: astrologicalProfile
        ? {
            sunSign: astrologicalProfile.sunSign,
            moonSign: astrologicalProfile.moonSign,
            currentPlanetaryPositions: astrologicalProfile.currentPlanets,
          }
        : undefined,
    };

    // Validate user profile
    const validation = validateUserProfile(userProfile);
    if (!validation.isValid) {
      console.warn("User profile validation issues:", validation.errors);
    }

    const availableCuisines = loadCuisinesFromCache();

    if (availableCuisines.size === 0) {
      // No precomputed cuisine data in cache — fall back to basic recommendations
      // rather than fabricating data. Callers see real elemental-driven matches
      // instead of a hardcoded universe.
      return generateBasicCuisineRecommendations(params);
    }

    const recommendations = generateCuisineRecommendations(
      userProfile,
      availableCuisines,
      {
        maxRecommendations: 10,
        minCompatibilityThreshold: 0.1,
        includeReasoning: true,
      },
    );

    // Convert to enhanced format
    return recommendations.map((rec) => ({
      cuisine: rec.cuisineId,
      score: rec.compatibilityScore,
      reasoning: rec.reasoning.join(", "),
      elementalMatch: rec.scoringFactors.elementalCompatibility,
      planetaryAlignment: rec.scoringFactors.alchemicalCompatibility || 0,
      signatureMatch: rec.scoringFactors.signatureMatch,
      confidence: rec.confidence,
      detailedReasoning: rec.reasoning,
      recommendedRecipes: rec.recommendedRecipes,
    }));
  } catch (error) {
    console.error("Enhanced cuisine recommendation failed:", error);
    // Fall back to basic recommendations
    return generateBasicCuisineRecommendations(params);
  }
}

/**
 * Legacy cuisine recommendation function (maintained for backward compatibility)
 *
 * @param params - Basic recommendation parameters
 * @returns Array of basic cuisine recommendations
 */
export function generateCuisineRecommendation(
  params: CuisineRecommendationParams,
): CuisineRecommendation[] {
  // Use enhanced system but return legacy format
  const enhanced = generateEnhancedCuisineRecommendations(params);

  return enhanced.map((rec) => ({
    cuisine: rec.cuisine,
    score: rec.score,
    reasoning: rec.reasoning,
    elementalMatch: rec.elementalMatch,
  }));
}

/**
 * Fallback basic cuisine recommendations (legacy implementation)
 */
function generateBasicCuisineRecommendations(
  params: EnhancedCuisineRecommendationParams,
): EnhancedCuisineRecommendation[] {
  const { elementalProperties, preferences = [] } = params;

  const recommendations: EnhancedCuisineRecommendation[] = [];

  // Fire-based cuisines
  if (elementalProperties.Fire > 0.6) {
    recommendations.push({
      cuisine: "Mexican",
      score: elementalProperties.Fire * 0.8,
      reasoning: "High Fire element matches spicy Mexican cuisine",
      elementalMatch: elementalProperties.Fire,
      confidence: 0.8,
      detailedReasoning: ["High Fire element matches spicy Mexican cuisine"],
      planetaryAlignment: 0,
      signatureMatch: 0,
    });
  }

  // Water-based cuisines
  if (elementalProperties.Water > 0.6) {
    recommendations.push({
      cuisine: "Mediterranean",
      score: elementalProperties.Water * 0.8,
      reasoning: "High Water element matches Mediterranean freshness",
      elementalMatch: elementalProperties.Water,
      confidence: 0.8,
      detailedReasoning: ["High Water element matches Mediterranean freshness"],
      planetaryAlignment: 0,
      signatureMatch: 0,
    });
  }

  // Earth-based cuisines
  if (elementalProperties.Earth > 0.6) {
    recommendations.push({
      cuisine: "Italian",
      score: elementalProperties.Earth * 0.8,
      reasoning: "High Earth element matches hearty Italian cuisine",
      elementalMatch: elementalProperties.Earth,
      confidence: 0.8,
      detailedReasoning: ["High Earth element matches hearty Italian cuisine"],
      planetaryAlignment: 0,
      signatureMatch: 0,
    });
  }

  // Air-based cuisines
  if (elementalProperties.Air > 0.6) {
    recommendations.push({
      cuisine: "Asian",
      score: elementalProperties.Air * 0.8,
      reasoning: "High Air element matches light Asian cuisine",
      elementalMatch: elementalProperties.Air,
      confidence: 0.8,
      detailedReasoning: ["High Air element matches light Asian cuisine"],
      planetaryAlignment: 0,
      signatureMatch: 0,
    });
  }

  // Boost scores for preferred cuisines
  recommendations.forEach((rec) => {
    if (preferences.includes(rec.cuisine)) {
      rec.score = Math.min(rec.score * 1.2, 1.0);
      rec.reasoning += " (preferred cuisine)";
      rec.detailedReasoning.push("This is one of your preferred cuisines");
    }
  });

  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Build a cuisine map from the live computation cache.
 *
 * Returns an empty Map when no cuisines have been computed yet — callers fall
 * back to elemental-only recommendations rather than seeing fabricated data.
 * Logs a structured warning on cache miss so the empty case is observable.
 */
function loadCuisinesFromCache(): Map<
  string,
  { name: string; properties: CuisineComputedProperties }
> {
  const cache = getGlobalCache();
  const info = cache.getInfo();
  const cuisines = new Map<
    string,
    { name: string; properties: CuisineComputedProperties }
  >();

  if (info.entries.length === 0) {
    console.warn(
      "[cuisineRecommendation] Cuisine computation cache is empty — " +
        "falling back to basic elemental recommendations. " +
        "Populate the cache via warm()/set() to enable signature-driven matching.",
    );
    return cuisines;
  }

  // Dedupe per cuisineId — the cache may hold multiple option-hashes per cuisine;
  // first one wins (LRU order from getInfo).
  for (const entry of info.entries) {
    if (cuisines.has(entry.cuisineId)) continue;
    const properties = cache.get(entry.cuisineId, entry.options);
    if (properties) {
      cuisines.set(entry.cuisineId, { name: entry.cuisineId, properties });
    }
  }

  return cuisines;
}

/**
 * Get elemental profile for a cuisine (legacy function)
 */
export function getCuisineElementalProfile(
  cuisine: string,
): ElementalProperties {
  const profiles: Record<string, ElementalProperties> = {
    Mexican: { Fire: 0.8, Water: 0.3, Earth: 0.5, Air: 0.4 },
    Italian: { Fire: 0.4, Water: 0.4, Earth: 0.8, Air: 0.4 },
    Mediterranean: { Fire: 0.3, Water: 0.8, Earth: 0.5, Air: 0.6 },
    Asian: { Fire: 0.5, Water: 0.6, Earth: 0.4, Air: 0.8 },
    Indian: { Fire: 0.9, Water: 0.3, Earth: 0.6, Air: 0.5 },
    Thai: { Fire: 0.7, Water: 0.7, Earth: 0.4, Air: 0.6 },
  };

  return profiles[cuisine] || { Fire: 0.5, Water: 0.5, Earth: 0.5, Air: 0.5 };
}

/**
 * Get match score CSS class (legacy function)
 */
export function getMatchScoreClass(score: number): string {
  if (score >= 0.8) return "match-excellent";
  if (score >= 0.6) return "match-good";
  if (score >= 0.4) return "match-fair";
  return "match-poor";
}

/**
 * Render score badge (legacy function)
 */
export function renderScoreBadge(score: number): string {
  const percentage = Math.round(score * 100);
  if (percentage >= 80) return `🌟 ${percentage}%`;
  if (percentage >= 60) return `⭐ ${percentage}%`;
  if (percentage >= 40) return `⚡ ${percentage}%`;
  return `💫 ${percentage}%`;
}

/**
 * Calculate elemental profile from zodiac sign (legacy function)
 */
export function calculateElementalProfileFromZodiac(
  zodiacSign: string,
): ElementalProperties {
  const zodiacProfiles: Record<string, ElementalProperties> = {
    // Fire signs
    aries: { Fire: 0.8, Water: 0.2, Earth: 0.3, Air: 0.4 },
    leo: { Fire: 0.9, Water: 0.3, Earth: 0.2, Air: 0.5 },
    sagittarius: { Fire: 0.7, Water: 0.4, Earth: 0.3, Air: 0.6 },

    // Earth signs
    taurus: { Fire: 0.3, Water: 0.4, Earth: 0.8, Air: 0.2 },
    virgo: { Fire: 0.2, Water: 0.5, Earth: 0.9, Air: 0.3 },
    capricorn: { Fire: 0.4, Water: 0.3, Earth: 0.8, Air: 0.2 },

    // Air signs
    gemini: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.8 },
    libra: { Fire: 0.3, Water: 0.5, Earth: 0.3, Air: 0.7 },
    aquarius: { Fire: 0.5, Water: 0.2, Earth: 0.3, Air: 0.9 },

    // Water signs
    cancer: { Fire: 0.2, Water: 0.8, Earth: 0.4, Air: 0.3 },
    scorpio: { Fire: 0.6, Water: 0.9, Earth: 0.3, Air: 0.2 },
    pisces: { Fire: 0.3, Water: 0.8, Earth: 0.2, Air: 0.4 },
  };

  return (
    zodiacProfiles[zodiacSign.toLowerCase()] || {
      Fire: 0.5,
      Water: 0.5,
      Earth: 0.5,
      Air: 0.5,
    }
  );
}

/**
 * Calculate elemental contributions from planets (legacy function)
 */
export function calculateElementalContributionsFromPlanets(
  planetaryPositions: Record<string, unknown>,
): ElementalProperties {
  const contributions: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  // Basic planetary element contributions
  const planetaryElements: Record<string, ElementalProperties> = {
    sun: { Fire: 1.0, Water: 0, Earth: 0, Air: 0 },
    moon: { Fire: 0, Water: 1.0, Earth: 0, Air: 0 },
    mercury: { Fire: 0, Water: 0, Earth: 0, Air: 1.0 },
    venus: { Fire: 0, Water: 0.7, Earth: 0.3, Air: 0 },
    mars: { Fire: 1.0, Water: 0, Earth: 0, Air: 0 },
    jupiter: { Fire: 0.5, Water: 0, Earth: 0, Air: 0.5 },
    saturn: { Fire: 0, Water: 0, Earth: 1.0, Air: 0 },
  };

  Object.entries(planetaryPositions).forEach(([planet, position]) => {
    const planetElements = planetaryElements[planet.toLowerCase()];
    if (planetElements && position) {
      const strength =
        typeof position === "object" && (position as any).strength
          ? (position as any).strength
          : 0.5;
      contributions.Fire += planetElements.Fire * strength;
      contributions.Water += planetElements.Water * strength;
      contributions.Earth += planetElements.Earth * strength;
      contributions.Air += planetElements.Air * strength;
    }
  });

  // Normalize
  const total =
    contributions.Fire +
    contributions.Water +
    contributions.Earth +
    contributions.Air;
  if (total > 0) {
    contributions.Fire /= total;
    contributions.Water /= total;
    contributions.Earth /= total;
    contributions.Air /= total;
  }

  return contributions;
}
