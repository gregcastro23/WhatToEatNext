import type { 
  IngredientCategory, 
  SensoryProfile, 
  CookingMethod, 
  AlchemicalProperties, 
  ThermodynamicProperties,
  Modality 
} from '@/data/ingredients/types';
import type { ElementalProperties } from './alchemy';
import type { ZodiacSign, LunarPhase, PlanetaryAlignment } from './astrology';

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  category: IngredientCategory;
  energyProfile: {
    zodiac?: ZodiacSign[];
    lunar?: LunarPhase[];
    planetary?: PlanetaryAlignment[];
  };
  elementalProperties: ElementalProperties;
  qualities: string[];
  modality?: Modality;
  sensoryProfile?: SensoryProfile;
  alchemicalProperties?: AlchemicalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
  recommendedCookingMethods?: CookingMethod[];
  pairingRecommendations?: {
    complementary: string[];
    contrasting: string[];
    toAvoid: string[];
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    // Other nutrition properties...
  };
  // ... other properties
} 