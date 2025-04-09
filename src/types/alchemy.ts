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
export type LunarPhase = LunarPhaseWithSpaces;

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

export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  element?: string;
  dignity?: string;
  isRetrograde?: boolean;
}

export interface PlanetaryAlignment {
  sun: PlanetaryPosition;
  moon: PlanetaryPosition;
  mercury: PlanetaryPosition;
  venus: PlanetaryPosition;
  mars: PlanetaryPosition;
  jupiter: PlanetaryPosition;
  saturn: PlanetaryPosition;
  uranus: PlanetaryPosition;
  neptune: PlanetaryPosition;
  pluto: PlanetaryPosition;
  [key: string]: PlanetaryPosition; // Allow indexing with string
}

export interface PlanetaryHarmony {
  [key: string]: Record<Planet, number>;
  sun: Record<Planet, number>;
  moon: Record<Planet, number>;
  mercury: Record<Planet, number>;
  venus: Record<Planet, number>;
  mars: Record<Planet, number>;
  jupiter: Record<Planet, number>;
  saturn: Record<Planet, number>;
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

// Define PlanetaryAspect
export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
  strength: number;
  planets?: string[];
  influence?: number;
  additionalInfo?: Record<string, any>;
}

// Define Dignity type
export type DignityType = 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Neutral';

export interface CelestialPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  position?: number;
  retrograde?: boolean;
  element?: Element;
  dignity?: DignityType;
}

export interface AstrologicalState {
  currentZodiac: ZodiacSign;
  moonPhase: LunarPhase;
  currentPlanetaryAlignment: Record<string, CelestialPosition>;
  activePlanets: string[];
  planetaryPositions: Record<string, any>;
  lunarPhase: LunarPhase;
  zodiacSign: ZodiacSign;
  planetaryHours: Planet;
  planetaryHour?: Planet | string;
  astrologicalInfluences?: AstrologicalInfluence[];
  aspects: PlanetaryAspect[];
  
  // Add these properties to support both usages
  date?: string;
  sunSign?: ZodiacSign;
  moonSign?: ZodiacSign;
  dominantPlanets?: string[];
  planetaryAspects?: string[];
  planetaryAlignment?: Record<string, { sign: string; degree: number }>;

  // Additional properties used throughout the codebase
  tarotElementBoosts: Record<string, number>;
  tarotPlanetaryBoosts: Record<string, number>;
  sunDegree?: number;
  moonSignElement?: Element;
  dominantElement?: Element;
}

// ========== THERMODYNAMIC TYPES ==========

// Basic thermodynamic properties used in astrologyUtils
export interface BasicThermodynamicProperties {
  heat: number;      // 0-1: cold to hot
  entropy: number;   // 0-1: ordered to chaotic
  reactivity: number; // 0-1: stable to reactive
}

/**
 * Enhanced elemental characteristics for comprehensive element descriptions
 */
export interface ElementalCharacteristics {
  qualities: string[];
  keywords: string[];
  foods: string[];
  cookingTechniques: string[];
  flavorProfiles: string[];
  seasonalAssociations: string[];
  healthBenefits: string[];
  complementaryIngredients: string[];
  moodEffects: string[];
  culinaryHerbs: string[];
  timeOfDay: string[];
}

/**
 * Complete elemental profile that includes all characteristics
 */
export interface ElementalProfile {
  properties: ElementalProperties;
  characteristics: ElementalCharacteristics;
  affinities?: ElementalRatio;
  interactions?: ElementalInteraction[];
}

// Expanded thermodynamic properties used elsewhere
export interface ThermodynamicProperties {
  heat: number;       // Rate of thermal energy transfer to ingredients
  entropy: number;    // Degree of structural breakdown in ingredients
  reactivity: number; // Rate of chemical interactions between ingredients
  energy: number;     // Overall energy transfer efficiency
}

export interface EnergyStateProps extends BasicThermodynamicProperties {
  resonance: number; // 0-1: How well energies harmonize
  potential: number; // 0-1: Stored energetic potential
}

export interface EnergySuitability {
  morning: number;
  noon: number;
  evening: number;
  night: number;
  seasonMultipliers: Record<Season, number>;
}

// ========== COOKING & RECIPE TYPES ==========

