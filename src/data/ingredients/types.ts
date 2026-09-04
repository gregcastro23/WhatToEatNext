import type { ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";
import type {
  Planet as PlanetName,
  ZodiacSignType,
  Season,
  LunarPhase,
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
  /**
   * Plural spelling. NOT a duplicate of "vinegar" — both are authored in the
   * data and both are read by live consumers, so the union must admit both.
   * 27 data sites author "vinegars" (src/data/ingredients/vinegars/*.ts and
   * seasonings/vinegars.ts); 5 author the singular (misc/coverage*.ts).
   * Live readers that match the PLURAL: ingredientDietaryClassification.ts:172,
   * recommendation/ingredientRecommendation.ts:359, foodRecommender.ts:1279,
   * UnifiedIngredientService.ts:156 (cache key), FoodDiaryService.ts:68.
   * Renaming the data to the singular would silently empty all five.
   */
  | "vinegars"
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

/**
 * How a {@link ProximateComposition} was established.
 *
 * `usda-fdc`      a specific FoodData Central record, identified by `fdcId`.
 * `class-typical` a representative figure for the food class, NOT this
 *                 ingredient. Honest about being an inheritance, not a lookup.
 * `derived`       computed from other fields on this profile rather than read
 *                 from a source. Carries the largest error and says so.
 */
export type CompositionBasis = "usda-fdc" | "class-typical" | "derived";

/**
 * Proximate composition of the edible portion, as MASS FRACTIONS.
 *
 * ⚠️ FRACTIONS IN [0, 1], NOT GRAMS — and deliberately not inside `macros`.
 * Every number in `macros` is grams per the free-text `serving_size` ("1 medium
 * (58g)"), so a `water: 0.883` sitting beside `protein: 0.6` would read as
 * 0.883 GRAMS of water in a 58 g lime. Being wrong by two orders of magnitude
 * in the one direction that still looks plausible is exactly the defect this
 * separation exists to prevent.
 *
 * ── Why all five, from ONE record ───────────────────────────────────────────
 *
 * These are the inputs to Choi & Okos (1986), which predicts specific heat,
 * thermal conductivity and density from composition, and to latent heat, which
 * is very nearly a pure water-content quantity. The correlation assumes the
 * components describe ONE substance. Taking water from one source and protein
 * from another produces a figure that is individually citable and jointly
 * meaningless — `[MEASURED 2026-08-18]` exactly what happened when garlic's
 * water came from an FDC Foundation record while its macros followed SR Legacy.
 * So all five fractions come from a single `fdcId`, or none do.
 *
 * ── They should sum to 1, and when they do not that is information ──────────
 *
 * Water + protein + fat + carbohydrate + ash is a complete proximate analysis:
 * it closes at 1.000 for 40 of the 42 sourced ingredients. It does NOT close
 * for foods carrying mass the proximate set does not name — vanilla extract is
 * ~34 % ethanol, and alcohol is not a proximate component. Such entries state
 * why in {@link ProximateComposition.unaccountedNote}, because Choi & Okos will
 * understate a food whose missing third is ethanol, and a reader deserves to
 * know before trusting a derived conductivity. Use
 * {@link compositionResidual} to measure it rather than assuming closure.
 *
 * Provenance is part of the value: `usda-fdc` entries carry the `fdcId` that
 * reproduces them. Regenerate with `bun run fetch:composition`.
 */
export interface ProximateComposition {
  /** Mass fraction of water, 0–1. */
  water: number;
  /** Mass fraction of protein, 0–1. */
  protein: number;
  /** Mass fraction of total lipid (fat), 0–1. */
  fat: number;
  /** Mass fraction of carbohydrate, 0–1. */
  carbohydrate: number;
  /** Mass fraction of ash (total mineral content), 0–1. */
  ash: number;
  /** How this analysis was established. See {@link CompositionBasis}. */
  basis: CompositionBasis;
  /** FoodData Central id. Present, and only present, when `basis` is `usda-fdc`. */
  fdcId?: number;
  /** The FDC record's own description, so a mismatched match is visible. */
  fdcDescription?: string;
  /** ISO date the source was read. FDC revises records. */
  retrieved?: string;
  /**
   * Why the five fractions do not sum to 1, when they do not.
   *
   * Required reading before feeding such an entry to a composition
   * correlation — the unnamed mass is real and the correlation cannot see it.
   */
  unaccountedNote?: string;
}

/**
 * How much of the mass the five proximate fractions fail to account for.
 *
 * Zero for a complete analysis. Positive when something unnamed is present
 * (ethanol, in the one culinary case that matters). Computed rather than
 * stored, so it cannot drift from the fractions it describes.
 */
export function compositionResidual(c: ProximateComposition): number {
  return 1 - (c.water + c.protein + c.fat + c.carbohydrate + c.ash);
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
  /**
   * Proximate composition as mass fractions, with its basis and provenance.
   * See {@link ProximateComposition}.
   *
   * Absent means UNKNOWN, never zero — a missing analysis and a genuinely
   * anhydrous or ash-free ingredient are different claims, and only one of
   * them is safe to feed a latent-heat or Choi–Okos calculation.
   */
  composition?: ProximateComposition;
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
  image_url?: string;
  imageUrl?: string;
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
  amazonAsin?: string;
  [key: string]: unknown;
}
