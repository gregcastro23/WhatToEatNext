import type { 
  CookingMethod, 
  ThermodynamicProperties,
  ZodiacSign,
  PlanetName,
  LunarPhaseWithUnderscores
} from './alchemy';
import type { ElementalProperties } from './elemental';

/**
 * Interface defining the structure of cooking method data
 */
export interface CookingMethodData {
  name: CookingMethod;
  description: string;
  elementalEffect: ElementalProperties;
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];
  
  // Astrological influences with standardized types
  astrologicalInfluences?: {
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
    lunarPhaseEffect?: Record<LunarPhaseWithUnderscores, number>;
    dominantPlanets?: PlanetName[];
    rulingPlanets?: PlanetName[];
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
  
  // Additional fields with standardized types
  culturalOrigin?: string;
  bestFor?: string[];
  seasonalPreference?: string[];
  variations?: CookingMethodVariation[];
  relatedToMainMethod?: CookingMethod;
  
  // Fields used for scoring and recommendations
  score?: number;
  scoreDetails?: Record<string, number>;
  planetaryAffinity?: number;
  
  // Additional metadata with standardized types
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
}

/**
 * Simplified cooking method variation structure for 
 * referencing within CookingMethodData
 */
export interface CookingMethodVariation {
  id: string;
  name: string;
  score?: number;
  description?: string;
}

/**
 * Type to ensure consistent mapping of cooking method keys to names
 */
export type CookingMethodKey = string;

/**
 * Interface for organized collections of cooking methods
 */
export interface CookingMethodCollection {
  [key: CookingMethodKey]: CookingMethodData;
} 