export type CookingMethod = 
  | 'baking' 
  | 'boiling' 
  | 'roasting' 
  | 'steaming' 
  | 'frying' 
  | 'grilling' 
  | 'sauteing' 
  | 'simmering' 
  | 'poaching' 
  | 'braising' 
  | 'stir-frying'
  | 'fermenting'
  | 'pickling'
  | 'curing'
  | 'infusing'
  | 'distilling'
  | 'raw'
  | 'fermentation'
  | 'smoking'
  | 'sous_vide'
  | 'pressure_cooking'
  | 'spherification'
  | 'cryo_cooking'
  | 'emulsification'
  | 'gelification'
  | 'broiling';

export interface CookingTime {
  preparation: number; // minutes
  cooking: number; // minutes
  resting: number; // minutes
  total: number; // minutes
  planetaryWindows?: {
    optimal: Planet[];
    timing: string;
  };
}

export interface NutritionalProfile {
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  phytonutrients?: Record<string, number>;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  element: Element;
  category?: string;
  elementalProperties?: ElementalProperties;
  energyValues?: ThermodynamicProperties;
  planetaryRuler?: Planet;
  swaps?: string[];
  seasonality?: Season[];
  nutritionalProfile?: NutritionalProfile;
  nutritionalScore?: number;
}

export interface EnhancedIngredient extends Ingredient {
  foodGroup: string;
  foodType: string;
  alchemy: {
    day: number[]; // [heat, entropy, reactivity]
    night: number[]; // [heat, entropy, reactivity]
  };
  processingEffects: Record<CookingMethod, ElementalModifier>;
  alchemicalActions: ('dissolve' | 'coagulate' | 'calcine' | 'ferment')[];
  nutritionalImpact?: {
    elementalBoost: ElementalProperties;
    energyModifier: number;
  };
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  ingredients: Ingredient[];
  cookingMethod: CookingMethod;
  timeToMake: number;
  numberOfServings: number;
  elementalProperties?: ElementalProperties;
  energyProfile?: ThermodynamicProperties;
  tags?: string[];
  season?: string[];
  nutrition?: NutritionalInfo;
  mealType?: string[];
  astrologicalAffinities?: {
    planets: Planet[];
    signs: ZodiacSign[];
    lunarPhases: LunarPhase[];
  };
  zodiacInfluences?: ZodiacSign[];
  lunarPhaseInfluences?: LunarPhaseWithSpaces[];
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: string[];
  minerals?: string[];
}

export interface PreparationMethod {
  name: string;
  element: Element;
  planetaryRuler: Planet;
  energyEffects: ThermodynamicProperties;
  timing: {
    optimal: Planet[];
    acceptable: Planet[];
    avoid: Planet[];
  };
  cookingMethod: CookingMethod;
  techniqueTips: string[];
  seasonalModifiers: Record<Season, number>;
}

// ========== FOOD ALCHEMY TYPES ==========

export type EffectType = 'enhance' | 'balance' | 'subtle' | 'transform' | 'harmonize' | 'potentiate' | 'diminish';

export interface CombinationEffect {
  name?: string;
  description?: string;
  ingredients?: string[];
  type?: EffectType;
  effect: EffectType;
  strength?: number;
  modifier: number;
  notes?: string;
  elements?: Partial<ElementalProperties>;
  conditions?: {
    cookingMethod?: string[];
    season?: string[];
    temperature?: string[];
    lunarPhase?: LunarPhase[];
  };
}

export interface FoodCorrespondence {
  food: string;
  foodGroup: string;
  foodType: string;
  element: Element;
  planet: Planet;
  alchemy: {
    day: number[];
    night: number[];
  };
  energyValues: ThermodynamicProperties;
  affinities?: string[];
  contraindications?: string[];
}

export interface FoodCompatibility {
  score: number;
  recommendations: string[];
  warnings: string[];
  preparationMethods: PreparationMethod[];
  elementalHarmony: number;
  planetaryAlignment: number;
  seasonalAlignment: number;
}

export interface SystemState {
  elements: Record<Element, number>;
  metrics: ThermodynamicProperties;
  currentSeason: Season;
  dominantElement: Element;
  astrologicalState: AstrologicalState;
}

// ========== CALCULATION TYPES ==========

