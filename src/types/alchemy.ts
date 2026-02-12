import type { TarotCard } from "@/contexts/TarotContext/types";
import type {
  LunarPhase,
  Modality,
  PlanetName,
  ZodiacSign,
  AlchemicalProperties, // Added AlchemicalProperties from celestial
  AstrologicalState, // Added AstrologicalState from celestial
} from "@/types/celestial";
import type { Recipe, RecipeIngredient } from "@/types/recipe";
import type { Season } from "@/constants/seasons"; // Manually added as it was removed accidentally

// src/types/alchemy.ts

// ========== PHASE 1: CORE TYPE ALIASES ==========

/**
 * Core Alchemical Properties (ESMS System)
 * These are the four fundamental alchemical energy states
 */
export interface AlchemicalPropertiesType {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

/**
 * Core Elemental Properties (Classical Elements)
 * These are the four classical elements used throughout the system
 */
export interface ElementalPropertiesType {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}

/**
 * Thermodynamic Metrics for alchemical calculations
 * Core metrics used in Greg's Energy and other thermodynamic calculations
 */
export interface ThermodynamicMetricsType {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}

/**
 * Combined Alchemical State
 * Represents the complete alchemical state combining elemental and energy properties
 */
export type AlchemicalStateType = AlchemicalPropertiesType &
  ElementalPropertiesType;

/**
 * Complete Alchemical Result
 * Full result including alchemical properties, elemental properties, and thermodynamic metrics
 */
export type CompleteAlchemicalResultType = AlchemicalStateType &
  ThermodynamicMetricsType;

/**
 * Planetary Positions Map
 * Standard type for planetary position data
 */
export type PlanetaryPositionsType = Record<string, string>;

/**
 * Zodiac Sign Union Type
 * All twelve zodiac signs in lowercase (project standard)
 */
export type ZodiacSignType =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

/**
 * Lunar Phase Type
 * Standard lunar phases with spaces (project standard)
 */
export type LunarPhaseType =
  | "new moon"
  | "waxing crescent"
  | "first quarter"
  | "waxing gibbous"
  | "full moon"
  | "waning gibbous"
  | "last quarter"
  | "waning crescent";

/**
 * Nutritional Content Type
 * Standard nutritional information structure
 */
export interface NutritionalContentType {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
}

/**
 * Ingredient Mapping Type
 * Standard structure for ingredient data
 */
export interface IngredientMappingType {
  name: string;
  category: string;
  season: string[];
  regionalOrigins: string[];
  nutritionalContent: NutritionalContentType;
  elementalProperties: ElementalPropertiesType;
  cookingMethods: string[];
  affinities: string[];
  sustainabilityScore: number;
  qualities: string[];
  culinaryApplications?: Record<string, Record<string, string>>;
}

/**
 * Service Response Type
 * Generic standardized response type for services
 */
export interface ServiceResponseType<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Alchemical Transformation Result
 * Result of alchemical transformation operations
 */
export interface AlchemicalTransformationResultType {
  originalProperties: AlchemicalPropertiesType;
  transformedProperties: AlchemicalPropertiesType;
  elementalShift: ElementalPropertiesType;
  transformationScore: number;
  dominantElement: "Fire" | "Water" | "Earth" | "Air";
  dominantProperty: keyof AlchemicalPropertiesType;
}

/**
 * Planetary Influence Result
 * Result of planetary influence calculations
 */
export interface PlanetaryInfluenceResultType {
  planetaryPositions: PlanetaryPositionsType;
  elementalBoost: ElementalPropertiesType;
  alchemicalModifier: AlchemicalPropertiesType;
  compatibilityScore: number;
}

/**
 * Astrological State Type
 * Complete astrological state including planetary positions and influences
 */
export interface AstrologicalStateType {
  planetaryPositions: PlanetaryPositionsType;
  currentZodiac: ZodiacSign;
  lunarPhase: LunarPhaseType;
  elementalInfluence: ElementalPropertiesType;
}

// ========== CORE ELEMENTAL TYPES ==========

export type Element = "Fire" | "Water" | "Earth" | "Air";

/**
 * Raw elemental properties - actual calculated values (NOT normalized)
 * Values can be any positive number representing true energetic intensity.
 *
 * Use this for:
 * - Recipe calculations that need to preserve intensity information
 * - Aggregating ingredient properties
 * - Thermodynamic calculations
 * - Any calculation where relative magnitudes matter
 */
export interface RawElementalProperties {
  Fire: number; // >= 0, no upper bound
  Water: number; // >= 0, no upper bound
  Earth: number; // >= 0, no upper bound
  Air: number; // >= 0, no upper bound
  [key: string]: number; // Allow indexing with string
}

/**
 * Normalized elemental properties - percentages (0.0-1.0, sum ≈ 1.0)
 * Used ONLY for display/UI purposes
 *
 * Use this for:
 * - UI display (progress bars, pie charts)
 * - User-facing percentage representations
 * - Legacy compatibility with normalized-only systems
 */
export interface NormalizedElementalProperties {
  Fire: number; // 0.0-1.0
  Water: number; // 0.0-1.0
  Earth: number; // 0.0-1.0
  Air: number; // 0.0-1.0
  [key: string]: number; // Allow indexing with string
}

/**
 * ElementalProperties is now RawElementalProperties by default
 * This allows values to express true calculated intensities rather than
 * being constrained to percentages that sum to 1.0.
 *
 * For normalized display values, use NormalizedElementalProperties and
 * the normalizeForDisplay() utility function.
 */
export interface ElementalProperties extends RawElementalProperties {}

// Also export the lowercase version used in astrologyUtils.ts
export interface LowercaseElementalProperties {
  fire: number;
  water: number;
  earth: number;
  air: number;
  [key: string]: number; // Allow indexing with string
}

export type ElementalRatio = Record<Element, number>;
export type ElementalModifier = Partial<Record<Element, number>>;

// Enhanced elemental interactions
export interface ElementalInteraction {
  primary: Element;
  secondary: Element;
  effect: "enhance" | "diminish" | "transmute";
  potency: number;
  resultingElement?: Element;
}

// ========== MISSING TYPES FOR PHASE 8 ==========

// Alchemical calculation results
export interface AlchemicalResult {
  elementalProperties: ElementalProperties;
  thermodynamicProperties: ThermodynamicProperties;
  kalchm: number;
  monica: number;
  score: number;
}

export interface StandardizedAlchemicalResult extends AlchemicalResult {
  normalized: boolean;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface AlchemicalCalculationResult {
  result: AlchemicalResult;
  confidence: number;
  factors: string[];
}

// Thermodynamic properties
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number; // Using gregsEnergy as the single energy metric for this project
  kalchm?: number;
  monica?: number;
}

export interface BasicThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number; // Added to match extensive usage throughout codebase
}

