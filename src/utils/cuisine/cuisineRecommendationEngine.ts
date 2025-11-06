/**
 * Cuisine Recommendation Engine
 *
 * Generates personalized cuisine recommendations based on user profiles,
 * elemental preferences, and compatibility matching algorithms.
 *
 * Key Features:
 * - User profile compatibility matching
 * - Elemental preference analysis
 * - Cultural background consideration
 * - Seasonal optimization
 * - Multi-factor recommendation scoring
 */

import type {
    AlchemicalProperties,
    CuisineComputedProperties,
    ElementalProperties
} from '@/types/hierarchy';

// ========== USER PROFILE TYPES ==========

/**
 * User profile for cuisine recommendations
 */
export interface UserProfile {
  /** User's elemental preferences (0-1 scale) */
  elementalPreferences: ElementalProperties;

  /** User's alchemical preferences (optional) */
  alchemicalPreferences?: Partial<AlchemicalProperties>;

  /** User's cultural background */
  culturalBackground?: {
    preferredCuisines?: string[];
    restrictedIngredients?: string[];
    dietaryRestrictions?: string[];
    spiceTolerance?: 'low' | 'medium' | 'high'
  };

  /** User's astrological profile */
  astrologicalProfile?: {
    sunSign?: string,
    moonSign?: string,
    risingSign?: string,
    currentPlanetaryPositions?: { [planet: string]: string };
  };

  /** User's location and seasonal preferences */
  locationPreferences?: {
    currentSeason?: string,
    climatePreference?: string,
    region?: string
  };
}

/**
 * Cuisine recommendation result
 */
export interface CuisineRecommendation {
  /** Cuisine identifier */
  cuisineId: string;

  /** Cuisine name */
  cuisineName: string;

  /** Overall compatibility score (0-1) */
  compatibilityScore: number;

  /** Breakdown of scoring factors */
  scoringFactors: {
    elementalCompatibility: number;
    alchemicalCompatibility?: number;
    culturalAlignment: number;
    seasonalRelevance: number;
    signatureMatch: number
  };

  /** Reasoning for the recommendation */
  reasoning: string[];

  /** Recommended recipes from this cuisine */
  recommendedRecipes?: string[];

  /** Confidence in recommendation */
  confidence: number
}

// ========== COMPATIBILITY SCORING FUNCTIONS ==========

/**
 * Calculate elemental compatibility between user and cuisine
 *
 * @param userPreferences - User's elemental preferences
 * @param cuisineElementals - Cuisine's elemental properties
 * @returns Compatibility score (0-1)
 */
export function calculateElementalCompatibility(
  userPreferences: ElementalProperties,
  cuisineElementals: ElementalProperties
): number {
  // Calculate cosine similarity between preference vectors
  const userVector = Object.values(userPreferences);
  const cuisineVector = Object.values(cuisineElementals);

  const dotProduct = userVector.reduce((sum, userVal, i) =>
    sum + userVal * cuisineVector[i], 0
  );

  const userMagnitude = Math.sqrt(userVector.reduce((sum, val) => sum + val * val, 0));
  const cuisineMagnitude = Math.sqrt(cuisineVector.reduce((sum, val) => sum + val * val, 0));

  if (userMagnitude === 0 || cuisineMagnitude === 0) return 0;

  const cosineSimilarity = dotProduct / (userMagnitude * cuisineMagnitude);

  // Convert to 0-1 scale (cosine similarity is -1 to 1, but we expect positive)
  return Math.max(0, (cosineSimilarity + 1) / 2);
}

/**
 * Calculate alchemical compatibility between user and cuisine
 *
 * @param userPreferences - User's alchemical preferences
 * @param cuisineAlchemical - Cuisine's alchemical properties
 * @returns Compatibility score (0-1)
 */
