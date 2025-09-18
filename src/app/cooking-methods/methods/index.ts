// Cooking methods module
export interface CookingMethodInfo {
  id: string,
  name: string,
  description: string;
  elementalEffect?: {
    Fire: number,
    Water: number,
    Earth: number,
    Air: number,
  };
  duration?: {
    min: number,
    max: number,
  };
  suitable_for?: string[];
  benefits?: string[];
  variations?: string[];
  commonMistakes?: string[] | string;
  pairingSuggestions?: string[] | string;
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
  time_range?:
    | string
    | {
        min: number,
        max: number,
      };
  temperature_range?:
    | string
    | {
        min: number,
        max: number,
        unit?: string;
      };
  alchemical_properties?: Record<string, unknown>;
  tools?: string[] | string;
  famous_dishes?: string[] | string;
  health_benefits?: string[] | string;
  health_considerations?: string[] | string;
  astrologicalInfluence?: string;
  zodiacResonance?: string[];
  planetaryInfluences?: string[];
}

// Export a default empty object for now
export const cookingMethods: Record<string, CookingMethodInfo> = {};

export default cookingMethods;