export interface ThermodynamicMetrics extends ThermodynamicProperties {
  kalchm: number;
  monica: number;
}

// Elemental characteristics and profiles
export interface ElementalCharacteristics {
  element: Element;
  strength: number;
  purity: number;
  interactions: ElementalInteraction[];
}

export interface ElementalProfile {
  dominant: Element;
  secondary?: Element;
  characteristics: ElementalCharacteristics[];
  balance: ElementalProperties;
}

// Elemental affinity
export interface ElementalAffinity {
  primary: Element;
  secondary?: Element;
  strength: number;
  compatibility: Record<Element, number>;
}

// Astrological influence
export interface _AstrologicalInfluence {
  planet: string;
  sign: ZodiacSign;
  element: Element;
  strength: number;
  aspects: PlanetaryAspect[];
}

export type AstrologicalInfluence = _AstrologicalInfluence;

// Recipe harmony
export interface RecipeHarmonyResult {
  overall: number;
  elemental: number;
  astrological: number;
  seasonal: number;
  factors: string[];
}

// Chakra energies
export interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  thirdEye: number;
  crown: number;
}

// Combination effects
export interface CombinationEffect {
  type: EffectType;
  strength: number;
  elements: Element[];
  description: string;
}

export type EffectType =
  | "synergy"
  | "conflict"
  | "neutralize"
  | "amplify"
  | "transmute";

