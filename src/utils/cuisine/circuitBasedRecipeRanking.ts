/**
 * Circuit-Based Recipe Ranking Module
 *
 * Ranks nested recipes using P=IV circuit model for optimal compatibility.
 * Validates power conservation, circuit efficiency, and kinetic alignment.
 *
 * Part of the enhanced cuisine recommender system.
 */

import type { Recipe } from "@/types/recipe";
import type { KineticMetrics } from "@/types/kinetics";
import type {
  ElementalProperties,
  AlchemicalProperties,
} from "@/types/hierarchy";
import {
  validateRecipeCircuit,
  validateMultiRecipeCircuit,
  calculateKineticsCompatibility,
  type CircuitValidationResult,
} from "@/utils/recipeCircuit";

// ========== TYPE DEFINITIONS ==========

export interface RecipeWithKinetics extends Recipe {
  /** Recipe's computed kinetic properties */
  kineticProperties: KineticMetrics;

  /** Recipe's alchemical properties */
  alchemicalProperties?: AlchemicalProperties;
}

export interface CircuitRankingCriteria {
  /** User's current kinetic state */
  userKinetics: KineticMetrics;

  /** Desired meal type (filters recipes) */
  mealType?: string;

  /** Desired energy level (0-1 scale) */
  desiredEnergyLevel?: number;

  /** Maximum recipes to return */
  maxRecipes?: number;

  /** Minimum circuit efficiency threshold */
  minEfficiencyThreshold?: number;
}

export interface RankedRecipeResult {
  /** The recipe */
  recipe: RecipeWithKinetics;

  /** Circuit validation result */
  circuitValidation: CircuitValidationResult;

  /** Kinetics compatibility score (0-1) */
  kineticsCompatibility: number;

  /** Power transfer efficiency */
  powerEfficiency: number;

  /** Overall ranking score (0-1) */
  overallScore: number;

  /** Ranking reasoning */
  reasoning: string[];

  /** Recommended serving adjustments */
  servingAdjustment?: {
    originalServings: number;
    recommendedServings: number;
    reason: string;
  };
}

export interface MultiCourseValidationResult {
  /** Whether multi-course power conservation is valid */
  isValid: boolean;

  /** Total input power */
  totalInputPower: number;

  /** Total output power */
  totalOutputPower: number;

  /** Total power losses */
  totalLosses: number;

  /** Overall efficiency */
  overallEfficiency: number;

  /** Per-course breakdown */
  courseBreakdown: Array<{
    courseName: string;
    recipe: Recipe;
    inputPower: number;
    outputPower: number;
    losses: number;
    efficiency: number;
  }>;

  /** Warnings or recommendations */
  warnings: string[];
}

// ========== RECIPE RANKING FUNCTIONS ==========

/**
 * Rank recipes using P=IV circuit model
 */
