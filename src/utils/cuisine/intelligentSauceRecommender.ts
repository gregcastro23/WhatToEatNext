/**
 * Intelligent Sauce Recommendation Engine
 *
 * Calculates sauce compatibility using elemental, alchemical, kinetic, and thermodynamic alignment.
 * Goes beyond simple cuisine-based pairing to provide P=IV circuit-optimized sauce recommendations.
 *
 * Part of the enhanced cuisine recommender system.
 */

import type { ElementalProperties, AlchemicalProperties } from "@/types/hierarchy";
import type { KineticMetrics } from "@/types/kinetics";
import type { ThermodynamicProperties } from "@/types/alchemy";
import { calculateElementalCompatibility } from "@/utils/cuisine/cuisineRecommendationEngine";

// ========== TYPE DEFINITIONS ==========

export interface Sauce {
  /** Sauce identifier */
  id: string;

  /** Sauce name */
  name: string;

  /** Description */
  description: string;

  /** Key ingredients */
  keyIngredients?: string[];

  /** Elemental properties */
  elementalProperties: ElementalProperties;

  /** Alchemical properties (optional) */
  alchemicalProperties?: AlchemicalProperties;

  /** Thermodynamic properties (optional) */
  thermodynamicProperties?: ThermodynamicProperties;

  /** Kinetic properties (optional) */
  kineticProperties?: KineticMetrics;

  /** Traditional cuisine associations */
  cuisineAssociations?: string[];

  /** Flavor profile tags */
  flavorTags?: string[];
}

export interface SauceRecommendationCriteria {
  /** Recipe or cuisine elemental properties */
  targetElementalProperties: ElementalProperties;

  /** Recipe or cuisine alchemical properties (optional) */
  targetAlchemicalProperties?: AlchemicalProperties;

  /** Recipe or cuisine thermodynamic properties (optional) */
  targetThermodynamicProperties?: ThermodynamicProperties;

  /** Recipe or cuisine kinetic properties (optional) */
  targetKineticProperties?: KineticMetrics;

  /** Desired sauce role */
  sauceRole?: "complement" | "contrast" | "enhance" | "balance";

  /** Maximum sauces to recommend */
  maxRecommendations?: number;

  /** Minimum compatibility threshold */
  minCompatibilityThreshold?: number;

  /** User preferences */
  userPreferences?: {
    preferredFlavorProfiles?: string[];
    avoidFlavorProfiles?: string[];
    spiceTolerance?: "low" | "medium" | "high";
  };
}

export interface SauceRecommendationResult {
  /** The sauce */
  sauce: Sauce;

  /** Overall compatibility score (0-1) */
  compatibilityScore: number;

  /** Detailed compatibility breakdown */
  compatibility: {
    elemental: number;
    alchemical?: number;
    thermodynamic?: number;
    kinetic?: number;
    circuitOptimization?: number;
  };

  /** Recommendation reason */
  reason: string;

  /** Detailed reasoning */
  detailedReasoning: string[];

  /** How the sauce enhances the dish */
  enhancement: {
    powerBoost?: number; // Percentage boost to P=IV power
    efficiencyImprovement?: number; // Circuit efficiency improvement
    elementalBalance?: string; // How it balances elements
    thermalEffect?: string; // Heating/cooling effect
  };

  /** Suggested application */
  application?: {
    amount?: string;
    timing?: string; // When to add (before, during, after cooking)
    technique?: string; // How to apply
  };
}

// ========== SAUCE RECOMMENDATION FUNCTIONS ==========

/**
 * Generate intelligent sauce recommendations
 */
