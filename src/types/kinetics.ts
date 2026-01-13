/**
 * 🌟 Planetary Kinetics API Types
 * Real-time consciousness dynamics and aspect calculations
 */

import type { Element } from "@/types/celestial";

export interface KineticsLocation {
  lat: number;
  lon: number;
}

export interface KineticsOptions {
  includeAgentOptimization?: boolean;
  includePowerPrediction?: boolean;
  includeResonanceMap?: boolean;
  agentIds?: string[];
}

export interface KineticsPowerData {
  hour: number;
  power: number;
  planetary: string;
}

export interface KineticsTimingData {
  planetaryHours: string[];
  seasonalInfluence: "Winter" | "Spring" | "Summer" | "Autumn";
}

export interface KineticsElementalTotals {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

export interface KineticsBaseData {
  power: KineticsPowerData[];
  timing: KineticsTimingData;
  elemental: {
    totals: KineticsElementalTotals;
  };
}

export interface KineticsAgentOptimization {
  recommendedAgents: string[];
  powerAmplification: number;
  harmonyScore: number;
}

export interface KineticsPowerPrediction {
  nextPeak: string; // ISO date string
  trend: "ascending" | "stable" | "descending";
  confidence: number;
}

export interface KineticsResonanceMap {
  [agentId: string]: {
    resonance: number;
    compatibility: number;
  };
}

export interface KineticsResponseData {
  base: KineticsBaseData;
  agentOptimization?: KineticsAgentOptimization;
  powerPrediction?: KineticsPowerPrediction;
  resonanceMap?: KineticsResonanceMap;
}

export interface KineticsResponse {
  success: boolean;
  data: KineticsResponseData;
  computeTimeMs: number;
  cacheHit: boolean;
  metadata: {
    timestamp: string;
  };
}

export interface KineticsRequest {
  location: KineticsLocation;
  options?: KineticsOptions;
}

// Group Dynamics Types
export interface GroupDynamicsRequest {
  agentIds: string[];
  location: KineticsLocation;
}

export interface GroupDynamicsData {
  harmony: number;
  powerAmplification: number;
  momentumFlow: "accelerating" | "sustained" | "decelerating";
  groupResonance: number;
  individualContributions: {
    [agentId: string]: {
      powerContribution: number;
      harmonyImpact: number;
    };
  };
}

export interface GroupDynamicsResponse {
  success: boolean;
  data: GroupDynamicsData;
  computeTimeMs: number;
  cacheHit: boolean;
  metadata: {
    timestamp: string;
  };
}

// Food Recommendation Integration Types
export type FoodEnergyCategory = "energizing" | "grounding" | "balanced";
export interface TemporalFoodRecommendation {
  categories: string[];
  timing: string;
  note: string;
  powerLevel: number;
  dominantElement: keyof KineticsElementalTotals;
  optimalMealTimes?: string[];
  energyPhase?: string;
}

export interface AspectPhase {
  type: "applying" | "exact" | "separating";
  description: string;
  velocityBoost?: number;
  powerBoost?: number;
}

export interface KineticMetrics {
  velocity: Record<Element, number>; // Per-element d(element)/dt
  momentum: Record<Element, number>; // p = inertia × velocity
  charge: number; // Q = Matter + Substance
  potentialDifference: number; // V = Greg's Energy / Q
  currentFlow: number; // I = Reactivity × (dQ/dt)
  power: number; // P = I × V
  potential?: number; // Additional potential energy
  base?: number; // Base kinetic value
  inertia: number; // 1 + (Matter + Earth + Substance/2) × modifier
  force: Record<Element, number>; // Per-element F (kinetic + electromagnetic)
  forceMagnitude: number; // sqrt(sum(F²))
  forceClassification: "accelerating" | "decelerating" | "balanced";
  aspectPhase: AspectPhase | null;
  thermalDirection: "heating" | "cooling" | "stable";
}

export interface KineticsEnhancedRecommendation
  extends TemporalFoodRecommendation {
  aspectPhase?: AspectPhase;
  groupHarmony?: number;
  portionModifier: number;
  seasonalTags: string[];
}

// Cache Types
export interface KineticsCacheEntry {
  data: KineticsResponse;
  timestamp: number;
}

// Error Types
export interface KineticsError extends Error {
  statusCode?: number;
  isKineticsError: true;
}

// Client Configuration
export interface KineticsClientConfig {
  baseUrl: string;
  cacheTTL: number;
  timeout: number;
  retryAttempts: number;
}

// ============================================================================
// Circuit Model Types
// Extended circuit metrics for meal and menu analysis
// ============================================================================

import type { DayOfWeek, MealType } from "./menuPlanner";
import type { Recipe } from "./recipe";

/**
 * Meal Circuit Metrics
 * Aggregate circuit properties for a single meal slot
 */
export interface MealCircuitMetrics {
  // Identity
  mealSlotId: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;

  // Circuit Properties (from recipe)
  charge: number; // Q = Matter + Substance
  potentialDifference: number; // V = Greg's Energy / Q
  currentFlow: number; // I = Reactivity × (dQ/dt)
  power: number; // P = I × V
  resistance: number; // R = Entropy
  powerLosses: number; // I² × R
  efficiency: number; // η = (P - Losses) / P