export function rankRecipesByCircuitCompatibility(
  recipes: RecipeWithKinetics[],
  criteria: CircuitRankingCriteria,
): RankedRecipeResult[] {
  const {
    userKinetics,
    mealType,
    desiredEnergyLevel = 0.5,
    maxRecipes = 10,
    minEfficiencyThreshold = 0.5,
  } = criteria;

  // Filter by meal type if specified
  let filteredRecipes = recipes;
  if (mealType) {
    filteredRecipes = recipes.filter(
      (r) =>
        r.mealType &&
        Array.isArray(r.mealType) &&
        r.mealType.some((mt) =>
          mt.toLowerCase().includes(mealType.toLowerCase()),
        ),
    );
  }

  // Rank each recipe
  const rankedRecipes: RankedRecipeResult[] = filteredRecipes
    .map((recipe) => {
      const reasoning: string[] = [];

      // 1. Validate circuit
      const circuitValidation = validateRecipeCircuit(
        recipe.kineticProperties,
        recipe,
      );

      if (!circuitValidation.isValid) {
        reasoning.push(
          "⚠️ Circuit power conservation violated - unstable recipe",
        );
      } else if (circuitValidation.efficiency > 0.9) {
        reasoning.push(
          "⚡ Exceptional circuit efficiency - minimal energy losses",
        );
      }

      // 2. Calculate kinetics compatibility
      const kineticsCompatibility = calculateKineticsCompatibility(
        recipe.kineticProperties,
        recipe,
      );

      if (kineticsCompatibility > 0.8) {
        reasoning.push("✓ Strong kinetic alignment with cooking method");
      } else if (kineticsCompatibility < 0.4) {
        reasoning.push("⚠️ Kinetic properties may not suit cooking method");
      }

      // 3. Calculate power efficiency
      const powerEfficiency = circuitValidation.efficiency;

      // 4. Calculate energy level match
      const recipePowerLevel = Math.min(
        recipe.kineticProperties.power / 100,
        1.0,
      );
      const energyLevelMatch =
        1 - Math.abs(recipePowerLevel - desiredEnergyLevel);

      if (energyLevelMatch > 0.8) {
        reasoning.push(
          `⚡ Perfect power level match (${(recipePowerLevel * 100).toFixed(0)}%)`,
        );
      } else if (energyLevelMatch < 0.4) {
        reasoning.push(
          `⚠️ Power level ${recipePowerLevel > desiredEnergyLevel ? "higher" : "lower"} than desired`,
        );
      }

      // 5. Calculate force classification bonus
      let forceBonus = 0;
      if (
        userKinetics.forceClassification ===
        recipe.kineticProperties.forceClassification
      ) {
        forceBonus = 0.15;
        reasoning.push(
          `✓ Force classification match: ${userKinetics.forceClassification}`,
        );
      }

      // 6. Calculate thermal direction bonus
      let thermalBonus = 0;
      if (
        userKinetics.thermalDirection ===
        recipe.kineticProperties.thermalDirection
      ) {
        thermalBonus = 0.1;
        reasoning.push(
          `✓ Thermal direction aligned: ${userKinetics.thermalDirection}`,
        );
      }

      // 7. Calculate overall score
      const overallScore = Math.max(
        0,
        Math.min(
          1,
          powerEfficiency * 0.35 + // 35% weight on efficiency
            kineticsCompatibility * 0.25 + // 25% weight on kinetics
            energyLevelMatch * 0.25 + // 25% weight on energy match
            forceBonus + // 15% bonus
            thermalBonus, // 10% bonus
        ),
      );

      // 8. Calculate serving adjustment if needed
      const servingAdjustment = calculateServingAdjustment(
        recipe,
        userKinetics,
        desiredEnergyLevel,
      );

      return {
        recipe,
        circuitValidation,
        kineticsCompatibility,
        powerEfficiency,
        overallScore,
        reasoning,
        servingAdjustment,
      };
    })
    // Filter by efficiency threshold
    .filter((result) => result.powerEfficiency >= minEfficiencyThreshold)
    // Sort by overall score (highest first)
    .sort((a, b) => b.overallScore - a.overallScore)
    // Take top N
    .slice(0, maxRecipes);

  return rankedRecipes;
}

/**
 * Calculate serving size adjustment based on power matching
 */
function calculateServingAdjustment(
  recipe: RecipeWithKinetics,
  userKinetics: KineticMetrics,
  desiredEnergyLevel: number,
): RankedRecipeResult["servingAdjustment"] {
  const originalServings = Number(recipe.servingSize) || 4;
  const recipePower = recipe.kineticProperties.power;
  const userPower = userKinetics.power;

  // Calculate power ratio
  const powerRatio = userPower / Math.max(recipePower, 1);
  const energyTarget = desiredEnergyLevel * 100; // Scale to 0-100

  // Adjust servings based on power ratio and energy target
  let recommendedServings = originalServings;
  let reason = "";

  if (recipePower > energyTarget * 1.3) {
    // Recipe is too powerful, reduce servings
    recommendedServings = Math.max(1, Math.floor(originalServings * 0.7));
    reason = "Reduced servings to match your desired energy level";
  } else if (recipePower < energyTarget * 0.7) {
    // Recipe is too mild, increase servings
    recommendedServings = Math.ceil(originalServings * 1.3);
    reason = "Increased servings to match your desired energy level";
  } else if (powerRatio < 0.7) {
    // User has low power, reduce servings
    recommendedServings = Math.max(
      1,
      Math.floor(originalServings * powerRatio),
    );
    reason = "Adjusted servings based on your current power capacity";
  }

  if (recommendedServings !== originalServings) {
    return {
      originalServings,
      recommendedServings,
      reason,
    };
  }

  return undefined;
}

// ========== MULTI-COURSE VALIDATION ==========

/**
 * Validate power flow across multiple courses
 * Ensures P=IV circuit conservation for complete meals
 */