export interface CombinationResult {
  resultingProperties: ElementalProperties;
  energyState: {
    heat: number;
    entropy: number;
    reactivity: number;
    energy: number;
  };
  potency: number;
  dominantElement: Element;
  warnings: string[];
  alchemicalRecommendations: string[];
}

export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';

export interface TemperatureEffect {
  range: {
    min: number;
    max: number;
  };
  elementalEffect: ElementalProperties;
  thermodynamicEffect: ThermodynamicProperties;
}

export interface ElementalTransformation {
  initial: ElementalProperties;
  cooking: CookingMethod;
  duration: number;
  temperature: number;
  result: ElementalProperties;
  energyChange: ThermodynamicProperties;
}

export interface CookingFormula {
  baseIngredients: string[];
  method: CookingMethod;
  elementalRatios: ElementalProperties;
  timeCoefficient: number;
  planetaryBoosts: Partial<Record<Planet, number>>;
  result: {
    elementalProperties: ElementalProperties;
    energyState: ThermodynamicProperties;
  };
}

// ========== STATE MANAGEMENT ==========

export interface AlchemicalState {
  elementalState: ElementalProperties;
  energyState: ThermodynamicProperties;
  season: Season;
  astrologicalState: AstrologicalState;
  currentTime: Date;
  elementalPreference: ElementalProperties;
  planetaryHour: Planet;
  celestialPositions: {
    sun?: {
      sign: string;
      // Add other properties as needed
    };
    // Add other celestial bodies as needed
  };
}

export type AlchemicalAction = 
  | { type: 'UPDATE_ELEMENTS'; payload: ElementalProperties }
  | { type: 'UPDATE_ENERGY_STATE'; payload: ThermodynamicProperties }
  | { type: 'SET_SEASON'; payload: Season }
  | { type: 'UPDATE_LUNAR_PHASE'; payload: LunarPhase }
  | { type: 'UPDATE_SUN_SIGN'; payload: ZodiacSign }
  | { type: 'UPDATE_MOON_SIGN'; payload: ZodiacSign }
  | { type: 'UPDATE_PLANETARY_HOUR'; payload: Planet }
  | { type: 'UPDATE_ASTROLOGICAL_STATE'; payload: AstrologicalState };

// ========== ADDITIONAL PROPERTIES ==========

export interface ElementalInfluence {
  lunarPhaseStrength: number;
  sunSignStrength: number;
  moonSignStrength: number;
  planetaryHourStrength: number;
}

export interface CookingMethodProperties {
  elementalEffect: ElementalProperties;
  energeticEffect: ThermodynamicProperties;
  suitable_for: string[];
  benefits: string[];
  duration: {
    min: number;
    max: number;
  };
  planetaryRulers: Planet[];
}

export interface CookingMethodData {
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];
  astrologicalInfluences?: {
    favorableZodiac?: ZodiacSign[];
    unfavorableZodiac?: ZodiacSign[];
    dominantPlanets?: string[];
  };
  chemicalChanges?: Record<string, boolean>;
  toolsRequired?: string[];
  optimalTemperatures?: Record<string, number>;
  safetyFeatures?: string[];
}

export interface FlavorProfile {
  elementalProperties: ElementalProperties;
  taste: string[];
  intensity: number;
  pairings: string[];
  seasonalPeak?: Season[];
  description: string;
  thermodynamicProperties: ThermodynamicProperties;
  astrologicalSignature?: {
    planets: Planet[];
    signs: ZodiacSign[];
  };
}

// ========== MAPPING & HELPER TYPES ==========

export interface IngredientMapping {
  name: string;
  elementalProperties: ElementalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
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
  
  // Add missing properties
  regionalPreparations?: Record<string, any>;
  preparation?: Record<string, any>;
  storage?: Record<string, any>;
  
  // Food alchemy specific properties
  alchemicalProperties?: {
    day: ThermodynamicProperties;
    night: ThermodynamicProperties;
    transformations: Record<CookingMethod, ElementalModifier>;
  };
  
  // Allow additional properties
  [key: string]: any;
}

export interface PlanetaryFoodAssociation {
  planet: Planet;
  foods: string[];
  qualities: string[];
  cookingMethods: CookingMethod[];
  elementalAffinities: Element[];
  boostTimes: {
    dayOfWeek: number;
    hourOfDay: number[];
  };
}