// Add missing type definition
export interface EnhancedCookingMethod {
  id: string;
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];
  [key: string]: unknown;
}

export interface CustomRecipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  methods: EnhancedCookingMethod[];
  instructions: string[];
  timing: RecipeTiming;
  servings: number;
  astrologicalOptimization: AstrologicalTiming;
  elementalProperties?: ElementalProperties;
  dominantElement?: Element;
}

export interface RecipeTiming {
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
}

export interface AstrologicalTiming {
  optimalTime: string;
  planetaryHour: string;
  lunarPhase: string;
  seasonalAlignment: string;
}

// Birth and horoscope data types
export interface BirthInfo {
  date: Date;
  location: {
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  name?: string;
}

export interface HoroscopeData {
  planets: Record<string, PlanetaryPosition>;
  houses: Record<string, unknown>;
  aspects: PlanetaryAspect[];
  ascendant?: {
    sign: ZodiacSign;
    degree: number;
  };
  midheaven?: {
    sign: ZodiacSign;
    degree: number;
  };
  [key: string]: unknown;
}

// ========== COOKING METHOD MODIFIERS ==========

export interface CookingMethodModifier {
  element: Element;
  intensity: number; // 0-1 scale
  effect: "enhance" | "transmute" | "diminish" | "balance";
  applicableTo: string[]; // food categories this applies to
  duration?: {
    min: number; // minutes
    max: number;
  };
  notes?: string;
}

export type CookingMethodProfile = CookingMethodModifier;

// ========== ASTROLOGICAL TYPES ==========

// Format with spaces (UI friendly)
export type LunarPhaseWithSpaces =
  | "new moon"
  | "waxing crescent"
  | "first quarter"
  | "waxing gibbous"
  | "full moon"
  | "waning gibbous"
  | "last quarter"
  | "waning crescent";

// Format with underscores (API/object key friendly)
export type LunarPhaseWithUnderscores =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

// Default LunarPhase type - use the format with spaces as the primary representation

// Mapping between the two formats
export const _LUNAR_PHASE_MAPPING: Record<
  LunarPhaseWithSpaces,
  LunarPhaseWithUnderscores
> = {
  "new moon": "new_moon",
  "waxing crescent": "waxing_crescent",
  "first quarter": "first_quarter",
  "waxing gibbous": "waxing_gibbous",
  "full moon": "full_moon",
  "waning gibbous": "waning_gibbous",
  "last quarter": "last_quarter",
  "waning crescent": "waning_crescent",
};

// Reverse mapping (can be useful in some contexts)
export const _LUNAR_PHASE_REVERSE_MAPPING: Record<
  LunarPhaseWithUnderscores,
  LunarPhaseWithSpaces
> = {
  new_moon: "new moon",
  waxing_crescent: "waxing crescent",
  first_quarter: "first quarter",
  waxing_gibbous: "waxing gibbous",
  full_moon: "full moon",
  waning_gibbous: "waning gibbous",
  last_quarter: "last quarter",
  waning_crescent: "waning crescent",
};

export interface Planet {
  name: PlanetName;
  influence: number; // 0-1 scale indicating strength of influence
  position?: string; // Optional zodiac position
}

export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  element?: Element;
  dignity?: DignityType;
  isRetrograde?: boolean;
  house?: number;
  longitude?: number;
  latitude?: number;
  distance?: number;
}

export interface PlanetaryAlignment {
  Sun: PlanetaryPosition;
  Moon: PlanetaryPosition;
  Mercury: PlanetaryPosition;
  Venus: PlanetaryPosition;
  Mars: PlanetaryPosition;
  Jupiter: PlanetaryPosition;
  Saturn: PlanetaryPosition;
  Uranus: PlanetaryPosition;
  Neptune: PlanetaryPosition;
  Pluto: PlanetaryPosition;
  [key: string]: PlanetaryPosition | CelestialPosition; // Allow indexing with string and support both position types
}

