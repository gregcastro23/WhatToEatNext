import type { ElementalProperties } from '@/types/alchemy';
import type { ZodiacSign } from '@/types/zodiac';

export type IngredientCategory = 
    | 'culinary_herb' 
    | 'spice' 
    | 'vegetable' 
    | 'fruit' 
    | 'protein' 
    | 'grain' 
    | 'dairy'
    | 'oil';

// New interface for sensory profiles
export interface SensoryProfile {
    taste: {
        sweet: number;
        salty: number;
        sour: number;
        bitter: number;
        umami: number;
        spicy: number;
    };
    aroma: {
        floral: number;
        fruity: number;
        herbal: number;
        spicy: number;
        earthy: number;
        woody: number;
    };
    texture: {
        crisp: number;
        tender: number;
        creamy: number;
        chewy: number;
        crunchy: number;
        silky: number;
    };
}

// New interface for cooking methods
export interface CookingMethod {
    name: string;
    elementalEffect: Partial<ElementalProperties>;
    cookingTime: {
        min: number;
        max: number;
        unit: 'seconds' | 'minutes' | 'hours';
    };
    temperatures?: {
        min: number;
        max: number;
        unit: 'celsius' | 'fahrenheit';
    };
    description: string;
}

export interface BaseIngredient {
    name: string;
    category: IngredientCategory;
    elementalProperties: ElementalProperties;
    qualities: string[];
    seasonality?: string[];
    lunarPhaseModifiers?: Record<string, LunarPhaseModifier>;
    sensoryProfile?: SensoryProfile;
    recommendedCookingMethods?: CookingMethod[];
}

export interface LunarPhaseModifier {
    elementalBoost?: Partial<ElementalProperties>;
    preparationTips?: string[];
    potencyMultiplier?: number;
    recommendedUses?: string[];
}

export interface Ingredient extends BaseIngredient {
    origin?: string[];
    subCategory?: string;
    varieties?: Record<string, {
        appearance?: string;
        texture?: string;
        flavor?: string;
        uses?: string;
        characteristics?: string;
        season?: string;
        notes?: string;
    }>;
    smokePoint?: {
        celsius: number;
        fahrenheit: number;
    };
    potency?: number;
    heatLevel?: number;
    preparation?: {
        fresh?: {
            duration: string;
            storage: string;
            tips: string[];
        };
        dried?: {
            duration: string;
            storage: string;
            tips: string[];
        };
        methods?: string[];
    };
    storage: {
        container?: string;
        duration: string;
        temperature?: string | {
            fahrenheit: number;
            celsius: number;
        };
        notes?: string;
    };
    safetyThresholds?: {
        minimum?: { fahrenheit: number; celsius: number };
        maximum?: { fahrenheit: number; celsius: number };
        notes?: string;
    };
    // New property for ingredient pairing recommendations
    pairingRecommendations?: {
        complementary: string[];
        contrasting: string[];
        toAvoid: string[];
    };
    // New property for elemental transformation
    elementalTransformation?: {
        whenCooked: Partial<ElementalProperties>;
        whenFermented?: Partial<ElementalProperties>;
        whenDried?: Partial<ElementalProperties>;
    };
}

export const VALID_CATEGORIES: IngredientCategory[] = [
    'culinary_herb',
    'spice',
    'vegetable',
    'fruit',
    'protein',
    'grain',
    'dairy',
    'oil'
];

// Updated AlchemicalProperties interface with more accurate values
export interface AlchemicalProperties {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

// Updated ThermodynamicProperties interface based on the FoodAlchemySystem
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  energy: number;
}

// Add Modality type to the types file
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

// Update the IngredientProfile interface to include modality
export interface IngredientProfile {
  name: string;
  description: string;
  flavorProfile?: any;
  alchemicalProperties: AlchemicalProperties;
  thermodynamicProperties: ThermodynamicProperties;
  modality: Modality;
}

export interface IngredientMapping {
  name: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    favorableZodiac?: ZodiacSign[];
    elementalAffinity?: string | {
      base: string;
      secondary?: string;
      decanModifiers?: {
        first?: { element: string; planet: string };
        second?: { element: string; planet: string };
        third?: { element: string; planet: string };
      };
    };
    lunarPhaseModifiers?: Record<string, any>;
    aspectEnhancers?: string[];
  };
  qualities?: string[];
  origin?: string[];
  category?: string;
  subCategory?: string;
  varieties?: Record<string, any>;
  culinaryApplications?: Record<string, any>;
  seasonalAdjustments?: Record<string, any>;
  regionalPreparations?: Record<string, any>;
  preparation?: Record<string, any>;
  storage?: Record<string, any>;
  // Allow additional properties
  [key: string]: any;
} 