export interface AlchemicalPairingMatrix {
  [ingredientA: string]: {
    [ingredientB: string]: {
      harmony: number;
      potentiation: number;
      transformation: string | null;
      notes: string;
    }
  }
}

export interface AlchemicalCalculationResult {
  score: number;
  elementalMatch: number;
  seasonalMatch: number;
  astrologicalMatch: number;
  dominantElement: keyof ElementalProperties;
  recommendations: string[];
  warnings: string[];
}

export interface RecipeHarmonyResult extends AlchemicalCalculationResult {
  recipeSpecificBoost: number;
  optimalTimingWindows: string[];
  elementalMultipliers: Record<string, number>;
}

// ========== COMPONENT PROPS ==========

export interface RecipeCardProps {
  recipe: Recipe;
  score: number;
  elements: ElementalProperties;
  energyState: ThermodynamicProperties;
  dominantElements: [Element, number][];
  isExpanded?: boolean;
  onToggle?: () => void;
  currentSign?: ZodiacSign;
  currentSeason?: Season;
  planetaryHour?: Planet;
}

export interface RecipeCalculatorProps {
  onCalculate: (result: CombinationResult) => void;
  initialState?: ElementalProperties;
  initialEnergyState?: ThermodynamicProperties;
}

export interface RecipeRecommendationsProps {
  filters: {
    servingSize: string;
    dietaryPreference: string;
    cookingTime: string;
    elementalFocus?: Element;
    planetaryInfluence?: Planet;
  };
  astrologicalState: AstrologicalState;
}

export interface CookingTimerProps {
  method: CookingMethod;
  duration: number;
  planetaryHour: Planet;
  optimalPlanets: Planet[];
  onCompletion: () => void;
}

export interface AstrologicalFoodCalendarProps {
  month: number;
  year: number;
  onDateSelect: (date: Date, astroState: AstrologicalState) => void;
  favoredFoods: Record<string, string[]>;
}

// Define the planetary harmony matrix based on your Food Alchemy System
export const PLANETARY_HARMONY_MATRIX: PlanetaryHarmony = {
  sun: {
    sun: 1.0, moon: -0.5, mercury: 0.3, venus: 0.4, mars: 0.6,
    jupiter: 0.8, saturn: -0.3, uranus: 0.2, neptune: 0.1, pluto: 0.5
  },
  moon: {
    sun: -0.5, moon: 1.0, mercury: 0.4, venus: 0.6, mars: -0.4,
    jupiter: 0.5, saturn: -0.2, uranus: -0.3, neptune: 0.7, pluto: 0.2
  },
  mercury: {
    sun: 0.3, moon: 0.4, mercury: 1.0, venus: 0.7, mars: 0.3,
    jupiter: 0.4, saturn: 0.5, uranus: 0.6, neptune: 0.3, pluto: 0.4
  },
  venus: {
    sun: 0.4, moon: 0.6, mercury: 0.7, venus: 1.0, mars: -0.3,
    jupiter: 0.6, saturn: 0.2, uranus: 0.1, neptune: 0.5, pluto: 0.0
  },
  mars: {
    sun: 0.6, moon: -0.4, mercury: 0.3, venus: -0.3, mars: 1.0,
    jupiter: 0.4, saturn: 0.3, uranus: 0.5, neptune: -0.2, pluto: 0.7
  },
  jupiter: {
    sun: 0.8, moon: 0.5, mercury: 0.4, venus: 0.6, mars: 0.4,
    jupiter: 1.0, saturn: -0.2, uranus: 0.3, neptune: 0.4, pluto: 0.2
  },
  saturn: {
    sun: -0.3, moon: -0.2, mercury: 0.5, venus: 0.2, mars: 0.3,
    jupiter: -0.2, saturn: 1.0, uranus: 0.4, neptune: 0.3, pluto: 0.6
  }
};

// Elemental associations for planets
export const PLANET_ELEMENT_MAPPING: Record<Planet, Element> = {
  sun: 'Fire',
  moon: 'Water',
  mercury: 'Air',
  venus: 'Earth',
  mars: 'Fire',
  jupiter: 'Air',
  saturn: 'Earth',
  uranus: 'Air',
  neptune: 'Water',
  pluto: 'Earth'
};

