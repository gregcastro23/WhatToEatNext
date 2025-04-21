import { 
  ElementalProperties, 
  ZodiacSign,
  ThermodynamicProperties, 
  CookingMethod
} from "./alchemy";
import { CookingMethodVariation } from './cookingMethod';

// Re-export CookingMethodData from cookingMethod.ts for backward compatibility
export { CookingMethodData, CookingMethodCollection, CookingMethodKey } from './cookingMethod';

/**
 * Legacy interface for cooking method information
 * @deprecated Use CookingMethodData from './cookingMethod' instead
 */
export interface CookingMethodInfo {
  id: string;
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  score?: number;
  duration: { min: number; max: number };
  suitable_for: string[];
  benefits: string[];
  variations?: CookingMethodVariation[];
  instructions: string[];
  recommendedFoods: string[];
  thermodynamicProperties: ThermodynamicProperties;
  astrologicalInfluences?: {
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
  };
  commonMistakes?: string[] | string;
  pairingSuggestions?: string[] | string;
  scientificPrinciples?: string[] | string;
  history?: string;
  science?: string;
  optimalTemperature?: string;
  nutrientRetention?: string;
  chemicalChanges?: string;
  safetyFeatures?: string;
  equipmentComplexity?: string;
  regionalVariations?: string;
  modernVariations?: string;
  time_range?: { min: number; max: number };
  temperature_range?: { min: number; max: number } | string;
  alchemical_properties?: {
    element?: string;
    planetary_influence?: string;
    effect_on_ingredients?: string;
  };
  tools?: string[];
  famous_dishes?: string[];
  health_benefits?: string[];
  health_considerations?: string[];
  astrologicalInfluence?: string;
  zodiacResonance?: string[];
  planetaryInfluences?: string[];
} 