export function calculateAlchemicalCompatibility(
  userPreferences: Partial<AlchemicalProperties>,
  cuisineAlchemical: AlchemicalProperties
): number {
  const properties: Array<keyof AlchemicalProperties> = ['Spirit', 'Essence', 'Matter', 'Substance'];
  let totalScore = 0;
  let weightedCount = 0;

  properties.forEach(property => {
    const userPref = userPreferences[property];
    if (userPref === undefined) return; // Skip if user has no preference for this property

    const cuisineValue = cuisineAlchemical[property];
    const compatibility = 1 - Math.abs(userPref - cuisineValue); // Closer values = higher compatibility
    const weight = userPref; // Weight by user's preference strength

    totalScore += compatibility * weight;
    weightedCount += weight;
  });

  return weightedCount > 0 ? totalScore / weightedCount : 0.5; // Default to neutral
}

/**
 * Calculate cultural alignment score
 *
 * @param userProfile - User's cultural background
 * @param cuisineId - Cuisine identifier
 * @param cuisineName - Cuisine name
 * @returns Cultural alignment score (0-1)
 */
export function calculateCulturalAlignment(
  userProfile: UserProfile,
  cuisineId: string,
  cuisineName: string
): number {
  let alignment = 0.5; // Base neutral score

  if (!userProfile.culturalBackground) {
    return alignment;
  }

  const { preferredCuisines, spiceTolerance } = userProfile.culturalBackground;

  // Check if cuisine is in user's preferred list
  if (preferredCuisines && preferredCuisines.length > 0) {
    const cuisineMatch = preferredCuisines.some(cuisine =>
      cuisine.toLowerCase() === cuisineId.toLowerCase() ||
      cuisine.toLowerCase() === cuisineName.toLowerCase()
    );

    if (cuisineMatch) {
      alignment += 0.3; // Strong boost for preferred cuisines
    }
  }

  // Consider spice tolerance (this would need cuisine spice data)
  // For now, use a neutral approach
  if (spiceTolerance) {
    // Could be enhanced with cuisine spice level data
    alignment += 0.1; // Small adjustment for having spice preference data
  }

  return Math.min(1, Math.max(0, alignment));
}

/**
 * Calculate seasonal relevance score
 *
 * @param userProfile - User's location preferences
 * @param cuisineProperties - Cuisine computed properties
 * @returns Seasonal relevance score (0-1)
 */
export function calculateSeasonalRelevance(
  userProfile: UserProfile,
  cuisineProperties: CuisineComputedProperties
): number {
  if (!userProfile.locationPreferences?.currentSeason) {
    return 0.5; // Neutral if no seasonal data
  }

  const { currentSeason } = userProfile.locationPreferences;

  // This would be enhanced with actual seasonal cuisine data
  // For now, return neutral score
  return 0.5;
}

/**
 * Calculate signature match score
 *
 * @param cuisineSignatures - Cuisine's identified signatures
 * @param userPreferences - User's elemental preferences
 * @returns Signature match score (0-1)
 */
export function calculateSignatureMatch(
  cuisineSignatures: CuisineComputedProperties['signatures'],
  userPreferences: ElementalProperties
): number {
  if (!cuisineSignatures || cuisineSignatures.length === 0) {
    return 0.5; // Neutral if no signatures
  }

  let totalMatch = 0;

  cuisineSignatures.forEach(signature => {
    const {property} = signature;

    // Check if signature property is elemental
    if (['Fire', 'Water', 'Earth', 'Air'].includes(property)) {
      const userPreference = userPreferences[property as keyof ElementalProperties];
      const signatureStrength = signature.zscore > 0 ? 1 : -1; // Positive or negative signature

      // Higher match if user prefers the signature direction
      const match = signatureStrength > 0 ?
        userPreference : // Positive signature matches high preference
        (1 - userPreference); // Negative signature matches low preference

      totalMatch += match * Math.min(Math.abs(signature.zscore) / 3, 1); // Weight by signature strength
    }
  });

  return cuisineSignatures.length > 0 ? totalMatch / cuisineSignatures.length : 0.5;
}

// ========== MAIN RECOMMENDATION ENGINE ==========

/**
 * Generate cuisine recommendations for a user
 *
 * This is the main entry point for personalized cuisine recommendations.
 * Combines multiple compatibility factors for comprehensive scoring.
 *
 * @param userProfile - User's preference and background profile
 * @param availableCuisines - Map of cuisine IDs to computed properties
 * @param options - Recommendation options
 * @returns Array of personalized cuisine recommendations
 */
