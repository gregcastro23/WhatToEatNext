import { Element , ElementalProperties } from "@/types/alchemy";


export interface CookingMethod {
  id: string;
  name: string;
  description: string;
  elementalEffect?: ElementalProperties;
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  variations?: string[];
  commonMistakes?: string[] | string;
  pAiringSuggestions?: string[] | string;
  scientificPrinciples?: string[] | string;
  history?: string;
  science?: string;
  optimalTemperature?: string;
  nutrientRetention?: string;
  thermodynamicProperties?: string;
  chemicalChanges?: string;
  safetyFeatures?: string;
  equipmentComplexity?: string;
  regionalVariations?: string;
  modernVariations?: string;
  time_range?: string | {
    min: number;
    max: number;
  };
  temperature_range?: string | {
    min: number;
    max: number;
    unit?: string;
  };
  alchemical_properties?: any;
  tools?: string[] | string;
  famous_dishes?: string[] | string;
  health_benefits?: string[] | string;
  health_considerations?: string[] | string;
  astrologicalInfluence?: string;
  zodiacResonance?: string[];
  planetaryInfluences?: string[];
}

export interface CookingMethodData extends CookingMethod {
  astrologicalInfluences?: {
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
    dominantPlanets?: string[];
  };
}

export { ElementalProperties, ZodiacSign } from './alchemy';
