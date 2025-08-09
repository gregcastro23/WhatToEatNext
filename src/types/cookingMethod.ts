import type {
  CookingMethod,
  ElementalProperties,
  ZodiacSign,
  ThermodynamicProperties,
} from './shared';

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
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
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
}

// Export alias for compatibility
export type { CookingMethod } from './shared';