// Cooking method elemental associations
export const COOKING_METHOD_ELEMENTS: Record<CookingMethod, Element> = {
  'roasting': 'Fire',
  'grilling': 'Fire',
  'baking': 'Earth',
  'boiling': 'Water',
  'fermenting': 'Water',
  'pickling': 'Water',
  'curing': 'Air',
  'infusing': 'Water',
  'distilling': 'Fire',
  'steaming': 'Water',
  'frying': 'Fire',
  'raw': 'Air',
  'braising': 'Water',
  'fermentation': 'Water',
  'smoking': 'Air',
  'sous_vide': 'Water',
  'pressure_cooking': 'Water',
  'spherification': 'Water',
  'cryo_cooking': 'Air',
  'emulsification': 'Water',
  'gelification': 'Earth',
  'broiling': 'Fire',
  'stir-frying': 'Fire',
  'sauteing': 'Fire',
  'simmering': 'Water',
  'poaching': 'Water'
};

// Add the thermodynamic effects for cooking methods
export const COOKING_METHOD_THERMODYNAMICS: Record<CookingMethod, BasicThermodynamicProperties> = {
  'roasting': { heat: 0.8, entropy: 0.4, reactivity: 0.6 },
  'grilling': { heat: 0.9, entropy: 0.5, reactivity: 0.7 },
  'baking': { heat: 0.6, entropy: 0.3, reactivity: 0.4 },
  'boiling': { heat: 0.7, entropy: 0.6, reactivity: 0.5 },
  'fermenting': { heat: 0.2, entropy: 0.8, reactivity: 0.7 },
  'pickling': { heat: 0.3, entropy: 0.7, reactivity: 0.6 },
  'curing': { heat: 0.4, entropy: 0.6, reactivity: 0.5 },
  'infusing': { heat: 0.3, entropy: 0.5, reactivity: 0.4 },
  'distilling': { heat: 0.8, entropy: 0.7, reactivity: 0.6 },
  'steaming': { heat: 0.3, entropy: 0.5, reactivity: 0.4 },
  'frying': { heat: 0.9, entropy: 0.7, reactivity: 0.8 },
  'raw': { heat: 0.1, entropy: 0.2, reactivity: 0.3 },
  'braising': { heat: 0.5, entropy: 0.6, reactivity: 0.4 },
  'fermentation': { heat: 0.2, entropy: 0.8, reactivity: 0.7 },
  'smoking': { heat: 0.4, entropy: 0.7, reactivity: 0.5 },
  'sous_vide': { heat: 0.3, entropy: 0.2, reactivity: 0.3 },
  'pressure_cooking': { heat: 0.7, entropy: 0.5, reactivity: 0.6 },
  'spherification': { heat: 0.2, entropy: 0.4, reactivity: 0.5 },
  'cryo_cooking': { heat: 0.1, entropy: 0.3, reactivity: 0.4 },
  'emulsification': { heat: 0.3, entropy: 0.6, reactivity: 0.5 },
  'gelification': { heat: 0.2, entropy: 0.5, reactivity: 0.3 },
  'broiling': { heat: 0.8, entropy: 0.6, reactivity: 0.7 },
  'stir-frying': { heat: 0.9, entropy: 0.6, reactivity: 0.8 },
  'sauteing': { heat: 0.9, entropy: 0.6, reactivity: 0.8 },
  'simmering': { heat: 0.3, entropy: 0.5, reactivity: 0.4 },
  'poaching': { heat: 0.3, entropy: 0.5, reactivity: 0.4 }
};

// Lunar phase effect multipliers
export const LUNAR_PHASE_MULTIPLIERS: Record<LunarPhase, BasicThermodynamicProperties> = {
  'new moon': { heat: 0.7, entropy: 0.5, reactivity: 0.6 },
  'waxing crescent': { heat: 0.8, entropy: 0.6, reactivity: 0.7 },
  'first quarter': { heat: 0.9, entropy: 0.7, reactivity: 0.8 },
  'waxing gibbous': { heat: 1.0, entropy: 0.8, reactivity: 0.9 },
  'full moon': { heat: 1.1, entropy: 1.0, reactivity: 1.0 },
  'waning gibbous': { heat: 0.9, entropy: 0.9, reactivity: 0.8 },
  'last quarter': { heat: 0.8, entropy: 0.8, reactivity: 0.7 },
  'waning crescent': { heat: 0.7, entropy: 0.6, reactivity: 0.6 }
};

