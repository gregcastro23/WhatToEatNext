import { ElementalProperties, ZodiacSign, AlchemicalProperties } from "@/types/alchemy";

// Core thermodynamic properties with strict typing
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy?: number;
  kalchm?: number;
  monica?: number;
}

// Astrological influences with proper typing
export interface AstrologicalInfluences {
  favorableZodiac?: ZodiacSign[];
  unfavorableZodiac?: ZodiacSign[];
  dominantPlanets?: string[];
  lunarPhaseEffect?: Record<string, number>;
  rulingPlanets?: string[];
}

// Duration with proper constraints
export interface CookingDuration {
  min: number;
  max: number;
  unit?: 'minutes' | 'hours' | 'days';
}

// Temperature range with proper typing
export interface TemperatureRange {
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit' | 'kelvin';
}

// Alchemical properties with strict typing
export interface CookingAlchemicalProperties extends AlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

// Elemental effect with proper typing
export interface ElementalEffect extends ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

// Base cooking method interface with strict typing
export interface CookingMethod {
  id: string;
  name: string;
  description: string;
  score?: number;
  
  // Elemental properties
  elementalEffect?: ElementalEffect;
  elementalProperties?: ElementalProperties; // Alternative property name for compatibility
  
  // Duration and timing
  duration?: CookingDuration;
  time_range?: CookingDuration | string;
  
  // Temperature information
  temperature_range?: TemperatureRange | string;
  optimalTemperature?: string;
  
  // Suitability and benefits
  suitable_for?: string[];
  benefits?: string[];
  
  // Alchemical properties
  alchemicalProperties?: CookingAlchemicalProperties;
  alchemical_properties?: Record<string, unknown>; // Legacy property
  
  // Thermodynamic properties
  thermodynamicProperties?: ThermodynamicProperties;
  
  // Astrological influences
  astrologicalInfluences?: AstrologicalInfluences;
  astrologicalInfluence?: string; // Legacy property
  zodiacResonance?: string[];
  planetaryInfluences?: string[];
  
  // Cultural and regional information
  culturalOrigin?: string;
  regionalVariations?: string;
  modernVariations?: string;
  
  // Technical information
  tools?: string[] | string;
  toolsRequired?: string[];
  equipmentComplexity?: string | number;
  
  // Safety and health
  safetyFeatures?: string[];
  health_benefits?: string[] | string;
  health_considerations?: string[] | string;
  
  // Scientific information
  scientificPrinciples?: string[] | string;
  chemicalChanges?: string;
  nutrientRetention?: string;
  
  // Recipe and dish information
  famous_dishes?: string[] | string;
  pairingSuggestions?: string[] | string;
  pAiringSuggestions?: string[] | string; // Legacy typo
  
  // Mistakes and tips
  commonMistakes?: string[] | string;
  
  // History and science
  history?: string;
  science?: string;
  
  // Variations and related methods
  variations?: string[] | CookingMethod[];
  
  // Additional metadata
  complexity?: 'basic' | 'intermediate' | 'advanced' | 'master';
  skillRequirements?: string[];
  equipmentRequired?: string[];
  safetyConsiderations?: string[];
  
  // Enhanced properties for advanced cooking methods
  transformationPotential?: number;
  elementalAmplification?: ElementalProperties;
  energeticSignature?: string;
  harmonyFactor?: number;
  
  // Monica-compatible enhancements
  thermodynamicEfficiency?: number;
  kalchmResonance?: number;
  monicaConstant?: number;
  
  // Elemental transformation tracking
  inputElementalProfile?: ElementalProperties;
  outputElementalProfile?: ElementalProperties;
  transformationMatrix?: number[][];
  
  // Advanced astrological integration
  planetaryAlignment?: Record<string, number>;
  lunarPhaseOptimal?: string[];
  seasonalResonance?: Record<string, number>;
  zodiacCompatibility?: Record<string, number>;
  
  // Scoring and recommendations
  scoreDetails?: Record<string, number>;
  planetaryAffinity?: number;
  
  // Additional metadata
  bestFor?: string[];
  seasonalPreference?: string[];
  relatedToMainMethod?: string;
  sustainabilityRating?: number;
  
  // Detailed cooking technique information
  expertTips?: string[];
  ingredientPreparation?: Record<string, string>;
  timingConsiderations?: Record<string, string>;
  doneness_indicators?: Record<string, string>;
  ingredientInteractions?: Record<string, string>;
  technicalNotes?: Record<string, unknown>;
  
  // Alchemical aspects for advanced cooking methods
  alchemicalAspects?: Record<string, unknown>;
}

// Enhanced cooking method with additional alchemical properties
export interface EnhancedCookingMethod extends CookingMethod {
  // Enhanced alchemical properties
  alchemicalProperties: CookingAlchemicalProperties; // Make required
  
  // Enhanced metadata
  complexity: 'basic' | 'intermediate' | 'advanced' | 'master'; // Make required
  
  // Monica-compatible enhancements
  thermodynamicEfficiency: number; // Make required
  kalchmResonance: number; // Make required
  monicaConstant: number; // Make required
  
  // Elemental transformation tracking
  inputElementalProfile: ElementalProperties; // Make required
  outputElementalProfile: ElementalProperties; // Make required
  transformationMatrix: number[][]; // Make required
  
  // Advanced astrological integration
  planetaryAlignment: Record<string, number>; // Make required
  lunarPhaseOptimal: string[]; // Make required
  seasonalResonance: Record<string, number>; // Make required
  zodiacCompatibility: Record<string, number>; // Make required
}

// Cooking method data for API responses
export interface CookingMethodData extends CookingMethod {
  astrologicalInfluences?: AstrologicalInfluences;
}

// Type for cooking method recommendations
export interface CookingMethodRecommendation {
  method: CookingMethod;
  score: number;
  reason: string;
  compatibility: number;
  cookingTime?: CookingDuration;
  sustainabilityRating?: number;
  equipmentComplexity?: number;
  healthBenefits?: string[];
}

// Type for cooking method compatibility results
export interface CookingMethodCompatibility {
  methodId: string;
  methodName: string;
  compatibility: number;
  elementalMatch: number;
  astrologicalMatch: number;
  seasonalMatch: number;
  reason: string;
}

// Type for cooking method search/filter options
export interface CookingMethodFilterOptions {
  elementalFocus?: keyof ElementalProperties;
  complexity?: CookingMethod['complexity'];
  duration?: {
    min?: number;
    max?: number;
  };
  astrologicalAlignment?: {
    zodiacSign?: ZodiacSign;
    lunarPhase?: string;
    dominantPlanets?: string[];
  };
  culturalOrigin?: string;
  availableTools?: string[];
  dietaryRestrictions?: string[];
}

// Type for cooking method scoring details
export interface CookingMethodScoreDetails {
  elemental?: number;
  astrological?: number;
  seasonal?: number;
  tools?: number;
  dietary?: number;
  cultural?: number;
  lunar?: number;
  venus?: number;
  total?: number;
}

// Type for cooking method variations
export interface CookingMethodVariation extends CookingMethod {
  parentMethodId: string;
  variationType: 'cultural' | 'regional' | 'modern' | 'traditional';
  originalMethod?: string;
}

// Export all types for use throughout the application
export type { ElementalProperties, ZodiacSign, AlchemicalProperties } from './alchemy';

// Add CookingMethodInfo alias for compatibility
export type CookingMethodInfo = CookingMethod;