export function validateMultiCoursePowerFlow(
  courses: Array<{
    name: string;
    recipe: RecipeWithKinetics;
  }>,
  userKinetics: KineticMetrics,
  options: {
    maxPowerCapacity?: number;
    tolerancePercent?: number;
  } = {},
): MultiCourseValidationResult {
  const {
    maxPowerCapacity = 300, // Default max power for 3-course meal
    tolerancePercent = 5, // 5% tolerance
  } = options;

  const warnings: string[] = [];
  const courseBreakdown: MultiCourseValidationResult["courseBreakdown"] = [];

  let totalInputPower = 0;
  let totalOutputPower = 0;
  let totalLosses = 0;

  // Validate each course
  courses.forEach((course) => {
    const validation = validateRecipeCircuit(
      course.recipe.kineticProperties,
      course.recipe,
    );

    courseBreakdown.push({
      courseName: course.name,
      recipe: course.recipe,
      inputPower: validation.inputPower,
      outputPower: validation.outputPower,
      losses: validation.losses,
      efficiency: validation.efficiency,
    });

    totalInputPower += validation.inputPower;
    totalOutputPower += validation.outputPower;
    totalLosses += validation.losses;

    // Course-level warnings
    if (validation.efficiency < 0.6) {
      warnings.push(
        `${course.name}: Low circuit efficiency (${(validation.efficiency * 100).toFixed(1)}%)`,
      );
    }

    if (!validation.isValid) {
      warnings.push(`${course.name}: Power conservation violated!`);
    }
  });

  // Overall efficiency
  const overallEfficiency =
    totalInputPower > 0 ? totalOutputPower / totalInputPower : 0;

  // Check power capacity
  if (totalInputPower > maxPowerCapacity) {
    warnings.push(
      `Total power (${totalInputPower.toFixed(1)}) exceeds capacity (${maxPowerCapacity}). Consider reducing courses or portions.`,
    );
  }

  // Validate overall conservation
  const tolerance = totalInputPower * (tolerancePercent / 100);
  const isValid =
    Math.abs(totalInputPower - (totalOutputPower + totalLosses)) <= tolerance;

  if (!isValid) {
    warnings.push(
      `Multi-course power conservation violated! Power imbalance: ${(totalInputPower - totalOutputPower - totalLosses).toFixed(2)}`,
    );
  }

  // Check for course balance
  const powerImbalance = courseBreakdown.some(
    (course) =>
      course.inputPower > totalInputPower * 0.6 ||
      course.inputPower < totalInputPower * 0.15,
  );

  if (powerImbalance && courses.length > 1) {
    warnings.push(
      "Power distribution across courses is unbalanced. Consider adjusting portions for better flow.",
    );
  }

  return {
    isValid,
    totalInputPower,
    totalOutputPower,
    totalLosses,
    overallEfficiency,
    courseBreakdown,
    warnings,
  };
}

/**
 * Optimize course sequence for best power flow
 */
export function optimizeCourseSequence(
  courses: Array<{
    name: string;
    recipe: RecipeWithKinetics;
  }>,
): Array<{
  name: string;
  recipe: RecipeWithKinetics;
  sequenceReason: string;
}> {
  if (courses.length <= 1) {
    return courses.map((c) => ({
      ...c,
      sequenceReason: "Single course",
    }));
  }

  // Sort by:
  // 1. Thermal direction (cooling → stable → heating)
  // 2. Power level (low → high)
  // 3. Force classification (decelerating → balanced → accelerating)

  const sortedCourses = [...courses].sort((a, b) => {
    const aKinetics = a.recipe.kineticProperties;
    const bKinetics = b.recipe.kineticProperties;

    // Primary: Thermal direction
    const thermalOrder = { cooling: 0, stable: 1, heating: 2 };
    const thermalDiff =
      thermalOrder[aKinetics.thermalDirection] -
      thermalOrder[bKinetics.thermalDirection];
    if (thermalDiff !== 0) return thermalDiff;

    // Secondary: Power level
    const powerDiff = aKinetics.power - bKinetics.power;
    if (Math.abs(powerDiff) > 10) return powerDiff;

    // Tertiary: Force classification
    const forceOrder = { decelerating: 0, balanced: 1, accelerating: 2 };
    return (
      forceOrder[aKinetics.forceClassification] -
      forceOrder[bKinetics.forceClassification]
    );
  });

  // Add sequencing reasons
  return sortedCourses.map((course, index) => {
    let reason = "";
    const kinetics = course.recipe.kineticProperties;

    if (index === 0) {
      reason = `Opening course: ${kinetics.thermalDirection} thermal direction with ${kinetics.forceClassification} force`;
    } else if (index === sortedCourses.length - 1) {
      reason = `Closing course: ${kinetics.thermalDirection} thermal direction builds to ${kinetics.power.toFixed(0)} power`;
    } else {
      reason = `Middle course: Balanced ${kinetics.forceClassification} progression`;
    }

    return {
      ...course,
      sequenceReason: reason,
    };
  });
}