export function recommendSauces(
  criteria: SauceRecommendationCriteria,
  availableSauces: Sauce[],
): SauceRecommendationResult[] {
  const {
    targetElementalProperties,
    targetAlchemicalProperties,
    targetThermodynamicProperties,
    targetKineticProperties,
    sauceRole = "complement",
    maxRecommendations = 5,
    minCompatibilityThreshold = 0.4,
    userPreferences,
  } = criteria;

  // Score each sauce
  const scoredSauces: SauceRecommendationResult[] = availableSauces
    .map((sauce) => {
      const detailedReasoning: string[] = [];

      // 1. Elemental Compatibility
      const elementalScore = calculateElementalSauceCompatibility(
        targetElementalProperties,
        sauce.elementalProperties,
        sauceRole,
        detailedReasoning,
      );

      // 2. Alchemical Compatibility (if available)
      let alchemicalScore: number | undefined;
      if (targetAlchemicalProperties && sauce.alchemicalProperties) {
        alchemicalScore = calculateAlchemicalSauceCompatibility(
          targetAlchemicalProperties,
          sauce.alchemicalProperties,
          sauceRole,
          detailedReasoning,
        );
      }

      // 3. Thermodynamic Compatibility (if available)
      let thermodynamicScore: number | undefined;
      if (targetThermodynamicProperties && sauce.thermodynamicProperties) {
        thermodynamicScore = calculateThermodynamicSauceCompatibility(
          targetThermodynamicProperties,
          sauce.thermodynamicProperties,
          sauceRole,
          detailedReasoning,
        );
      }

      // 4. Kinetic/Circuit Compatibility (if available)
      let kineticScore: number | undefined;
      let circuitOptimizationScore: number | undefined;
      if (targetKineticProperties && sauce.kineticProperties) {
        kineticScore = calculateKineticSauceCompatibility(
          targetKineticProperties,
          sauce.kineticProperties,
          sauceRole,
          detailedReasoning,
        );

        circuitOptimizationScore = calculateCircuitOptimization(
          targetKineticProperties,
          sauce.kineticProperties,
          detailedReasoning,
        );
      }

      // 5. User Preference Filtering
      let userPreferenceScore = 1.0;
      if (userPreferences) {
        userPreferenceScore = applyUserPreferences(
          sauce,
          userPreferences,
          detailedReasoning,
        );
      }

      // Calculate overall compatibility score
      const weights = {
        elemental: 0.35,
        alchemical: alchemicalScore !== undefined ? 0.20 : 0,
        thermodynamic: thermodynamicScore !== undefined ? 0.15 : 0,
        kinetic: kineticScore !== undefined ? 0.15 : 0,
        circuit: circuitOptimizationScore !== undefined ? 0.15 : 0,
      };

      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

      const compatibilityScore =
        ((elementalScore * weights.elemental +
          (alchemicalScore || 0) * weights.alchemical +
          (thermodynamicScore || 0) * weights.thermodynamic +
          (kineticScore || 0) * weights.kinetic +
          (circuitOptimizationScore || 0) * weights.circuit) /
          totalWeight) *
        userPreferenceScore;

      // Generate main reason
      const reason = generateSauceReason(
        sauce,
        sauceRole,
        compatibilityScore,
        elementalScore,
        alchemicalScore,
      );

      // Calculate enhancement metrics
      const enhancement = calculateSauceEnhancement(
        sauce,
        targetKineticProperties,
        targetElementalProperties,
      );

      // Generate application suggestions
      const application = generateApplicationSuggestions(sauce, sauceRole);

      return {
        sauce,
        compatibilityScore,
        compatibility: {
          elemental: elementalScore,
          alchemical: alchemicalScore,
          thermodynamic: thermodynamicScore,
          kinetic: kineticScore,
          circuitOptimization: circuitOptimizationScore,
        },
        reason,
        detailedReasoning,
        enhancement,
        application,
      };
    })
    // Filter by threshold
    .filter((result) => result.compatibilityScore >= minCompatibilityThreshold)
    // Sort by compatibility score
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    // Take top N
    .slice(0, maxRecommendations);

  return scoredSauces;
}

// ========== COMPATIBILITY CALCULATION FUNCTIONS ==========

/**
 * Calculate elemental sauce compatibility
 */
