import { ZodiacSign, LunarPhase, Modality, AlchemicalProperties, PlanetName, Planet, PlanetaryAlignment, CelestialPosition, PlanetaryAspect } from '@/types/celestial';
import { TarotCard } from '@/contexts/TarotContext/types';
import { ElementalCharacter } from '@/constants/planetaryElements';

// Import AlchemicalProperty as a type from celestial.ts
import type { AlchemicalProperty } from '@/types/celestial';

// CRITICAL: Re-export all imported types to maintain API compatibility
export type { ZodiacSign, LunarPhase, Modality, AlchemicalProperties, PlanetName, Planet, PlanetaryAlignment, CelestialPosition, PlanetaryAspect };
export type { AlchemicalProperty };

// src/types/alchemy.ts

// ========== CORE ELEMENTAL TYPES ==========

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';

export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}

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
  effect: 'enhance' | 'diminish' | 'transmute';
  potency: number;
  resultingElement?: Element;
}

// ========== MISSING TYPES FOR PHASE 8 ==========

// Season type
export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';

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
  
  // Additional properties for alchemical calculations
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
  elementalBalance?: {
    fire?: number;
    earth?: number;
    air?: number;
    water?: number;
  };
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
}

export interface BasicThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number; // gregsEnergy is the energy value for this project
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

export type EffectType = 'synergy' | 'conflict' | 'neutralize' | 'amplify' | 'transmute';

// Recipe interface for alchemy calculations
export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  elementalProperties: ElementalProperties;
  season?: Season[];
  mealType?: string[];
  [key: string]: unknown;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  elementalProperties?: ElementalProperties;
  [key: string]: unknown;
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
  effect: 'enhance' | 'transmute' | 'diminish' | 'balance';
  applicableTo: string[]; // food categories this applies to
  duration?: {
    min: number; // minutes
    max: number; 
  };
  notes?: string;
}

// ========== ASTROLOGICAL TYPES ==========

// Format with spaces (UI friendly)
export type LunarPhaseWithSpaces = 'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' | 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent';

// Format with underscores (API/object key friendly)
export type LunarPhaseWithUnderscores = 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

// Default LunarPhase type - use the format with spaces as the primary representation


// Mapping between the two formats
export const LUNAR_PHASE_MAPPING: Record<LunarPhaseWithSpaces, LunarPhaseWithUnderscores> = {
  'new moon': 'new_moon',
  'waxing crescent': 'waxing_crescent',
  'first quarter': 'first_quarter',
  'waxing gibbous': 'waxing_gibbous',
  'full moon': 'full_moon',
  'waning gibbous': 'waning_gibbous',
  'last quarter': 'last_quarter',
  'waning crescent': 'waning_crescent'
};

// Reverse mapping (can be useful in some contexts)
export const LUNAR_PHASE_REVERSE_MAPPING: Record<LunarPhaseWithUnderscores, LunarPhaseWithSpaces> = {
  'new_moon': 'new moon',
  'waxing_crescent': 'waxing crescent',
  'first_quarter': 'first quarter',
  'waxing_gibbous': 'waxing gibbous',
  'full_moon': 'full moon',
  'waning_gibbous': 'waning gibbous',
  'last_quarter': 'last quarter',
  'waning_crescent': 'waning crescent'
};

// Removed conflicting local definitions - now imported from @/types/celestial
// Planet, PlanetaryAlignment, CelestialPosition, PlanetaryAspect are now imported

export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  minutes?: number;
  /**
   * Exact ecliptic longitude value (0-360 degrees) used by precise astronomy helpers.
   * Several astro-utility modules reference `exactLongitude`; adding it here prevents
   * unknown-property errors while keeping the field optional.
   */
  exactLongitude?: number;
  element?: string;
  dignity?: string;
  isRetrograde?: boolean;
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
  | 'conjunction' 
  | 'sextile' 
  | 'square' 
  | 'trine' 
  | 'opposition' 
  | 'quincunx' 
  | 'semisextile'
  | 'semisquare'
  | 'sesquisquare'
  | 'quintile'
  | 'biquintile';

// Removed conflicting PlanetaryAspect, DignityType, and CelestialPosition - now imported from @/types/celestial