/**
 * Generate course pairing recommendations
 * Suggests complementary courses based on circuit compatibility
 */
export function generateCoursePairingRecommendations(
  mainCourse: RecipeWithKinetics,
  availableCourses: RecipeWithKinetics[],
  options: {
    targetCourseType?: "appetizer" | "dessert" | "side";
    maxRecommendations?: number;
  } = {},
): RankedRecipeResult[] {
  const { targetCourseType, maxRecommendations = 5 } = options;

  // Filter by course type if specified
  let candidates = availableCourses;
  if (targetCourseType) {
    candidates = availableCourses.filter(
      (recipe) =>
        recipe.mealType &&
        Array.isArray(recipe.mealType) &&
        recipe.mealType.some((mt) =>
          mt.toLowerCase().includes(targetCourseType),
        ),
    );
  }

  // Rank candidates by complementarity with main course
  const ranked = candidates.map((candidate) => {
    const reasoning: string[] = [];

    // Check power balance
    const mainPower = mainCourse.kineticProperties.power;
    const candidatePower = candidate.kineticProperties.power;
    const powerRatio = candidatePower / mainPower;

    let powerScore = 0;
    if (powerRatio > 0.3 && powerRatio < 0.7) {
      powerScore = 0.9;
      reasoning.push("✓ Power level complements main course well");
    } else if (powerRatio > 0.15 && powerRatio < 0.9) {
      powerScore = 0.7;
    } else {
      powerScore = 0.4;
      reasoning.push("⚠️ Power level may overshadow or underwhelm main course");
    }

    // Check thermal complementarity
    let thermalScore = 0;
    if (
      mainCourse.kineticProperties.thermalDirection ===
      candidate.kineticProperties.thermalDirection
    ) {
      thermalScore = 0.8;
      reasoning.push("✓ Thermal direction aligned");
    } else if (
      (mainCourse.kineticProperties.thermalDirection === "heating" &&
        candidate.kineticProperties.thermalDirection === "cooling") ||
      (mainCourse.kineticProperties.thermalDirection === "cooling" &&
        candidate.kineticProperties.thermalDirection === "heating")
    ) {
      thermalScore = 1.0;
      reasoning.push("✓ Excellent thermal contrast provides balance");
    } else {
      thermalScore = 0.6;
    }

    // Check force complementarity
    let forceScore = 0;
    if (mainCourse.kineticProperties.forceClassification === "accelerating") {
      // Pair with balanced or decelerating
      if (candidate.kineticProperties.forceClassification === "decelerating") {
        forceScore = 1.0;
        reasoning.push(
          "✓ Decelerating force balances main course's acceleration",
        );
      } else if (
        candidate.kineticProperties.forceClassification === "balanced"
      ) {
        forceScore = 0.8;
      } else {
        forceScore = 0.5;
      }
    } else if (
      mainCourse.kineticProperties.forceClassification === "decelerating"
    ) {
      // Pair with balanced or accelerating
      if (candidate.kineticProperties.forceClassification === "accelerating") {
        forceScore = 1.0;
        reasoning.push(
          "✓ Accelerating force energizes main course's grounding effect",
        );
      } else if (
        candidate.kineticProperties.forceClassification === "balanced"
      ) {
        forceScore = 0.8;
      } else {
        forceScore = 0.5;
      }
    } else {
      // Balanced main course accepts any pairing
      forceScore = 0.85;
    }

    // Overall score
    const overallScore =
      powerScore * 0.4 + thermalScore * 0.3 + forceScore * 0.3;

    // Mock circuit validation for structure
    const mockCircuitValidation: CircuitValidationResult = {
      isValid: true,
      inputPower: candidatePower,
      outputPower: candidatePower * 0.85,
      losses: candidatePower * 0.15,
      efficiency: 0.85,
    };

    return {
      recipe: candidate,
      circuitValidation: mockCircuitValidation,
      kineticsCompatibility: (powerScore + thermalScore + forceScore) / 3,
      powerEfficiency: 0.85,
      overallScore,
      reasoning,
    };
  });

  // Sort and return top N
  return ranked
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, maxRecommendations);
}
