import type { ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";
import type {
  Planet as PlanetName,
  ZodiacSignType,
  Season,
  LunarPhase,
  CuisineType
} from "@/types/constants";

// Re-export ElementalProperties to fix TS2459 errors
export type { ElementalProperties, AlchemicalProperties };
export type IngredientCategory =
  | "culinary_herb"
  | "spice"
  | "vegetable"
  | "fruit"
  | "protein"
  | "grain"
  | "dairy"
  | "oil"
  | "vinegar"
  | "seasoning"
  | "misc"
  | "beverage"
  | "sweetener"
  | "preserved"
  | "aromatic_base"
  | "nut_seed"
  | "fungi";
// New interface for sensory profiles
export interface SensoryProfile {
  taste:
  | {
    sweet: number;
    salty: number;
    sour: number;
    bitter: number;
    umami: number;
    spicy: number;
  }
  | Record<string, number>;
  aroma:
  | {
    floral: number;
    fruity: number;
    herbal: number;
    spicy: number;
    earthy: number;
    woody: number;
  }
  | Record<string, number>;
  texture:
  | {
    crisp: number;
    tender: number;
    creamy: number;
    chewy: number;
    crunchy: number;
    silky: number;
  }
  | Record<string, number>;
}
// New interface for cooking methods
export interface CookingMethod {
  name: string;
  elementalEffect: Partial<ElementalProperties>;
  cookingTime: {
    min: number;
    max: number;
    unit: "seconds" | "minutes" | "hours" | string;
  };
  temperatures?: {
    min: number;
    max: number;
    unit: "celsius" | "fahrenheit";
  };
  description: string;
}

// Canonical nutritional profile (aligned to USDA FoodData Central serving format).
// Optional fields are genuinely optional per ingredient category — e.g. salts have no macros.
export interface NutritionalProfile {
  serving_size: string;
  calories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    saturatedFat?: number;
    sodium?: number;
    potassium?: number;
    cholesterol?: number;
  };
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  source?: string;
  notes?: string;
}

// Canonical culinary profile grouping flavor, methods, cuisine affinity, and prep tips.
export interface CulinaryProfile {
  flavorProfile?: {
    primary?: string[];
    secondary?: string[];
    notes?: string;
  };
  cookingMethods?: string[];
  cuisineAffinity?: string[];
  preparationTips?: string[];
  doneness?: string[];
  servingSuggestions?: string[];
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
  id?: string;
  description?: string;
  origin?: string[];
  regionalOrigins?: string[];
  subCategory?: string;
  dietary?: string[];
  modality?: Modality;
  sustainabilityScore?: number;
  nutritionalProfile?: NutritionalProfile;
  culinaryProfile?: CulinaryProfile;
  // Context-computed (NOT stored as primary source of truth — see planetaryAlchemyMapping).
  // Persisted here only as an authored aesthetic baseline when the recipe context is unknown.
  alchemicalProperties?: AlchemicalProperties;
  quantityBase?: { amount: number; unit: string };
  scaledElemental?: ElementalProperties;
  kineticsImpact?: { thermalDirection: number; forceMagnitude: number };
  varieties?: Record<
    string,
    {
      appearance?: string;
      texture?: string;
      flavor?: string;
      uses?: string;
      characteristics?: string;
      season?: string;
      notes?: string;
    }
  >;
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
    temperature?:
    | string
    | {
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
export const _VALID_CATEGORIES: IngredientCategory[] = [
  "culinary_herb",
  "spice",
  "vegetable",
  "fruit",
  "protein",
  "grain",
  "dairy",
  "oil",
  "vinegar",
  "seasoning",
  "misc",
  "beverage",
  "sweetener",
  "preserved",
  "aromatic_base",
  "nut_seed",
  "fungi"
];
// Improved subcategories
export type VegetableSubcategory =
  | "leafy_green"
  | "cruciferous"
  | "root"
  | "allium"
  | "squash"
  | "nightshade"
  | "starchy";
export type ProteinSubcategory =
  | "poultry"
  | "seafood"
  | "meat"
  | "legume"
  | "plant_based";
export type SeasoningSubcategory = "salt" | "pepper" | "aromatic" | "blend";
export type OilSubcategory = "cooking" | "finishing" | "infused";
export type VinegarSubcategory = "wine" | "fruit" | "grain" | "specialty";
export type FruitSubcategory = "citrus" | "berry" | "stone" | "tropical" | "melon" | "pome";
export type DairySubcategory = "milk" | "cheese" | "butter" | "cream" | "cultured";
export type GrainSubcategory = "wheat" | "rice" | "corn" | "oat" | "pseudo_cereal";
export type NutSeedSubcategory = "nut" | "seed";
export type MiscSubcategory = "thickener" | "binding_agent" | "preservative" | "leavening";
export type BaseSubcategory = "mirepoix" | "sofrito" | "bouquet_garni" | "curry_paste" | "stock" | "aromatic_blend";
// Updated ThermodynamicProperties interface based on the FoodAlchemySystem
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  energy: number;
}
// Add Modality type to the types file
export type Modality = "Cardinal" | "Fixed" | "Mutable";
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
  provenance?: "core" | "generated" | "manual";
  elementalProperties: ElementalProperties;
  astrologicalProfile?: {
    rulingPlanets?: PlanetName[];
    favorableZodiac?: ZodiacSignType[];
    seasonalAffinity?: Season[];
    elementalAffinity?:
    | string
    | {
      base: string;
      secondary?: string;
      decanModifiers?: {
        first?: { element: string; planet: PlanetName; influence?: number };
        second?: { element: string; planet: PlanetName; influence?: number };
        third?: { element: string; planet: PlanetName; influence?: number };
      };
    };
    lunarPhaseModifiers?: Partial<Record<LunarPhase, unknown>>;
    aspectEnhancers?: string[];
  };
  qualities?: string[];
  origin?: string[]; // Geographical origins (e.g. "Mexico")
  category?: IngredientCategory;
  subCategory?: VegetableSubcategory
  | ProteinSubcategory
  | SeasoningSubcategory
  | OilSubcategory
  | VinegarSubcategory
  | FruitSubcategory
  | DairySubcategory
  | GrainSubcategory
  | NutSeedSubcategory
  | MiscSubcategory
  | BaseSubcategory
  | string;
  description?: string;
  aliases?: string[];
  compositeElements?: string[]; // Used strictly for 'aromatic_base' / composite ingredients
  alchemicalProperties?: AlchemicalProperties;
  scaledElemental?: ElementalProperties;
  quantityBase?: { amount: number; unit: string };
  kineticsImpact?: { thermalDirection: number; forceMagnitude: number };
  thermodynamicProperties?: ThermodynamicProperties;
  smokePoint?: {
    celsius: number;
    fahrenheit: number;
  };
  potency?: number;
  heatLevel?: number;
  safetyThresholds?: {
    minimum?: { fahrenheit: number; celsius: number };
    maximum?: { fahrenheit: number; celsius: number };
    notes?: string;
  };
  pairingRecommendations?: {
    complementary: string[];
    contrasting: string[];
    toAvoid?: string[];
  };
  elementalTransformation?: {
    whenCooked: Partial<ElementalProperties>;
    whenFermented?: Partial<ElementalProperties>;
    whenDried?: Partial<ElementalProperties>;
  };
  varieties?: Record<string, unknown>;
  culinaryApplications?: Record<string, unknown>;
  seasonalAdjustments?: Partial<Record<Season, unknown>>;
  regionalPreparations?: Record<string, unknown>;
  preparation?: Record<string, unknown>;
  storage?: Record<string, unknown>;
  [key: string]: unknown;
}