export interface PlanetaryHarmony {
  [key: string]: Record<PlanetName, number>;
  sun: Record<PlanetName, number>;
  moon: Record<PlanetName, number>;
  mercury: Record<PlanetName, number>;
  venus: Record<PlanetName, number>;
  mars: Record<PlanetName, number>;
  jupiter: Record<PlanetName, number>;
  saturn: Record<PlanetName, number>;
}

// Define AspectType
export type AspectType =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition"
  | "quincunx"
  | "semisextile"
  | "semisquare"
  | "sesquisquare"
  | "quintile"
  | "biquintile";

// Define PlanetaryAspect
export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
  strength: number;
  planets?: string[];
  influence?: number;
  additionalInfo?: Record<string, unknown>;
}

// Define Dignity type
export type DignityType =
  | "Domicile"
  | "Exaltation"
  | "Detriment"
  | "Fall"
  | "Neutral";
export interface CelestialPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  position?: number;
  retrograde?: boolean;
  element?: Element;
  dignity?: DignityType;
}

export const _COOKING_METHOD_THERMODYNAMICS = {};

// ========== MISSING TYPES FOR TS2305 FIXES ==========

// CookingMethod type (causing errors in CookingMethods.tsx)
export interface CookingMethod {
  id: string;
  name: string;
  category: string;
  element: Element;
  intensity: number;
  description?: string;
  thermodynamicEffect?: CookingMethodModifier;
  techniques?: string[];
  temperature?: {
    min?: number;
    max?: number;
    unit?: "F" | "C";
  };
  duration?: {
    min?: number;
    max?: number;
    unit?: "minutes" | "hours";
  };
}

// ElementalItem type (causing errors in CuisineRecommender.tsx)
export interface ElementalItem {
  id: string;
  name: string;
  elementalProperties: ElementalProperties;
  category?: string;
  affinities?: ElementalAffinity[];
  harmony?: number;
}

// Add missing type definitions
export type AlchemicalProperty = "Spirit" | "Essence" | "Matter" | "Substance";
export type ElementalCharacter = "Fire" | "Water" | "Earth" | "Air";
// AlchemicalItem type (causing errors in CuisineRecommender.tsx)
export interface AlchemicalItem extends ElementalItem {
  // Core alchemical properties (required)
  alchemicalProperties: Record<AlchemicalProperty, number>;
  transformedElementalProperties: Record<ElementalCharacter, number>;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  dominantElement: ElementalCharacter;
  dominantAlchemicalProperty: AlchemicalProperty;

  // Planetary influence properties (required)
  planetaryBoost: number;
  dominantPlanets: string[];
  planetaryDignities: Record<string, unknown>;

  // Optional legacy properties for backward compatibility
  thermodynamicProperties?: ThermodynamicProperties;
  transformations?: ElementalInteraction[];
  seasonalResonance?: Season[];
}

// FilterOptions type (causing errors in FilterSection.tsx)
export interface FilterOptions {
  elements?: Element[];
  seasons?: Season[];
  mealTypes?: string[];
  cookingMethods?: string[];
  difficulty?: Array<"easy" | "medium" | "hard">;
  prepTime?: {
    min?: number;
    max?: number;
  };
  dietary?: string[];
}

// NutritionPreferences type (causing errors in FilterSection.tsx)
export interface NutritionPreferences {
  calories?: {
    min?: number;
    max?: number;
  };
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  vitamins?: string[];
  minerals?: string[];
  allergens?: string[];
  dietaryRestrictions?: string[];
}

// Ingredient type (causing errors in multiple files)
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  elementalProperties: ElementalProperties;
  nutritionalProfile?: NutritionalProfile;
  alchemicalProperties?: AlchemicalResult;
  seasonality?: Season[];
  affinities?: string[];
  cookingMethods?: string[];
  preparationNotes?: string;
  planetaryRuler?: string;
  astrologicalProfile?: AstrologicalProfile; // Astrological profile with ruling planets and zodiac info
}