function calculateElementalSauceCompatibility(
  targetElementals: ElementalProperties,
  sauceElementals: ElementalProperties,
  role: SauceRecommendationCriteria["sauceRole"],
  reasoning: string[],
): number {
  // Base cosine similarity
  const baseSimilarity = calculateElementalCompatibility(
    targetElementals,
    sauceElementals,
  );

  let adjustedScore = baseSimilarity;

  if (role === "complement") {
    // For complement, prefer similar elemental profiles
    adjustedScore = baseSimilarity;
    if (baseSimilarity > 0.8) {
      reasoning.push("✓ Elemental properties closely aligned - excellent complement");
    } else if (baseSimilarity > 0.6) {
      reasoning.push("✓ Good elemental harmony");
    }
  } else if (role === "contrast") {
    // For contrast, prefer different but balanced elemental profiles
    adjustedScore = 1 - baseSimilarity * 0.5; // Invert but dampen
    if (baseSimilarity < 0.4) {
      reasoning.push("✓ Strong elemental contrast provides balance");
    } else if (baseSimilarity < 0.6) {
      reasoning.push("✓ Moderate elemental contrast");
    }
  } else if (role === "enhance") {
    // For enhance, prefer sauces that boost dominant elements
    const targetDominant = getDominantElement(targetElementals);
    const sauceValue = sauceElementals[targetDominant];
    adjustedScore = baseSimilarity * 0.6 + sauceValue * 0.4;
    if (sauceValue > 0.35) {
      reasoning.push(`✓ Enhances dominant ${targetDominant} element`);
    }
  } else if (role === "balance") {
    // For balance, prefer sauces strong in weak elements
    const targetWeak = getWeakestElement(targetElementals);
    const sauceValue = sauceElementals[targetWeak];
    adjustedScore = sauceValue;
    if (sauceValue > 0.3) {
      reasoning.push(`✓ Balances weak ${targetWeak} element`);
    }
  }

  return Math.max(0, Math.min(1, adjustedScore));
}

/**
 * Calculate alchemical sauce compatibility
 */
