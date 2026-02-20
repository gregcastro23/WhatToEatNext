import type {
  CookingMethod,
  ElementalProperties,
  ZodiacSignType,
  ThermodynamicProperties,
} from "./shared";

/**
 * P=IV Circuit Model parameters for a cooking method.
 *
 * Maps physical cooking properties to an electrical circuit analogy:
 * - Voltage (V): Temperature differential / intensity of heat source
 * - Current (I): Rate of heat transfer to food
 * - Resistance (R): Insulation / surface area factors that impede transfer
 * - Power (P = V × I): Total energy transfer rate
 *
 * Kinetic properties describe the method's transformative dynamics:
 * - Velocity: Speed of food state transformation
 * - Momentum retention: Carry-over cooking potential after heat removal
 * - Force impact: Structural impact on food (how much the method changes texture/structure)
 */
export interface CookingMethodKineticProfile {
  /** Temperature differential intensity (0-1). Voltage in P=IV model. */
  voltage: number;
  /** Heat transfer rate (0-1). Current in P=IV model. */
  current: number;
  /** Insulation/surface area resistance (0-1). Higher = more energy loss. */
  resistance: number;
  /** Speed of food transformation (0-1). */
  velocityFactor: number;
  /** Carry-over cooking potential (0-1). How much cooking continues after removal from heat. */
  momentumRetention: number;
  /** Structural impact on food (0-1). How much the method changes food structure. */
  forceImpact: number;
}

/**
 * Interface defining the structure of cooking method data
 */
export interface CookingMethodData {
  name: CookingMethod;
  description: string;
  elementalEffect: ElementalProperties;
  elementalProperties?: ElementalProperties; // Some methods use this property name instead
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];

  // Optional properties
  astrologicalInfluences?: {
    favorableZodiac?: any[];
    unfavorableZodiac?: any[];
    lunarPhaseEffect?: Record<string, number>;
    dominantPlanets?: string[];
    rulingPlanets?: string[];
  };

  thermodynamicProperties?: ThermodynamicProperties;

  toolsRequired?: string[];
  commonMistakes?: string[];
  pairingSuggestions?: string[];
  chemicalChanges?: Record<string, boolean>;
  optimalTemperatures?: Record<string, number>;
  nutrientRetention?: Record<string, number>;
  regionalVariations?: Record<string, string[]>;
  safetyFeatures?: string[];

  // Additional fields that may be used in the application
  culturalOrigin?: string;
  bestFor?: string[];
  seasonalPreference?: string[];
  variations?: CookingMethodData[];
  relatedToMainMethod?: string;

  // Fields used for scoring and recommendations
  score?: number;
  scoreDetails?: Record<string, number>;
  planetaryAffinity?: number;

  // Additional metadata
  history?: string;
  modernVariations?: string[];
  scientificPrinciples?: string[];
  sustainabilityRating?: number;
  equipmentComplexity?: number;
  healthConsiderations?: string[];

  // Detailed cooking technique information
  expertTips?: string[];
  ingredientPreparation?: Record<string, string>;
  timingConsiderations?: Record<string, string>;
  doneness_indicators?: Record<string, string>;
  ingredientInteractions?: Record<string, string>;
  technicalNotes?: Record<string, Record<string, string>>;

  // Alchemical aspects for advanced cooking methods
  alchemicalAspects?: Record<string, Record<string, string>>;

  // P=IV Circuit Model kinetic profile
  kineticProfile?: CookingMethodKineticProfile;
}

// Export alias for compatibility
export type { CookingMethod } from "./shared";