// NutritionalProfile type (causing errors in multiple files)
export interface NutritionalProfile {
  // USDA-specific properties
  name?: string;
  fdcId?: number;
  source?: string;

  // Basic nutritional values
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;

  // Nested nutritional objects for USDA data
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    [key: string]: number | undefined;
  };

  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  antioxidants?: string[];
  phytonutrients?: string[];

  // Allow additional properties for extensibility
  [key: string]: unknown;
}

// ElementalState type (causing errors in IngredientRecommendations.tsx)
export interface ElementalState {
  currentElements: ElementalProperties;
  targetElements?: ElementalProperties;
  balance: number;
  recommendations?: string[];
  harmony?: number;
  dominantElement: Element;
  deficientElements?: Element[];
}

// ========== ADDITIONAL MISSING TYPES FOR TS2305 FIXES ==========

// CuisineType and DietaryRestriction (causing errors in Recipe components)
export type CuisineType =
  | "Italian"
  | "Mexican"
  | "Asian"
  | "Indian"
  | "Mediterranean"
  | "American"
  | "French"
  | "Thai"
  | "Chinese"
  | "Japanese"
  | "Greek"
  | "Spanish"
  | "Middle-Eastern"
  | "Moroccan"
  | "Ethiopian"
  | "Caribbean"
  | "Brazilian"
  | "Korean"
  | "Vietnamese"
  | "Fusion";

// Cuisine interface for cuisine objects with properties
export interface Cuisine {
  id?: string;
  name: string;
  description?: string;
  history?: string;
  culturalImportance?: string;
  elementalState?: ElementalProperties;
  elementalProperties?: ElementalProperties;
  dishes?: {
    [mealType: string]: {
      [season: string]: Recipe[];
    };
  };
  [key: string]: unknown;
}

export type DietaryRestriction =
  | "Vegetarian"
  | "Vegan"
  | "Gluten-Free"
  | "Dairy-Free"
  | "Nut-Free"
  | "Shellfish-Free"
  | "Soy-Free"
  | "Egg-Free"
  | "Low-Carb"
  | "Keto"
  | "Paleo"
  | "Whole30"
  | "Low-Sodium"
  | "Sugar-Free"
  | "Raw"
  | "Halal"
  | "Kosher"
  | "Pescatarian"
  | "Flexitarian";

// TimeFactors type (causing errors in RecipeGrid.tsx)
export interface TimeFactors {
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: "easy" | "medium" | "hard";
  servings?: number;
  yieldAmount?: string;
  restTime?: number;
  marinateTime?: number;
}

// AlchemicalValues type (causing errors in constants files)
export interface AlchemicalValues {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  defaultMultiplier?: number;
  balanceThreshold?: number;
  harmonyTarget?: number;
}

// Decan type (causing errors in elementalCore.ts)
export interface Decan {
  number: 1 | 2 | 3;
  sign: ZodiacSign;
  element: Element;
  planetaryRuler: string;
  degrees: {
    start: number;
    end: number;
  };
  characteristics: string[];
  season?: Season;
}

// ========== PHASE 2 MISSING TYPES FOR TS2305 FIXES ==========

// IngredientMapping type (causing 65 errors across ingredient data files)
// IngredientMapping should be an alias for a Record of Ingredients, not an interface
export type IngredientMapping = Record<string, Ingredient>;

// AstrologicalProfile type (causing 4 errors)
export interface AstrologicalProfile {
  birthChart?: HoroscopeData;
  planetaryPositions?: PlanetaryAlignment;
  dominantElements?: ElementalProperties;
  lunarPhase?: LunarPhase;
  seasonalAffinity?: Season[];
  chakraAlignment?: ChakraEnergies;
  personalPlanets?: Record<string, PlanetaryPosition>;
  rulingPlanets?: string[]; // Array of ruling planet names
  favorableZodiac?: ZodiacSign[]; // Array of favorable zodiac signs
  elementalAffinity?: {
    base?: Element;
    [key: string]: unknown;
  }; // Elemental affinity configuration
  lunarPhaseModifiers?: {
    [phase: string]: {
      elementalBoost?: ElementalProperties;
      preparationTips?: string[];
      thermodynamicEffects?: {
        heat?: number;
        entropy?: number;
        reactivity?: number;
        energy?: number;
      };
    };
  }; // Lunar phase modifiers for ingredient properties
}