export function generateCuisineRecommendations(userProfile: UserProfile,
  availableCuisines: Map<string, { name: string, properties: CuisineComputedProperties }>,
  options: {
    maxRecommendations?: number,
    minCompatibilityThreshold?: number,
    includeReasoning?: boolean,
    considerSeasonalFactors?: boolean
  } = {}
): CuisineRecommendation[] {
  const {
    maxRecommendations = 10,
    minCompatibilityThreshold = 0.3,
    includeReasoning = true,
    considerSeasonalFactors = true
  } = options;

  const recommendations: CuisineRecommendation[] = [];

  availableCuisines.forEach((cuisineData, cuisineId) => {
    const { name: cuisineName, properties: cuisineProperties } = cuisineData;

    // Calculate individual compatibility scores
    const elementalCompatibility = calculateElementalCompatibility(
      userProfile.elementalPreferences,
      cuisineProperties.averageElementals
    );

    const alchemicalCompatibility = userProfile.alchemicalPreferences && cuisineProperties.averageAlchemical ?
      calculateAlchemicalCompatibility(
        userProfile.alchemicalPreferences,
        cuisineProperties.averageAlchemical
      ) : undefined;

    const culturalAlignment = calculateCulturalAlignment(userProfile, cuisineId, cuisineName);

    const seasonalRelevance = considerSeasonalFactors ?
      calculateSeasonalRelevance(userProfile, cuisineProperties) : 0.5;

    const signatureMatch = calculateSignatureMatch(
      cuisineProperties.signatures,
      userProfile.elementalPreferences
    );

    // Calculate overall compatibility score
    const weights = {
      elemental: 0.4,
      alchemical: alchemicalCompatibility !== undefined ? 0.2 : 0,
      cultural: 0.15,
      seasonal: considerSeasonalFactors ? 0.15 : 0,
      signature: 0.1
};

    const totalWeight = weights.elemental + weights.alchemical + weights.cultural + weights.seasonal + weights.signature;

    const overallScore = (
      elementalCompatibility * weights.elemental +
      (alchemicalCompatibility || 0) * weights.alchemical +
      culturalAlignment * weights.cultural +
      seasonalRelevance * weights.seasonal +
      signatureMatch * weights.signature
    ) / totalWeight;

    // Apply minimum threshold
    if (overallScore < minCompatibilityThreshold) {
      return;
    }

    // Generate reasoning
    const reasoning: string[] = [];
    if (includeReasoning) {
      if (elementalCompatibility > 0.7) {
        reasoning.push('Strong elemental alignment with your preferences');
      } else if (elementalCompatibility < 0.4) {
        reasoning.push('Elemental properties differ from your preferences');
      }

      if (alchemicalCompatibility !== undefined && alchemicalCompatibility > 0.7) {
        reasoning.push('Good match with your alchemical preferences');
      }

      if (culturalAlignment > 0.7) {
        reasoning.push('Aligns with your cultural background');
      }

      if (signatureMatch > 0.6) {
        reasoning.push('Matches your preference for distinctive culinary signatures');
      }

      if (reasoning.length === 0) {
        reasoning.push('Balanced compatibility across multiple factors');
      }
    }

    // Calculate confidence based on data completeness
    let confidence = 0.5; // Base confidence
    if (cuisineProperties.sampleSize > 10) confidence += 0.2;
    if (cuisineProperties.signatures && cuisineProperties.signatures.length > 0) confidence += 0.15;
    if (alchemicalCompatibility !== undefined) confidence += 0.15;

    recommendations.push({
      cuisineId,
      cuisineName,
      compatibilityScore: overallScore,
      scoringFactors: {
        elementalCompatibility,
        alchemicalCompatibility,
        culturalAlignment,
        seasonalRelevance,
        signatureMatch
      },
      reasoning,
      confidence: Math.min(1, confidence)
    });
  });

  // Sort by compatibility score (highest first)
  recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Return top recommendations
  return recommendations.slice(0, maxRecommendations);
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Create a basic user profile from elemental preferences
 *
 * @param elementalPreferences - User's elemental preferences
 * @returns Basic user profile
 */
export function createBasicUserProfile(elementalPreferences: ElementalProperties): UserProfile {
  return {
    elementalPreferences: normalizeElementalPreferences(elementalPreferences)
  };
}

/**
 * Create an advanced user profile with full details
 *
 * @param elementalPreferences - User's elemental preferences
 * @param culturalBackground - Cultural background information
 * @param astrologicalProfile - Astrological profile
 * @param locationPreferences - Location and seasonal preferences
 * @returns Complete user profile
 */
export function createAdvancedUserProfile(
  elementalPreferences: ElementalProperties,
  culturalBackground?: UserProfile['culturalBackground'],
  astrologicalProfile?: UserProfile['astrologicalProfile'],
  locationPreferences?: UserProfile['locationPreferences']
): UserProfile {
  return {
    elementalPreferences: normalizeElementalPreferences(elementalPreferences),
    culturalBackground,
    astrologicalProfile,
    locationPreferences
  };
}

/**
 * Normalize elemental preferences to ensure they sum to 1.0
 *
 * @param preferences - Raw elemental preferences
 * @returns Normalized preferences
 */
function normalizeElementalPreferences(preferences: ElementalProperties): ElementalProperties {
  const values = Object.values(preferences);
  const sum = values.reduce((total, value) => total + value, 0);

  if (Math.abs(sum - 1.0) < 0.001) {
    return preferences; // Already normalized
  }

  const normalized: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
};

  if (sum > 0) {
    (Object.keys(preferences) as Array<keyof ElementalProperties>).forEach(key => {
      normalized[key] = preferences[key] / sum;
    });
  } else {
    // Fallback to equal distribution
    (Object.keys(normalized) as Array<keyof ElementalProperties>).forEach(key => {
      normalized[key] = 0.25;
    });
  }

  return normalized;
}