// Add new type definitions for elemental state
export interface TemporalInfluence {
  timestamp: Date;
  planetaryAlignment: PlanetaryAlignment;
  lunarPhase: LunarPhase;
  seasonalModifier: number;
}

export interface AstrologicalInfluence {
  name?: string;
  description?: string;
  favorableZodiac?: ZodiacSign[];
  unfavorableZodiac?: ZodiacSign[];
  rulingPlanets?: string[];
  astrologicalInfluences?: string[];
  planet?: string;
  sign?: ZodiacSign;
  element?: Element;
  strength?: number;
}

// Update ElementalAffinity to support both use cases
export interface ElementalAffinity {
  // Core properties from standardized version
  base: string;
  decanModifiers?: Record<string, any>;
  
  // Properties needed by alchemicalEngine
  element?: Element | string;
  strength?: number;
  source?: string;
  secondary?: string; // For backward compatibility
}

// Update the AstrologicalProfile interface
export interface AstrologicalProfile {
  elementalAffinity: ElementalAffinity; // Now always an object
  rulingPlanets: string[];
  favorableZodiac?: ZodiacSign[];
  // ...other properties
}

// Replace traditional season with zodiac-based seasons
export type ZodiacSeason = ZodiacSign;

// Tarot-related types
export interface TarotCard {
  name: string;
  suit: string;
  value: number;
  description: string;
  meaning: {
    upright: string[];
    reversed: string[];
  };
  elementalAssociation?: Element;
  zodiacAssociation?: ZodiacSign;
  planetaryAssociation?: string;
}

export interface TarotCards {
  minor: TarotCard;
  major: TarotCard;
  planetaryCards?: Record<string, TarotCard>;
}

export type ChakraPosition = 'root' | 'sacral' | 'solar plexus' | 'heart' | 'throat' | 'brow' | 'crown';
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles' | 'major';
export type EnergyState = 'Spirit' | 'Substance' | 'Essence' | 'Matter';
export type ElementalState = 'Balanced' | 'Fire-dominant' | 'Water-dominant' | 'Earth-dominant' | 'Air-dominant' | 'Unbalanced';

export interface EnergyStateProperties {
  Spirit: number;
  Substance: number;
  Essence: number;
  Matter: number;
  [key: string]: number;
}

export interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  brow: number;
  crown: number;
  [key: string]: number;
}

export interface FreeEnergyComponents {
  entropy: number;
  enthalpy: number;
  heat: number;
  reactivity: number;
}

export interface CelestialBody {
  name: string;
  influence: number;
  effect?: string;
}

export interface CelestialAlignment {
  date: string;
  zodiacSign: ZodiacSign;
  dominantPlanets: CelestialBody[];
  lunarPhase: string;
  elementalBalance: ElementalProperties;
  aspectInfluences: PlanetaryAspect[];
  astrologicalInfluences: string[];
  energyStateBalance?: EnergyStateProperties;
  chakraEmphasis?: ChakraEnergies;
}

// This is a duplicate of the interface already defined above
// Removing the duplicate and using a type alias instead
export type ElementalProfileAlias = ElementalProperties;

export interface AstrologicalEffects {
  dignity: LowercaseElementalProperties;
  aspect: LowercaseElementalProperties;
  stellium: LowercaseElementalProperties;
  house: Record<string, number>;
  joy: LowercaseElementalProperties;
}

export interface ZodiacPosition {
  sign: ZodiacSign;
  degree: number;
}

// Add missing types needed for FilterSection.tsx
export interface FilterOptions {
  cookingTime: string;
  elementalFocus: Element | null;
  mealType: string;
  seasonality: Season | null;
  difficulty: string;
}

export interface NutritionPreferences {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  priority: 'balanced' | 'protein' | 'low-carb' | 'low-fat';
}

// Add TimeOfDay type if it's missing
export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

// Add ElementalSummary type
export interface ElementalSummary {
    totalFire: number;
    totalWater: number;
    totalEarth: number;
    totalAir: number;
    dominantElement: Element;
}