// FlavorProfile type (causing 3 errors)
export interface FlavorProfile {
  primary: string[];
  secondary?: string[];
  intensity: number; // 1-10 scale
  complexity: number; // 1-10 scale
  balance: {
    sweet?: number;
    sour?: number;
    salty?: number;
    bitter?: number;
    umami?: number;
    spicy?: number;
  };
  aromatics?: string[];
  mouthfeel?: string[];
}

// MethodRecommendation and MethodRecommendationOptions (causing 2 errors each)
export interface MethodRecommendationOptions {
  elementalPreference?: Element[];
  skillLevel?: "beginner" | "intermediate" | "advanced";
  timeConstraints?: {
    maxPrepTime?: number;
    maxCookTime?: number;
  };
  equipment?: string[];
  dietaryRestrictions?: DietaryRestriction[];
  flavorProfile?: FlavorProfile;
  maxRecommendations?: number; // Maximum number of recommendations to return
}

export interface MethodRecommendation {
  method: CookingMethod;
  compatibility: number; // 0-1 scale
  score: number; // Compatibility score for sorting recommendations
  reasoning: string[];
  elementalAlignment: Element[];
  estimatedTime: TimeFactors;
  requiredSkills: string[];
  alternatives?: CookingMethod[];
}

// Single-occurrence types (causing 1 error each)
export type TarotSuit = "cups" | "wands" | "swords" | "pentacles";
export interface IngredientSearchCriteria {
  elements?: Element[];
  seasons?: Season[];
  categories?: string[];
  nutritionalRequirements?: NutritionPreferences;
  flavorProfile?: FlavorProfile;
  cookingMethods?: string[];
  availabilityFilter?: boolean;
}

export interface EnergyStateProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

/**
 * Quantity Scaled Properties interface for ingredient-to-quantity mapping
 * Represents elemental and alchemical properties scaled by quantity amounts
 */
export interface QuantityScaledProperties {
  /** Base elemental properties before scaling */
  base: ElementalProperties;
  /** Scaled elemental properties after quantity adjustment */
  scaled: ElementalProperties;
  /** Quantity amount used for scaling */
  quantity: number;
  /** Unit of measurement (e.g., 'g', 'ml', 'tsp', 'cup') */
  unit: string;
  /** Scaling factor applied (normalized logarithmic factor) */
  factor: number;
  /** Optional kinetics impact from quantity scaling */
  kineticsImpact?: {
    /** Force adjustment due to quantity changes */
    forceAdjustment: number;
    /** Thermal shift due to quantity changes */
    thermalShift: number;
  };
}

export type ChakraPosition =
  | "root"
  | "sacral"
  | "solarPlexus"
  | "heart"
  | "throat"
  | "thirdEye"
  | "crown";

// CelestialBody interface for astronomical calculations
export interface CelestialBody {
  name: string;
  position?: PlanetaryPosition;
  influence?: number; // 0-1 scale
  element?: Element;
  label?: string;
  Sign?: {
    label?: string;
  };
  [key: string]: unknown;
}