// Re-export AstrologicalState from celestial types
export type { AstrologicalState } from "@/types/celestial";

export const COOKING_METHOD_THERMODYNAMICS = {};

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
    unit?: 'F' | 'C';
  };
  duration?: {
    min?: number;
    max?: number;
    unit?: 'minutes' | 'hours';
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
  difficulty?: 'easy' | 'medium' | 'hard'[];
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
  | 'Italian' | 'Mexican' | 'Asian' | 'Indian' | 'Mediterranean' 
  | 'American' | 'French' | 'Thai' | 'Chinese' | 'Japanese'
  | 'Greek' | 'Spanish' | 'Middle-Eastern' | 'Moroccan' | 'Ethiopian'
  | 'Caribbean' | 'Brazilian' | 'Korean' | 'Vietnamese' | 'Fusion';

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
  | 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Dairy-Free' | 'Nut-Free'
  | 'Shellfish-Free' | 'Soy-Free' | 'Egg-Free' | 'Low-Carb' | 'Low-Fat' | 'Keto'
  | 'Paleo' | 'Whole30' | 'Low-Sodium' | 'Sugar-Free' | 'Raw'
  | 'Halal' | 'Kosher' | 'Pescatarian' | 'Flexitarian';

// TimeFactors type (causing errors in RecipeGrid.tsx)
export interface TimeFactors {
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
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
  intensity?: number; // 1-10 scale, made optional to match usage
  complexity?: number; // 1-10 scale
  balance?: {
    sweet?: number;
    sour?: number;
    salty?: number;
    bitter?: number;
    umami?: number;
    spicy?: number;
  };
  aromatics?: string[];
  mouthfeel?: string[];
  
  // Enhanced properties for ingredientUtils.ts support
  spice?: number;
  sweet?: number;
  richness?: number;
  earthy?: number;
  aromatic?: number;
  density?: number;
  astringent?: number;
  clarity?: number;
  
  // Additional properties from balance (no duplicates)
  umami?: number;
  bitter?: number;
  sour?: number;
}

// MethodRecommendation and MethodRecommendationOptions (causing 2 errors each)
export interface MethodRecommendationOptions {
  elementalPreference?: Element[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  timeConstraints?: {
    maxPrepTime?: number;
    maxCookTime?: number;
  };
  equipment?: string[];
  dietaryRestrictions?: DietaryRestriction[];
  flavorProfile?: FlavorProfile;
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
export type TarotSuit = 'cups' | 'wands' | 'swords' | 'pentacles';

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

export type ChakraPosition = 'root' | 'sacral' | 'solarPlexus' | 'heart' | 'throat' | 'thirdEye' | 'crown';

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
  aspectInfluences?: Array<{type: AspectType, planets: string[], influence: number}>; // Detailed aspect influences
  energyStateBalance?: EnergyStateProperties; // Energy state balance calculations
  chakraEmphasis?: ChakraEnergies; // Chakra emphasis calculations
  // Alchemizer engine integration properties
  thermodynamicMetrics?: ThermodynamicMetrics; // Heat, entropy, reactivity, gregsEnergy, kalchm, monica
  kalchm?: number; // Kalchm constant for alchemical calculations
  monica?: number; // Monica constant for alchemical calculations
  // Current celestial position properties
  currentZodiacSign?: ZodiacSign; // Current zodiac sign for compatibility calculations
}

// Export ElementalCharacter from constants
export type { ElementalCharacter } from '@/constants/planetaryElements';

// Add missing type aliases for compatibility
export type AstrologicalInfluence = _AstrologicalInfluence;
export type PlanetaryPositionsType = Record<string, PlanetaryPosition>;
export type AlchemicalState = AstrologicalProfile; // Using existing similar interface
export type CookingMethodProfile = CookingMethodModifier; // Alias for compatibility
export type timeFactors = TimeFactors; // Lowercase version
export type alchemicalValues = AlchemicalValues; // Lowercase version

// Additional missing type exports
export type BaseIngredient = Ingredient; // Alias for compatibility
export type RecipeData = Recipe; // Alias for compatibility
// Removed local AlchemicalProperty definition - now imported from @/types/celestial

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
// ---------------------------------------------------------------------------