  // Kinetic Properties
  kinetics: KineticMetrics;

  // Validation
  isValid: boolean;
  validationErrors: string[];

  // Timestamp
  calculatedAt: Date;
}

/**
 * Day Circuit Metrics
 * Aggregate circuit properties for all 4 meals in a day
 */
export interface DayCircuitMetrics {
  // Identity
  dayOfWeek: DayOfWeek;
  date: Date;

  // Meal Circuits (4 slots)
  meals: {
    breakfast: MealCircuitMetrics | null;
    lunch: MealCircuitMetrics | null;
    dinner: MealCircuitMetrics | null;
    snack: MealCircuitMetrics | null;
  };

  // Series Connection Properties (temporal sequence)
  totalCharge: number; // Sum of all charges
  totalResistance: number; // R₁ + R₂ + R₃ + R₄
  averageCurrent: number; // Mean current flow
  totalVoltage: number; // V₁ + V₂ + V₃ + V₄
  totalPower: number; // Sum of all powers
  totalLosses: number; // Sum of all losses
  dayEfficiency: number; // Total output / Total input

  // Energy Balance
  inputEnergy: number; // Total calories + alchemical input
  outputEnergy: number; // Kinetic work + heat
  netEnergy: number; // Input - Output

  // Kinetic Aggregate
  netMomentum: Record<Element, number>; // Sum of elemental momenta
  netForce: Record<Element, number>; // Sum of elemental forces
  thermalBalance: "heating" | "cooling" | "stable";

  // Planetary Influence
  dominantPlanet: string;
  planetaryHarmony: number; // 0-1 score

  // Validation
  isPowerBalanced: boolean; // KCL/KVL validation
  balanceDeviation: number; // % deviation from ideal

  calculatedAt: Date;
}

/**
 * Circuit Bottleneck
 * Identified inefficiency in the meal circuit
 */
export interface CircuitBottleneck {
  mealSlotId: string;
  reason: string;
  impactScore: number; // 0-1 (how much it affects overall)
}

/**
 * Circuit Improvement Suggestion
 * Recommended change to improve circuit efficiency
 */
export interface CircuitImprovementSuggestion {
  type: "add_meal" | "remove_meal" | "swap_meals" | "adjust_servings";
  targetSlotId: string;
  suggestedRecipe?: Recipe;
  expectedImprovement: number; // % improvement in efficiency
  reason: string;
}

/**
 * Weekly Menu Circuit Metrics
 * Complete circuit network for all 28 meal slots
 */
export interface WeeklyMenuCircuitMetrics {
  // Identity
  weekStartDate: Date;
  weekEndDate: Date;
  menuId: string;

  // Day Circuits (7 days)
  days: {
    sunday: DayCircuitMetrics;
    monday: DayCircuitMetrics;
    tuesday: DayCircuitMetrics;
    wednesday: DayCircuitMetrics;
    thursday: DayCircuitMetrics;
    friday: DayCircuitMetrics;
    saturday: DayCircuitMetrics;
  };

  // Weekly Aggregate Properties
  totalWeekCharge: number;
  totalWeekPower: number;
  totalWeekLosses: number;
  weekEfficiency: number; // Overall efficiency

  // Network Topology
  parallelDays: number; // Days with concurrent power paths
  seriesDays: number; // Days in strict sequence
  networkComplexity: number; // Graph complexity metric

  // Power Flow Analysis
  powerDistribution: {
    morning: number; // % power in breakfast
    midday: number; // % power in lunch
    evening: number; // % power in dinner
    snacks: number; // % power in snacks
  };

  // Elemental Balance
  weeklyElementalBalance: Record<Element, number>;
  elementalHarmony: number; // 0-1 score

  // Kinetic Summary
  weeklyMomentum: Record<Element, number>;
  weeklyForce: Record<Element, number>;
  weeklyThermalDirection: "heating" | "cooling" | "stable";

  // Optimization Metrics
  bottlenecks: CircuitBottleneck[];
  improvementSuggestions: CircuitImprovementSuggestion[];

  // Validation
  isFullyBalanced: boolean;
  weeklyKCLViolations: number; // Count of KCL violations
  weeklyKVLViolations: number; // Count of KVL violations

  calculatedAt: Date;
}

/**
 * Circuit Optimization Goal
 * User-defined optimization criteria
 */
export interface CircuitOptimizationGoal {
  priority:
    | "maximize_power"
    | "maximize_efficiency"
    | "minimize_losses"
    | "balance_elements"
    | "balance_thermal"
    | "custom";

  customWeights?: {
    power: number; // 0-1 weight
    efficiency: number;
    elementalBalance: number;
    kineticBalance: number;
    planetaryHarmony: number;
  };

  constraints?: {
    minEfficiency?: number; // e.g., 0.7 = 70% minimum
    maxLosses?: number; // e.g., 10 Watts max
    requiredElements?: Element[]; // Must include these elements
    avoidOverheating?: boolean; // Thermal constraint
  };
}