/**
 * Standardized AlchemicalResult interface that unifies different implementations
 * across the codebase, including those in:
 * - calculations/alchemicalEngine.ts
 * - calculations/alchemicalCalculations.ts
 * - utils/alchemyInitializer.ts
 */
export interface StandardizedAlchemicalResult {
  // Core elemental properties - using capitalized keys for backward compatibility
  elementalBalance: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  
  // Using 'Total Effect Value' for backward compatibility with original implementation
  'Total Effect Value'?: ElementalProperties;
  
  // Core alchemical properties
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  
  // Result summary
  dominantElement: string;
  
  // Optional recommendation
  recommendation?: string;
  
  // Thermodynamic properties
  heat?: number;
  entropy?: number;
  reactivity?: number;
  energy?: number;
  
  // Modality information
  '#Cardinal'?: number;
  '#Fixed'?: number;
  '#Mutable'?: number;
  '%Cardinal'?: number;
  '%Fixed'?: number;
  '%Mutable'?: number;
  'Dominant Modality'?: string;
  
  // Astrological effects
  'Alchemy Effects'?: {
    'Total Spirit': number;
    'Total Essence': number;
    'Total Matter': number;
    'Total Substance': number;
    'Total Day Essence': number;
    'Total Night Essence': number;
    [key: string]: number;
  };
  'Total Chart Absolute Effect'?: number;
  'All Conjunctions'?: any[];
  'All Trines'?: any[];
  'All Squares'?: any[];
  'All Oppositions'?: any[];
  'Stelliums'?: any[];
  'Signs'?: Record<string, any>;
  'Planets'?: Record<string, any>;
  'Sun Sign'?: string;
  'Major Arcana'?: Record<string, string>;
  'Minor Arcana'?: Record<string, string>;
  'Chart Ruler'?: string;
  'Total Dignity Effect'?: ElementalProperties;
  'Total Decan Effect'?: ElementalProperties;
  'Total Degree Effect'?: ElementalProperties;
  'Total Aspect Effect'?: ElementalProperties;
  'Total Elemental Effect'?: ElementalProperties;
  
  // Allow other properties
  [key: string]: any;
}

export interface Decan {
  ruler: string;
  element: Element;
  degree: number;
}

export interface CuisineType {
  name: string;
  description?: string;  // Make description optional
  id?: string;  // Make id optional for chinese.ts style
  dishes?: {
    breakfast?: {
      all?: any[];
      summer?: any[];
      winter?: any[];
      spring?: any[];
      autumn?: any[];
      fall?: any[];  // Support both autumn and fall
    };
    lunch?: {
      all?: any[];
      summer?: any[];
      winter?: any[];
      spring?: any[];
      autumn?: any[];
      fall?: any[];
    };
    dinner?: {
      all?: any[];
      summer?: any[];
      winter?: any[];
      spring?: any[];
      autumn?: any[];
      fall?: any[];
    };
    dessert?: {
      all?: any[];
      summer?: any[];
      winter?: any[];
      spring?: any[];
      autumn?: any[];
      fall?: any[];
    } | any[];
    desserts?: any[];
    snacks?: any[];
  };
  elementalState?: ElementalProperties;
  elementalProperties?: ElementalProperties;  // Support elementalProperties name
  signatureTechniques?: string[];
  keyIngredients?: string[];
  seasonalIngredients?: Record<Season, string[]>;
  regions?: string[];
  flavorProfiles?: string[];
  astrologicalInfluence?: AstrologicalInfluence[];
  astrologicalInfluences?: string[];  // Support string array version
  traditionalSauces?: Record<string, any>;
  motherSauces?: Record<string, any>;
  sauceRecommender?: Record<string, any>;
  cookingTechniques?: any[];
  regionalCuisines?: Record<string, any>;
  [key: string]: any;
}

// ========== RECIPE FILTERING TYPES ==========

export type DietaryRestriction = 
  | 'vegan' 
  | 'vegetarian' 
  | 'pescatarian' 
  | 'dairy-free' 
  | 'gluten-free' 
  | 'nut-free' 
  | 'keto' 
  | 'paleo' 
  | 'low-carb' 
  | 'low-fat';