export interface CelestialAlignment {
  moment: Date;
  date?: Date; // Optional date property for backward compatibility
  planetaryPositions: PlanetaryAlignment;
  lunarPhase: LunarPhase;
  seasonalEnergy: Season;
  elementalDominance: ElementalProperties;
  elementalBalance?: ElementalProperties; // Additional elemental balance property
  elementalState?: ElementalProperties; // Elemental state for alchemical calculations
  aspectPatterns: PlanetaryAspect[];
  energyFlow: number; // 0-1 scale
  // Enhanced properties for celestialCalculations.ts compatibility
  zodiacSign?: ZodiacSign; // Current dominant zodiac sign
  dominantPlanets?: CelestialBody[]; // Array of dominant celestial bodies
  astrologicalInfluences?: string[]; // Array of astrological influence strings
  tarotInfluences?: TarotCard[]; // Tarot card influences
  energyStates?: EnergyStateProperties; // ESMS energy states (Spirit, Essence, Matter, Substance)
  chakraEnergies?: ChakraEnergies; // Chakra energy distribution
  // Additional calculation properties
  aspectInfluences?: Array<{
    type: AspectType;
    planets: string[];
    influence: number;
  }>; // Detailed aspect influences
  energyStateBalance?: EnergyStateProperties; // Energy state balance calculations
  chakraEmphasis?: ChakraEnergies; // Chakra emphasis calculations
  // Alchemizer engine integration properties
  thermodynamicMetrics?: ThermodynamicMetrics; // Heat, entropy, reactivity, gregsEnergy, kalchm, monica
  kalchm?: number; // Kalchm constant for alchemical calculations
  monica?: number; // Monica constant for alchemical calculations
  // Current celestial position properties
  currentZodiacSign?: ZodiacSign; // Current zodiac sign for compatibility calculations
}

// ========== BACKWARD COMPATIBILITY ALIASES (underscore-prefixed) ==========
// Many legacy files still import underscore-prefixed types.  Provide
// simple type aliases so those imports resolve without changing hundreds of files.
export type _Element = Element;
export type _ElementalProperties = ElementalProperties;
export type _LowercaseElementalProperties = LowercaseElementalProperties;
export type _ElementalRatio = ElementalRatio;
export type _ElementalModifier = ElementalModifier;
export type _Planet = Planet;
export type _PlanetName = PlanetName;
export type _LunarPhase = LunarPhase;
export type _Modality = Modality;
export type _CelestialPosition = CelestialPosition;
export type _ChakraEnergies = ChakraEnergies;
export type _AstrologicalProfile = AstrologicalProfile;
export type _PlanetaryPosition = PlanetaryPosition;
export type _Season = Season;
export type _ThermodynamicMetrics = ThermodynamicMetrics;
// Added simple boolean/season aliases for legacy code expecting these identifiers
export type _isDaytime = boolean; // TRUE if time between sunrise and sunset
export type _season = Season; // Lowercase underscore-prefixed alias for Season
// Raw and Normalized elemental property aliases
export type _RawElementalProperties = RawElementalProperties;
export type _NormalizedElementalProperties = NormalizedElementalProperties;

export type BaseIngredient = Ingredient;

// ---------------------------------------------------------------------------

// Re-export types from other modules for convenience and backward compatibility
export type {
  AlchemicalProperties,
  AstrologicalState,
  LunarPhase,
  Modality,
  PlanetName,
  ZodiacSign,
} from "@/types/celestial";
export type { Season } from "@/constants/seasons";

// ========== PHASE 45: ALCHEMY TYPE INTELLIGENCE SYSTEM ==========

/**
 * Comprehensive intelligence system for alchemy type definitions
 * Analyzes type usage patterns, validation, and compatibility
 */

// Simplified ALCHEMY_TYPE_INTELLIGENCE_SYSTEM for compilation
export const ALCHEMY_TYPE_INTELLIGENCE_SYSTEM = {
  analyzeElementalTypes: (typeData: any) => ({}),
  analyzeThermodynamicTypes: (thermoData: any) => ({}),
  analyzeRecipeTypes: (recipeData: any) => ({}),
  analyzeAstrologicalTypes: (astroData: any) => ({}),
  analyzeEnergyTypes: (energyData: any) => ({}),
};

/**
 * Phase 45 Alchemy Type Intelligence Summary
 * Demonstrates all analytics functions and ensures all type definitions are actively used
 */
// export const _PHASE_45_ALCHEMY_TYPE_INTELLIGENCE_SUMMARY =
//   ALCHEMY_TYPE_DEMONSTRATION_PLATFORM.demonstrateAllAlchemyTypeSystems();