/**
 * Validate user profile data
 *
 * @param profile - User profile to validate
 * @returns Validation result
 */
export function validateUserProfile(profile: UserProfile): {
  isValid: boolean,
  errors: string[],
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate elemental preferences
  const elementalSum = Object.values(profile.elementalPreferences)
    .reduce((sum, val) => sum + val, 0);

  if (Math.abs(elementalSum - 1.0) > 0.01) {
    errors.push(`Elemental preferences must sum to 1.0 (current sum: ${elementalSum})`);
  }

  // Check for negative values
  Object.entries(profile.elementalPreferences).forEach(([element, value]) => {
    if (value < 0) {
      errors.push(`${element} preference cannot be negative`);
    }
  });

  // Validate alchemical preferences if provided
  if (profile.alchemicalPreferences) {
    Object.entries(profile.alchemicalPreferences).forEach(([property, value]) => {
      if (value !== undefined && (value < 0 || value > 1)) {
        warnings.push(`${property} preference should be between 0 and 1`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get recommendation summary statistics
 *
 * @param recommendations - Array of recommendations
 * @returns Summary statistics
 */
export function getRecommendationSummary(recommendations: CuisineRecommendation[]): {
  totalRecommendations: number,
  averageCompatibility: number,
  topCuisine: string | null,
  compatibilityDistribution: {
    excellent: number; // > 0.8
    good: number;      // 0.6 - 0.8
    fair: number;      // 0.4 - 0.6
    poor: number;      // < 0.4
  };
} {
  if (recommendations.length === 0) {
    return {
      totalRecommendations: 0,
      averageCompatibility: 0,
      topCuisine: null,
      compatibilityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
    };
  }

  const totalCompatibility = recommendations.reduce((sum, rec) => sum + rec.compatibilityScore, 0);
  const averageCompatibility = totalCompatibility / recommendations.length;

  const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
  recommendations.forEach(rec => {
    if (rec.compatibilityScore > 0.8) distribution.excellent++;
    else if (rec.compatibilityScore > 0.6) distribution.good++;
    else if (rec.compatibilityScore > 0.4) distribution.fair++;
    else distribution.poor++;
  });

  return {
    totalRecommendations: recommendations.length,
    averageCompatibility,
    topCuisine: recommendations[0]?.cuisineName || null,
    compatibilityDistribution: distribution
  };
}

// ========== EXPORTS ==========

export type {
    CuisineRecommendation, UserProfile
};
