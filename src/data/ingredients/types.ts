import type { ElementalProperties , ZodiacSign } from '@/types/alchemy';

// Re-export ElementalProperties to fix TS2459 errors
export type { ElementalProperties };

export type IngredientCategory = 
    | 'culinary_herb' 
    | 'spice' 
    | 'vegetable' 
    | 'fruit' 
    | 'protein' 
    | 'grain' 
    | 'dairy'
    | 'oil'
    | 'vinegar'
    | 'seasoning';

// New interface for sensory profiles
export interface SensoryProfile {
    taste: {
        sweet: number;
        salty: number;
        sour: number;
        bitter: number;
        umami: number;
        spicy: number;
    } | Record<string, number>;
    aroma: {
        floral: number;
        fruity: number;
        herbal: number;
        spicy: number;
        earthy: number;
        woody: number;
    } | Record<string, number>;
    texture: {
        crisp: number;
        tender: number;
        creamy: number;
        chewy: number;
        crunchy: number;
        silky: number;
    } | Record<string, number>;
}

// New interface for cooking methods
export interface CookingMethod {
    name: string;
    elementalEffect: Partial<ElementalProperties>;
    cookingTime: {
        min: number;
        max: number;
        unit: 'seconds' | 'minutes' | 'hours' | string;
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
    dietary?: string[];
    modality?: Modality;
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
        toAvoid?: string[];
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
    'oil',
    'vinegar',
    'seasoning'
];

// Improved subcategories
export type VegetableSubcategory = 
    | 'leafy_green'
    | 'cruciferous'
    | 'root'
    | 'allium'
    | 'squash'
    | 'nightshade'
    | 'starchy';

export type ProteinSubcategory = 
    | 'poultry'
    | 'seafood'
    | 'meat'
    | 'legume'
    | 'plant_based';

export type SeasoningSubcategory = 
    | 'salt'
    | 'pepper'
    | 'aromatic'
    | 'blend';

export type OilSubcategory = 
    | 'cooking'
    | 'finishing'
    | 'infused';

export type VinegarSubcategory = 
    | 'wine'
    | 'fruit'
    | 'grain'
    | 'specialty';

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
  flavorProfile?: unknown;
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
        first?: { element: string; planet: string; influence?: number };
        second?: { element: string; planet: string; influence?: number };
        third?: { element: string; planet: string; influence?: number };
      };
    };
    lunarPhaseModifiers?: Record<string, unknown>;
    aspectEnhancers?: string[];
  };
  qualities?: string[];
  origin?: string[];
  category?: string;
  subCategory?: string;
  varieties?: Record<string, unknown>;
  culinaryApplications?: Record<string, unknown>;
  seasonalAdjustments?: Record<string, unknown>;
  regionalPreparations?: Record<string, unknown>;
  preparation?: Record<string, unknown>;
  storage?: Record<string, unknown>;
  // Allow additional properties
  [key: string]: unknown;
} 