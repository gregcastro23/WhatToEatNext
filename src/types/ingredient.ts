import type {
  IngredientCategory,
  SensoryProfile,
  CookingMethod,
  AlchemicalProperties,
  ThermodynamicProperties,
  Modality,
} from "@/data/ingredients/types";
import type { ElementalProperties } from "./alchemy";
import type { ZodiacSign, LunarPhase, PlanetaryAlignment } from "./astrology";

export interface Ingredient {
  id?: string;
  name: string;
  description?: string;
  category: IngredientCategory;

  // Missing properties extensively used in data files
  qualities: string[];
  storage?:
    | string
    | {
        container?: string;
        duration: string;
        temperature?:
          | string
          | {
              fahrenheit: number;
              celsius: number;
            };
        notes?: string;
      };

  // Astrological profile
  energyProfile?: {
    zodiac?: any[];
    lunar?: LunarPhase[];
    planetary?: PlanetaryAlignment[];
  };

  // Alternative astrological profile format (for compatibility)
  astrologicalProfile?: {
    elementalAffinity?: {
      base: string;
      secondary?: string;
    };
    rulingPlanets?: string[];
    zodiacAffinity?: string[];
  };
  // Core properties
  elementalProperties: ElementalProperties;
  modality?: Modality;
  sensoryProfile?: SensoryProfile;
  alchemicalProperties?: AlchemicalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
  recommendedCookingMethods?: CookingMethod[];

  // Pairing recommendations
  pairingRecommendations?: {
    complementary: string[];
    contrasting: string[];
    toAvoid: string[];
  };

  // Nutritional information
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    vitamins?: { [key: string]: number };
    minerals?: { [key: string]: number };
  };

  // Additional properties for compatibility
  origin?: string[];
  subCategory?: string;
  seasonality?: string[];
  varieties?: Record<string, unknown>;

  // Allow additional properties for extensibility
  [key: string]: unknown;
}

// ========== TYPE RE-EXPORTS FOR DOWNSTREAM COMPATIBILITY ==========
// These re-exports ensure downstream adapters and services can import from ingredient.ts
export type { ElementalProperties, Season } from "./alchemy";
export type { ZodiacSign, PlanetName } from "./celestial";
export type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