function calculateAlchemicalSauceCompatibility(
  targetAlchemical: AlchemicalProperties,
  sauceAlchemical: AlchemicalProperties,
  role: SauceRecommendationCriteria["sauceRole"],
  reasoning: string[],
): number {
  const properties: Array<keyof AlchemicalProperties> = [
    "Spirit",
    "Essence",
    "Matter",
    "Substance",
  ];

  let totalDiff = 0;
  properties.forEach((prop) => {
    const diff = Math.abs(targetAlchemical[prop] - sauceAlchemical[prop]);
    totalDiff += diff;
  });

  const avgDiff = totalDiff / properties.length;
  let score = 1 - avgDiff / 10; // Normalize

  if (role === "contrast") {
    // For contrast, prefer some difference
    if (avgDiff > 2 && avgDiff < 5) {
      score *= 1.2;
      reasoning.push("✓ Alchemical contrast provides depth");
    }
  } else if (role === "complement") {
    // For complement, prefer similarity
    if (avgDiff < 2) {
      reasoning.push("✓ Alchemical properties well-matched");
    }
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate thermodynamic sauce compatibility
 */
function calculateThermodynamicSauceCompatibility(
  targetThermo: ThermodynamicProperties,
  sauceThermo: ThermodynamicProperties,
  role: SauceRecommendationCriteria["sauceRole"],
  reasoning: string[],
): number {
  // Compare Heat, Entropy, Reactivity
  const heatDiff = Math.abs(targetThermo.heat - sauceThermo.heat);
  const entropyDiff = Math.abs(targetThermo.entropy - sauceThermo.entropy);
  const reactivityDiff = Math.abs(targetThermo.reactivity - sauceThermo.reactivity);

  let score = 0;

  if (role === "complement") {
    // Prefer similar thermodynamics
    score = 1 - (heatDiff * 0.4 + entropyDiff * 0.3 + reactivityDiff * 0.3);
  } else if (role === "balance") {
    // Prefer opposite heat but similar complexity
    const heatBalance = heatDiff > 0.1 ? 1.0 : 0.5;
    const complexityMatch = 1 - (entropyDiff + reactivityDiff) / 2;
    score = heatBalance * 0.6 + complexityMatch * 0.4;
    if (heatDiff > 0.1) {
      reasoning.push("✓ Thermal balance - sauce moderates dish temperature");
    }
  } else {
    score = 1 - (heatDiff + entropyDiff + reactivityDiff) / 3;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate kinetic sauce compatibility
 */
function calculateKineticSauceCompatibility(
  targetKinetics: KineticMetrics,
  sauceKinetics: KineticMetrics,
  role: SauceRecommendationCriteria["sauceRole"],
  reasoning: string[],
): number {
  // Compare force classification
  let forceScore = 0;
  if (targetKinetics.forceClassification === sauceKinetics.forceClassification) {
    forceScore = 1.0;
  } else if (
    (targetKinetics.forceClassification === "accelerating" &&
      sauceKinetics.forceClassification === "balanced") ||
    (targetKinetics.forceClassification === "decelerating" &&
      sauceKinetics.forceClassification === "balanced")
  ) {
    forceScore = 0.8;
  } else {
    forceScore = 0.5;
  }

  // Compare thermal direction
  let thermalScore = 0;
  if (role === "balance" || role === "contrast") {
    // Prefer opposite thermal direction for balance
    if (
      (targetKinetics.thermalDirection === "heating" &&
        sauceKinetics.thermalDirection === "cooling") ||
      (targetKinetics.thermalDirection === "cooling" &&
        sauceKinetics.thermalDirection === "heating")
    ) {
      thermalScore = 1.0;
      reasoning.push("✓ Thermal contrast provides balance");
    } else {
      thermalScore = 0.6;
    }
  } else {
    // Prefer same thermal direction for complement/enhance
    thermalScore =
      targetKinetics.thermalDirection === sauceKinetics.thermalDirection ? 1.0 : 0.5;
  }

  // Compare power levels (sauces should generally be lower power)
  const powerRatio = sauceKinetics.power / Math.max(targetKinetics.power, 1);
  const powerScore = powerRatio < 0.5 ? 1.0 : 1.0 - (powerRatio - 0.5);

  return forceScore * 0.4 + thermalScore * 0.3 + powerScore * 0.3;
}

/**
 * Calculate circuit optimization from sauce addition
 */
function calculateCircuitOptimization(
  targetKinetics: KineticMetrics,
  sauceKinetics: KineticMetrics,
  reasoning: string[],
): number {
  // Sauce should improve circuit efficiency
  const targetPower = targetKinetics.power;
  const saucePower = sauceKinetics.power;

  // Calculate potential efficiency boost
  // Ideal sauce adds 10-25% power without increasing losses proportionally
  const powerBoostRatio = saucePower / targetPower;

  let optimizationScore = 0;

  if (powerBoostRatio > 0.1 && powerBoostRatio < 0.25) {
    optimizationScore = 1.0;
    reasoning.push("⚡ Optimal power boost (10-25%) improves circuit efficiency");
  } else if (powerBoostRatio > 0.05 && powerBoostRatio < 0.35) {
    optimizationScore = 0.8;
    reasoning.push("✓ Moderate power boost enhances dish");
  } else if (powerBoostRatio < 0.05) {
    optimizationScore = 0.5;
    reasoning.push("Subtle power addition - minimal circuit impact");
  } else {
    optimizationScore = 0.3;
    reasoning.push("⚠️ High power sauce may overwhelm dish");
  }

  // Bonus for matching current flow direction
  if (
    Math.sign(targetKinetics.currentFlow) ===
    Math.sign(sauceKinetics.currentFlow)
  ) {
    optimizationScore *= 1.1;
  }

  return Math.max(0, Math.min(1, optimizationScore));
}

/**
 * Apply user preference filters
 */
function applyUserPreferences(
  sauce: Sauce,
  preferences: NonNullable<SauceRecommendationCriteria["userPreferences"]>,
  reasoning: string[],
): number {
  let score = 1.0;

  // Check preferred flavor profiles
  if (preferences.preferredFlavorProfiles && sauce.flavorTags) {
    const hasPreferred = preferences.preferredFlavorProfiles.some((pref) =>
      sauce.flavorTags!.includes(pref)
    );
    if (hasPreferred) {
      score *= 1.2;
      reasoning.push("✓ Matches your flavor preferences");
    }
  }

  // Check avoided flavor profiles
  if (preferences.avoidFlavorProfiles && sauce.flavorTags) {
    const hasAvoided = preferences.avoidFlavorProfiles.some((avoid) =>
      sauce.flavorTags!.includes(avoid)
    );
    if (hasAvoided) {
      score *= 0.3;
      reasoning.push("⚠️ Contains flavor profile you typically avoid");
    }
  }

  // Check spice tolerance
  if (preferences.spiceTolerance && sauce.flavorTags) {
    const isSpicy = sauce.flavorTags.includes("spicy") || sauce.flavorTags.includes("hot");
    if (isSpicy && preferences.spiceTolerance === "low") {
      score *= 0.5;
      reasoning.push("⚠️ Spice level may exceed your tolerance");
    } else if (isSpicy && preferences.spiceTolerance === "high") {
      score *= 1.1;
      reasoning.push("✓ Spice level suits your preference");
    }
  }

  return Math.max(0, Math.min(1.5, score));
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get dominant element from elemental properties
 */
function getDominantElement(elementals: ElementalProperties): keyof ElementalProperties {
  const elements: Array<keyof ElementalProperties> = ["Fire", "Water", "Earth", "Air"];
  let maxElement: keyof ElementalProperties = "Fire";
  let maxValue = 0;

  elements.forEach((element) => {
    if (elementals[element] > maxValue) {
      maxValue = elementals[element];
      maxElement = element;
    }
  });

  return maxElement;
}

/**
 * Get weakest element from elemental properties
 */
function getWeakestElement(elementals: ElementalProperties): keyof ElementalProperties {
  const elements: Array<keyof ElementalProperties> = ["Fire", "Water", "Earth", "Air"];
  let minElement: keyof ElementalProperties = "Fire";
  let minValue = 1;

  elements.forEach((element) => {
    if (elementals[element] < minValue) {
      minValue = elementals[element];
      minElement = element;
    }
  });

  return minElement;
}

/**
 * Generate main recommendation reason
 */
function generateSauceReason(
  sauce: Sauce,
  role: SauceRecommendationCriteria["sauceRole"],
  overallScore: number,
  elementalScore: number,
  alchemicalScore?: number,
): string {
  if (overallScore > 0.85) {
    return `Exceptional ${role} - perfectly balances ${sauce.flavorTags?.join(", ") || "flavors"}`;
  } else if (overallScore > 0.7) {
    return `Strong ${role} - enhances dish with ${sauce.flavorTags?.[0] || "complementary"} notes`;
  } else if (overallScore > 0.55) {
    return `Good ${role} - adds ${sauce.flavorTags?.[0] || "interesting"} dimension`;
  } else {
    return `Moderate ${role} - provides variety`;
  }
}

/**
 * Calculate sauce enhancement metrics
 */
function calculateSauceEnhancement(
  sauce: Sauce,
  targetKinetics?: KineticMetrics,
  targetElementals?: ElementalProperties,
): SauceRecommendationResult["enhancement"] {
  const enhancement: SauceRecommendationResult["enhancement"] = {};

  // Power boost
  if (targetKinetics && sauce.kineticProperties) {
    const powerBoost =
      (sauce.kineticProperties.power / targetKinetics.power) * 100;
    enhancement.powerBoost = Math.round(powerBoost);
  }

  // Efficiency improvement (estimated)
  if (sauce.kineticProperties) {
    enhancement.efficiencyImprovement = 5; // Sauces typically add 5-10% efficiency
  }

  // Elemental balance
  if (targetElementals && sauce.elementalProperties) {
    const dominant = getDominantElement(sauce.elementalProperties);
    enhancement.elementalBalance = `Boosts ${dominant} element`;
  }

  // Thermal effect
  if (sauce.kineticProperties) {
    enhancement.thermalEffect = sauce.kineticProperties.thermalDirection;
  } else if (sauce.elementalProperties) {
    // Estimate from elemental properties
    if (sauce.elementalProperties.Fire > 0.35) {
      enhancement.thermalEffect = "heating";
    } else if (sauce.elementalProperties.Water > 0.35) {
      enhancement.thermalEffect = "cooling";
    } else {
      enhancement.thermalEffect = "stable";
    }
  }

  return enhancement;
}

/**
 * Generate application suggestions
 */
function generateApplicationSuggestions(
  sauce: Sauce,
  role: SauceRecommendationCriteria["sauceRole"],
): SauceRecommendationResult["application"] {
  // Basic suggestions - could be expanded with sauce-specific logic
  const suggestions: SauceRecommendationResult["application"] = {};

  if (role === "enhance") {
    suggestions.timing = "during cooking";
    suggestions.technique = "incorporate into dish";
    suggestions.amount = "moderate";
  } else if (role === "complement") {
    suggestions.timing = "after cooking";
    suggestions.technique = "serve alongside";
    suggestions.amount = "generous";
  } else if (role === "contrast") {
    suggestions.timing = "after cooking";
    suggestions.technique = "drizzle on top";
    suggestions.amount = "light";
  } else {
    suggestions.timing = "flexible";
    suggestions.technique = "adjust to preference";
    suggestions.amount = "to taste";
  }

  return suggestions;
}
